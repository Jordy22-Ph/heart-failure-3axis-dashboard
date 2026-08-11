# Concept ID 조사 체크리스트

안심존은 인터넷이 제한될 가능성이 높으므로, **아래 항목은 방문 전에 [Athena](https://athena.ohdsi.org)에서
미리 조회해 `pipeline/concepts.py`에 채워 넣는다.** 검색창에 "검색어" 열의 단어를 넣고, Vocabulary·Domain
필터를 걸어 `Standard Concept = S`인 행의 `Concept Id`를 쓴다.

주의: PDF 데이터설명서 기준 이 병원 데이터는 vocabulary v5.0 (2019-01-18)이다. Concept ID 자체는 어휘
버전이 올라가도 바뀌지 않지만(한 번 부여된 ID는 재사용되지 않음), **2019년 이후 등재된 개념**(예: 최신
SGLT2i 적응증 확장 등)은 이 버전에 없을 수 있으니 Athena에서 `Valid Start Date`를 함께 확인한다.

## ✅ 검증 완료 (문헌 근거 있음)

| 항목 | Vocabulary | 검색어 | Concept ID | 근거 |
|---|---|---|---|---|
| 심부전 (코호트 루트) | SNOMED / Condition | "Heart failure" | **316139** | JAMIA Open, "Transforming and evaluating EHR disease phenotyping algorithms using the OMOP CDM: a case study in heart failure" — HF 표현형 알고리즘 표준 루트 concept로 사용됨 |
| BNP | LOINC / Measurement | LOINC 30934-4 | 조회 필요 | loinc.org/30934-4 |
| NT-proBNP | LOINC / Measurement | LOINC 33762-6 | 조회 필요 | loinc.org/33762-6 |

`316139`는 문헌으로 확인됐지만, `concept_ancestor`에서 실제로 자손이 몇 개나 걸리는지는 이 병원
어휘 스냅샷에서 반드시 재확인한다(`SELECT count(*) FROM concept_ancestor WHERE ancestor_concept_id = 316139`).

## 🔲 방문 전 Athena에서 조회할 항목

### 축1 (임상·생리) — 검사 수치

| 항목 | Vocabulary | 검색어 |
|---|---|---|
| BNP | LOINC | `30934-4` |
| NT-proBNP | LOINC | `33762-6` |
| 혈청 크레아티닌 (eGFR 계산용) | LOINC | "Creatinine [Mass/volume] in Serum or Plasma" (2160-0) |
| 칼륨 | LOINC | "Potassium [Moles/volume] in Serum or Plasma" (2823-3) |
| 나트륨 | LOINC | "Sodium [Moles/volume] in Serum or Plasma" (2951-2) |

### 축2 (영양) — CONUT/GNRI 재료

| 항목 | Vocabulary | 검색어 |
|---|---|---|
| 혈청 알부민 | LOINC | "Albumin [Mass/volume] in Serum or Plasma" (1751-7) |
| 총콜레스테롤 | LOINC | "Cholesterol [Mass/volume] in Serum or Plasma" (2093-3) |
| 총림프구수 | LOINC | "Lymphocytes [#/volume] in Blood" (731-0) |
| 체중 | LOINC/SNOMED | "Body weight" |

### 축3 (관리·치료) — GDMT 4계열 (RxNorm Ingredient)

| 계열 | 후보 성분(검색어) | 비고 |
|---|---|---|
| ACEi | Lisinopril / Enalapril / Ramipril / Captopril | |
| ARB | Losartan / Valsartan / Candesartan | |
| ARNI | Sacubitril, Valsartan (병용) | RxNorm에서 조합제 vs 성분 분리 방식 확인 |
| Beta-blocker (HF 근거 3종) | Carvedilol / Metoprolol succinate / Bisoprolol | 일반 metoprolol(tartrate)과 succinate(서방형)는 다른 ingredient이므로 구분 |
| MRA | Spironolactone / Eplerenone | |
| SGLT2i | Dapagliflozin / Empagliflozin | ⚠️ HF 적응증은 2019년 이후 확대 — 이 vocab 스냅샷(2019-01-18)에 없을 가능성 있음, 최우선으로 존재 여부 확인 |
| (참고) 루프이뇨제 | Furosemide / Torsemide / Bumetanide | GDMT엔 미포함이나 증상 관리·CONUT 해석에 참고 |

### 방문(visit) — 이미 PDF에서 확인된 값 (재확인용)

| 항목 | Concept ID | 출처 |
|---|---|---|
| Inpatient Visit | 9201 | PDF 예시 데이터 |
| Outpatient Visit | 9202 | PDF 본문 서술 |
| Emergency Room | 9203 | PDF 본문 서술 |
| No matching concept (unmapped) | 0 | PDF 전반에 반복 등장 |

## 다음 단계

위 표를 채운 뒤 `pipeline/concepts.py`의 `TODO_ATHENA_LOOKUP` 딕셔너리 값을 실제 concept_id로
교체하면, `03_cohort_extraction.sql`과 `pipeline/`이 별도 수정 없이 실제 값으로 동작한다.
