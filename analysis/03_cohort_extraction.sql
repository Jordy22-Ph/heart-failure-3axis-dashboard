-- ============================================================================
-- 심부전 3축 코호트 추출 SQL 뼈대
-- ============================================================================
-- 이 파일은 문자열 템플릿입니다. {hf_root_concept_id} 같은 중괄호 자리는
-- pipeline/concepts.py 값으로 Python이 .format() 치환한 뒤 실행합니다.
-- (직접 DB 클라이언트에서 돌리려면 이 자리들을 concepts.py 값으로 손으로
-- 바꿔서 실행하세요.)
--
-- DuckDB에서 그대로 동작하도록 작성했고, Postgres 기반 실제 OMOP DB에서는
-- 아래 표시된 부분(날짜 뺄셈, LEAD 윈도우 함수)만 방언 차이를 확인하면 됩니다.
-- window 함수·CTE 문법은 ANSI SQL 표준이라 대부분 그대로 이식됩니다.
-- ============================================================================

-- 1) 심부전 코호트 개념 집합: concept_ancestor로 하위개념까지 확장
--    2단계 우선 조사: 병원 어휘 스냅샷에서 실제 몇 개나 걸리는지 먼저 확인할 것
--    SELECT count(*) FROM concept_ancestor WHERE ancestor_concept_id = {hf_root_concept_id};
WITH hf_cohort_concepts AS (
    SELECT descendant_concept_id AS concept_id
    FROM concept_ancestor
    WHERE ancestor_concept_id = {hf_root_concept_id}   -- TODO: 316139 (문헌 검증됨, 02번 문서 참고)
),

-- 2) 심부전 관련 입원(inpatient visit) 후보
hf_admissions AS (
    SELECT DISTINCT
        v.visit_occurrence_id,
        v.person_id,
        v.visit_start_date AS admission_date,
        v.visit_end_date   AS discharge_date,
        v.preceding_visit_occurrence_id
    FROM visit_occurrence v
    JOIN condition_occurrence co
        ON co.visit_occurrence_id = v.visit_occurrence_id
    JOIN hf_cohort_concepts hc
        ON co.condition_concept_id = hc.concept_id
    WHERE v.visit_concept_id = {inpatient_visit_concept_id}   -- TODO: 9201
),

-- 3) 관찰기간 요건을 만족하는 입원만 남기고, 환자당 최초 입원을 index로 지정
eligible_admissions AS (
    SELECT
        a.*,
        op.observation_period_start_date,
        op.observation_period_end_date,
        ROW_NUMBER() OVER (
            PARTITION BY a.person_id ORDER BY a.admission_date
        ) AS admission_rank
    FROM hf_admissions a
    JOIN observation_period op
        ON op.person_id = a.person_id
        AND a.admission_date BETWEEN op.observation_period_start_date AND op.observation_period_end_date
),
index_admissions AS (
    SELECT *
    FROM eligible_admissions
    WHERE admission_rank = 1
      -- 90일 추적 커버리지 요건 (01_outcome_definition.md 1절)
      AND observation_period_end_date >= discharge_date + INTERVAL '90' DAY
),

-- 4) 각 환자의 index 이후 모든 입원(재입원 후보) — 최소 gap의 재입원만 채택
all_inpatient_visits AS (
    SELECT visit_occurrence_id, person_id, visit_start_date, preceding_visit_occurrence_id
    FROM visit_occurrence
    WHERE visit_concept_id = {inpatient_visit_concept_id}   -- TODO: 9201
),
next_readmission AS (
    SELECT
        idx.person_id,
        idx.visit_occurrence_id AS index_visit_occurrence_id,
        idx.admission_date      AS index_admission_date,
        idx.discharge_date      AS index_discharge_date,
        MIN(nxt.visit_start_date) FILTER (
            WHERE nxt.visit_start_date > idx.discharge_date
              AND (nxt.preceding_visit_occurrence_id IS NULL
                   OR nxt.preceding_visit_occurrence_id <> idx.visit_occurrence_id)   -- 연속 전원 제외
        ) AS next_admission_date
    FROM index_admissions idx
    LEFT JOIN all_inpatient_visits nxt
        ON nxt.person_id = idx.person_id
        AND nxt.visit_occurrence_id <> idx.visit_occurrence_id
    GROUP BY 1, 2, 3, 4
),

