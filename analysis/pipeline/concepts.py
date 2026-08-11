"""Concept ID 설정.

본선 전 `../02_concept_id_checklist.md`를 참고해 Athena(https://athena.ohdsi.org)에서
조회한 뒤 이 파일 값을 실제 값으로 교체할 것.

VERIFIED_*  : 문헌/공식 코드 체계로 이미 확인된 값 (그대로 사용 가능)
나머지       : 스모크 테스트용 placeholder (9_000_0xx 대역). 실제 DB에 이 값 그대로
              쿼리하면 아무 것도 안 걸리거나(존재 안 하는 ID) 엉뚱한 값이 걸릴 수 있으니
              반드시 교체 후 사용.
"""

PLACEHOLDER_RANGE_START = 9_000_000


def is_placeholder(concept_id: int) -> bool:
    """실제 Athena 값으로 아직 안 바꾼 상태인지 확인."""
    return concept_id >= PLACEHOLDER_RANGE_START


# ── 확인 완료 ────────────────────────────────────────────────────────────────
# SNOMED "Heart failure" — JAMIA Open HF phenotyping 연구(academic.oup.com/jamiaopen/
# article/4/3/ooab001/6127557)에서 표준 루트 concept로 사용됨.
HF_ROOT_CONCEPT_ID = 316139

# PDF 데이터설명서 예시 데이터·본문에서 확인됨.
INPATIENT_VISIT_CONCEPT_ID = 9201
OUTPATIENT_VISIT_CONCEPT_ID = 9202
EMERGENCY_VISIT_CONCEPT_ID = 9203
UNMAPPED_CONCEPT_ID = 0

# ── TODO: Athena 조회 후 교체 (지금은 placeholder) ──────────────────────────
# 축1 (임상·생리)
BNP_CONCEPT_ID = 9_000_001          # LOINC 30934-4
NT_PROBNP_CONCEPT_ID = 9_000_002    # LOINC 33762-6 (bnp/nt-probnp 둘 중 있는 쪽 사용)
CREATININE_CONCEPT_ID = 9_000_003   # LOINC 2160-0
POTASSIUM_CONCEPT_ID = 9_000_004    # LOINC 2823-3
SODIUM_CONCEPT_ID = 9_000_005       # LOINC 2951-2

# 축2 (영양, CONUT 재료)
ALBUMIN_CONCEPT_ID = 9_000_011      # LOINC 1751-7
CHOLESTEROL_CONCEPT_ID = 9_000_012  # LOINC 2093-3
LYMPHOCYTE_CONCEPT_ID = 9_000_013   # LOINC 731-0

# 축3 (관리·치료, GDMT 4계열 RxNorm Ingredient)
GDMT_INGREDIENT_CONCEPT_IDS = [
    9_000_101,  # Lisinopril (ACEi)
    9_000_102,  # Losartan (ARB)
    9_000_103,  # Sacubitril (ARNI)
    9_000_104,  # Carvedilol (Beta-blocker, HF 근거)
    9_000_105,  # Spironolactone (MRA)
    9_000_106,  # Dapagliflozin (SGLT2i) -- vocab 2019-01-18 스냅샷에 없을 수 있음, 최우선 확인
]


def all_concept_ids() -> dict:
    """placeholder 여부 점검용 — {이름: id} 전체 목록."""
    return {
        "HF_ROOT_CONCEPT_ID": HF_ROOT_CONCEPT_ID,
        "INPATIENT_VISIT_CONCEPT_ID": INPATIENT_VISIT_CONCEPT_ID,
        "BNP_CONCEPT_ID": BNP_CONCEPT_ID,
        "NT_PROBNP_CONCEPT_ID": NT_PROBNP_CONCEPT_ID,
        "CREATININE_CONCEPT_ID": CREATININE_CONCEPT_ID,
        "POTASSIUM_CONCEPT_ID": POTASSIUM_CONCEPT_ID,
        "SODIUM_CONCEPT_ID": SODIUM_CONCEPT_ID,
        "ALBUMIN_CONCEPT_ID": ALBUMIN_CONCEPT_ID,
        "CHOLESTEROL_CONCEPT_ID": CHOLESTEROL_CONCEPT_ID,
        "LYMPHOCYTE_CONCEPT_ID": LYMPHOCYTE_CONCEPT_ID,
        **{f"GDMT_{i}": c for i, c in enumerate(GDMT_INGREDIENT_CONCEPT_IDS)},
    }


def warn_if_placeholders() -> list:
    """placeholder가 남아있는 항목 이름 목록을 돌려준다. 실제 DB 실행 전 반드시 확인."""
    return [name for name, cid in all_concept_ids().items() if is_placeholder(cid)]
