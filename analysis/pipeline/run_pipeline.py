"""심부전 3축 분석 파이프라인 — 코호트 추출부터 SHAP까지 한 번에.

지금은 sample_data/의 가짜 CSV로 "코드가 끝까지 에러 없이 도는지"만 확인하는
스모크 테스트입니다. 표본이 15명뿐이라 나오는 지표(AUROC 등)는 의미가 없고,
파이프라인 구조 검증 목적입니다.

본선 당일 사용법:
  1) 02_concept_id_checklist.md를 채워 concepts.py 값을 실제 Athena 값으로 교체
  2) db.py의 connect_postgres()로 실제 DB에 접속하도록 --backend postgres 사용
  3) python run_pipeline.py --backend postgres --dsn "..." --out ../results/model_output.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Windows 콘솔(cp949 등)에서도 한글 로그가 깨지지 않도록 UTF-8 강제
for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        _stream.reconfigure(encoding="utf-8")

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import brier_score_loss, roc_auc_score, roc_curve
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

import concepts
import db

MALE_GENDER_CONCEPT_ID = 8507
FEMALE_GENDER_CONCEPT_ID = 8532

FEATURE_AXIS = {
    "bnp": 1,
    "egfr": 1,
    "potassium": 1,
    "conut_score": 2,
    "albumin": 2,
    "gdmt_active_count": 3,
    "pdc_proxy": 3,
}
FEATURE_LABEL_KO = {
    "bnp": "BNP",
    "egfr": "eGFR",
    "potassium": "칼륨(K+)",
    "conut_score": "CONUT 점수",
    "albumin": "알부민",
    "gdmt_active_count": "GDMT 활성 성분 수",
    "pdc_proxy": "복약순응(PDC 근사)",
}


def build_sql() -> str:
    template = (Path(__file__).parent.parent / "03_cohort_extraction.sql").read_text(encoding="utf-8")
    gdmt_ids = ",".join(str(c) for c in concepts.GDMT_INGREDIENT_CONCEPT_IDS)
    return template.format(
        hf_root_concept_id=concepts.HF_ROOT_CONCEPT_ID,
        inpatient_visit_concept_id=concepts.INPATIENT_VISIT_CONCEPT_ID,
        bnp_concept_id=concepts.BNP_CONCEPT_ID,
        creatinine_concept_id=concepts.CREATININE_CONCEPT_ID,
        potassium_concept_id=concepts.POTASSIUM_CONCEPT_ID,
        albumin_concept_id=concepts.ALBUMIN_CONCEPT_ID,
        cholesterol_concept_id=concepts.CHOLESTEROL_CONCEPT_ID,
        lymphocyte_concept_id=concepts.LYMPHOCYTE_CONCEPT_ID,
        gdmt_ingredient_concept_ids=gdmt_ids,
    )


def ckd_epi_2021(creatinine: float, age: float, gender_concept_id: int) -> float | None:
    """CKD-EPI 2021 (race-free) creatinine 기반 eGFR. 단위: mL/min/1.73m^2."""
    if creatinine is None or pd.isna(creatinine) or creatinine <= 0:
        return None
    is_female = gender_concept_id == FEMALE_GENDER_CONCEPT_ID
    kappa = 0.7 if is_female else 0.9
    alpha = -0.241 if is_female else -0.302
    sex_factor = 1.012 if is_female else 1.0
    scr_over_kappa = creatinine / kappa
    min_term = min(scr_over_kappa, 1) ** alpha
    max_term = max(scr_over_kappa, 1) ** -1.200
    return 142 * min_term * max_term * (0.9938 ** age) * sex_factor


def conut_score(albumin: float | None, cholesterol: float | None, lymphocyte: float | None) -> float | None:
    """Ignacio de Ulíbarri CONUT 점수 (0~12, 높을수록 영양불량 심함).

    단위 가정: albumin(g/dL), cholesterol(mg/dL), lymphocyte(cells/mm^3).
    실제 데이터에서는 unit_concept_id로 단위를 반드시 재확인할 것.
    """
    parts = []
    if albumin is not None and not pd.isna(albumin):
        if albumin >= 3.5: parts.append(0)
        elif albumin >= 3.0: parts.append(2)
        elif albumin >= 2.5: parts.append(4)
        else: parts.append(6)
    if cholesterol is not None and not pd.isna(cholesterol):
        if cholesterol >= 180: parts.append(0)
        elif cholesterol >= 140: parts.append(1)
        elif cholesterol >= 100: parts.append(2)
        else: parts.append(3)
    if lymphocyte is not None and not pd.isna(lymphocyte):
        if lymphocyte >= 1600: parts.append(0)
        elif lymphocyte >= 1200: parts.append(1)
        elif lymphocyte >= 800: parts.append(2)
        else: parts.append(3)
    return sum(parts) if parts else None


def pdc_proxy(avg_gap_days: float | None) -> float | None:
    """진짜 PDC/MPR이 아니라 drug_era.GAP_DAYS 기반 근사치.

    TODO(본선): 실제 PDC = 관찰창 내 커버리지 일수 / 관찰창 일수로
    drug_exposure를 일 단위로 펼쳐 재계산해야 함. 지금은 파이프라인
    구조 검증용 근사식만 둔다.
    """
    if avg_gap_days is None or pd.isna(avg_gap_days):
        return None
    return max(0.0, min(100.0, 100.0 - avg_gap_days / 3.65))


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    today_year = 2024  # 실제 사용 시 index_admission_date 연도 기준으로 계산
    df = df.copy()
    df["age"] = today_year - df["year_of_birth"]
    df["egfr"] = df.apply(
        lambda r: ckd_epi_2021(r["creatinine"], r["age"], r["gender_concept_id"]), axis=1
    )
    df["conut_score"] = df.apply(
        lambda r: conut_score(r["albumin"], r["total_cholesterol"], r["lymphocyte_count"]), axis=1
    )
    df["pdc_proxy"] = df["avg_gap_days"].apply(pdc_proxy)
    return df


def train_and_evaluate(df: pd.DataFrame, outcome_col: str, feature_cols: list[str]):
    X = df[feature_cols].apply(pd.to_numeric, errors="coerce")
    X = X.fillna(X.median(numeric_only=True))
    y = df[outcome_col].astype(int)

    if y.nunique() < 2:
        return None, f"{outcome_col}: 표본에 양성/음성 클래스가 모두 없어 평가 불가 (표본을 늘리세요)"

    logit = Pipeline([
        ("scale", StandardScaler()),
        ("clf", LogisticRegression(max_iter=1000)),
    ]).fit(X, y)
    gb = GradientBoostingClassifier(n_estimators=50, max_depth=2, random_state=0).fit(X, y)

    proba_logit = logit.predict_proba(X)[:, 1]
    proba_gb = gb.predict_proba(X)[:, 1]

    auroc = roc_auc_score(y, proba_gb)
    brier = brier_score_loss(y, proba_gb)
    fpr, tpr, thresholds = roc_curve(y, proba_gb)
    youden = tpr - fpr
    best_threshold = float(thresholds[np.argmax(youden)]) if len(thresholds) else 0.5

    result = {
        "n": int(len(df)),
        "event_rate": float(y.mean()),
        "auroc": round(float(auroc), 3),
        "brier": round(float(brier), 3),
        "threshold": round(best_threshold, 3),
        "gb_model": gb,
        "logit_model": logit,
        "X": X,
    }
    return result, None


def compute_shap(gb_model, X: pd.DataFrame) -> list[dict]:
    try:
        import shap

        explainer = shap.TreeExplainer(gb_model)
        shap_values = explainer.shap_values(X)
        mean_abs = np.abs(shap_values).mean(axis=0)
    except Exception as exc:  # shap 미설치 등 -- feature_importances_로 대체
        print(f"[경고] SHAP 계산 실패({exc}) — GradientBoosting feature_importances_로 대체합니다.", file=sys.stderr)
        mean_abs = gb_model.feature_importances_

    total = mean_abs.sum() or 1.0
    out = []
    for col, val in zip(X.columns, mean_abs):
        out.append({
            "name": FEATURE_LABEL_KO.get(col, col),
            "axis": FEATURE_AXIS.get(col, 1),
            "val": round(float(val / total) * 0.3, 3),  # 대시보드 SHAP 차트 스케일(0~0.30)에 맞춤
        })
    return sorted(out, key=lambda d: -d["val"])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", default="../sample_data", help="CSV 폴더 (스모크 테스트용)")
    parser.add_argument("--backend", choices=["duckdb-csv", "postgres"], default="duckdb-csv")
    parser.add_argument("--dsn", help="--backend postgres일 때 접속 문자열")
    parser.add_argument("--out", default="../results/model_output.json")
    args = parser.parse_args()

    placeholders = concepts.warn_if_placeholders()
    if placeholders:
        print(f"[경고] 아직 placeholder concept_id가 {len(placeholders)}개 남아있습니다: {placeholders}", file=sys.stderr)
        print("        02_concept_id_checklist.md를 채워 concepts.py를 갱신하기 전엔 실제 DB에서 의미 있는 결과가 나오지 않습니다.\n", file=sys.stderr)

    con = db.connect_postgres(args.dsn) if args.backend == "postgres" else db.load_duckdb(args.data_dir)

    sql = build_sql()
    df = con.execute(sql).fetchdf()
    print(f"코호트 추출 완료: {len(df)}명 (index admission 기준)")

    df = engineer_features(df)

    feature_cols = ["bnp", "egfr", "potassium", "conut_score", "albumin", "gdmt_active_count", "pdc_proxy"]

    output = {"generatedBy": "analysis/pipeline/run_pipeline.py", "smokeTest": args.backend == "duckdb-csv"}
    for outcome_col, key in [("readmit_30d", "d30"), ("readmit_90d", "d90")]:
        result, err = train_and_evaluate(df, outcome_col, feature_cols)
        if err:
            print(f"[경고] {err}", file=sys.stderr)
            continue
        output[key] = {
            "auroc": result["auroc"],
            "brier": result["brier"],
            "threshold": result["threshold"],
            "rate": f"{result['event_rate'] * 100:.1f}%",
            "n": result["n"],
        }
        shap_key = "shap30" if key == "d30" else "shap90"
        output[shap_key] = compute_shap(result["gb_model"], result["X"])
        print(f"{outcome_col}: n={result['n']}, event_rate={result['event_rate']:.1%}, AUROC={result['auroc']}")

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n결과 저장: {out_path.resolve()}")
    if output.get("smokeTest"):
        print("※ 스모크 테스트 결과입니다 (표본 15명, 가짜 데이터) — 수치 자체는 의미 없고 파이프라인 정상 동작 확인용입니다.")


if __name__ == "__main__":
    main()