-- 5) 재입원 라벨링 (01_outcome_definition.md 3절)
readmission_labels AS (
    SELECT
        person_id,
        index_visit_occurrence_id,
        index_admission_date,
        index_discharge_date,
        DATE_DIFF('day', index_discharge_date, next_admission_date) AS gap_days_to_readmit,
        CASE WHEN DATE_DIFF('day', index_discharge_date, next_admission_date) BETWEEN 1 AND 30
             THEN 1 ELSE 0 END AS readmit_30d,
        CASE WHEN DATE_DIFF('day', index_discharge_date, next_admission_date) BETWEEN 1 AND 90
             THEN 1 ELSE 0 END AS readmit_90d
    FROM next_readmission
),

-- 6) 축1(임상·생리): index 시점 이전 최신 BNP/크레아티닌/칼륨
axis1_features AS (
    SELECT
        idx.visit_occurrence_id AS index_visit_occurrence_id,
        MAX(CASE WHEN m.measurement_concept_id = {bnp_concept_id}
                 THEN m.value_as_number END) AS bnp,
        MAX(CASE WHEN m.measurement_concept_id = {creatinine_concept_id}
                 THEN m.value_as_number END) AS creatinine,
        MAX(CASE WHEN m.measurement_concept_id = {potassium_concept_id}
                 THEN m.value_as_number END) AS potassium
    FROM index_admissions idx
    LEFT JOIN measurement m
        ON m.person_id = idx.person_id
        AND m.measurement_date BETWEEN idx.admission_date - INTERVAL '30' DAY AND idx.admission_date
    GROUP BY idx.visit_occurrence_id
),

-- 7) 축2(영양): index 시점 이전 최신 알부민/총콜레스테롤/총림프구수 (CONUT 재료)
axis2_features AS (
    SELECT
        idx.visit_occurrence_id AS index_visit_occurrence_id,
        MAX(CASE WHEN m.measurement_concept_id = {albumin_concept_id}
                 THEN m.value_as_number END) AS albumin,
        MAX(CASE WHEN m.measurement_concept_id = {cholesterol_concept_id}
                 THEN m.value_as_number END) AS total_cholesterol,
        MAX(CASE WHEN m.measurement_concept_id = {lymphocyte_concept_id}
                 THEN m.value_as_number END) AS lymphocyte_count
    FROM index_admissions idx
    LEFT JOIN measurement m
        ON m.person_id = idx.person_id
        AND m.measurement_date BETWEEN idx.admission_date - INTERVAL '30' DAY AND idx.admission_date
    GROUP BY idx.visit_occurrence_id
),

-- 8) 축3(관리·치료): index 시점에 활성 상태인 GDMT 성분 수 + GAP_DAYS 평균
--    gdmt_ingredient_concept_ids는 concepts.py의 리스트를 Python에서
--    "IN (1,2,3,...)" 형태로 조립해 치환합니다.
axis3_features AS (
    SELECT
        idx.visit_occurrence_id AS index_visit_occurrence_id,
        COUNT(DISTINCT de.drug_concept_id) FILTER (
            WHERE de.drug_concept_id IN ({gdmt_ingredient_concept_ids})
              AND idx.admission_date BETWEEN de.drug_era_start_date AND de.drug_era_end_date
        ) AS gdmt_active_count,
        AVG(de.gap_days) FILTER (
            WHERE de.drug_concept_id IN ({gdmt_ingredient_concept_ids})
        ) AS avg_gap_days
    FROM index_admissions idx
    LEFT JOIN drug_era de
        ON de.person_id = idx.person_id
    GROUP BY idx.visit_occurrence_id
)

-- 9) 최종 결과: 코호트 + 라벨 + 3축 피처 + eGFR·CONUT 계산에 필요한 인구학 정보
--    eGFR(CKD-EPI)·CONUT 점수 자체는 성별·나이 조건분기가 많아 SQL보다
--    pipeline/run_pipeline.py에서 pandas로 계산합니다 (여기서는 재료만 뽑음).
SELECT
    r.person_id,
    r.index_visit_occurrence_id,
    r.index_admission_date,
    r.index_discharge_date,
    r.gap_days_to_readmit,
    r.readmit_30d,
    r.readmit_90d,
    p.gender_concept_id,
    p.year_of_birth,
    a1.bnp, a1.creatinine, a1.potassium,
    a2.albumin, a2.total_cholesterol, a2.lymphocyte_count,
    a3.gdmt_active_count, a3.avg_gap_days
FROM readmission_labels r
JOIN person p ON p.person_id = r.person_id
LEFT JOIN axis1_features a1 ON a1.index_visit_occurrence_id = r.index_visit_occurrence_id
LEFT JOIN axis2_features a2 ON a2.index_visit_occurrence_id = r.index_visit_occurrence_id
LEFT JOIN axis3_features a3 ON a3.index_visit_occurrence_id = r.index_visit_occurrence_id
ORDER BY r.person_id;
