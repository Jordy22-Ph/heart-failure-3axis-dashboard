# 아웃컴 정의: 30일 / 90일 심부전 재입원

## 1. 코호트 진입 (Index admission)

- **입원 조건**: `visit_occurrence.visit_concept_id = 9201` (Inpatient Visit)
- **심부전 연관 조건**: 해당 입원(`visit_occurrence_id`)에 연결된 `condition_occurrence` 중
  `condition_concept_id`가 심부전 코호트 concept 집합(`concept_ancestor`로 316139의 자손까지 확장,
  `02_concept_id_checklist.md` 참고)에 포함
- **환자당 1건만 index로 채택**: 관찰기간(`observation_period`) 내 조건을 만족하는 **최초** 입원만 index admission으로
  삼는다. (동일 환자의 두 번째 이후 HF 입원은 "재입원 후보"로만 쓰고, 새 index로 재사용하지 않음 — 그렇지 않으면
  같은 환자가 여러 행으로 중복 등장해 표본이 부풀려짐)
- **관찰기간 요건**: `observation_period_start_date <= index_admission_date` 이고,
  `observation_period_end_date >= index_discharge_date + 90일` 인 환자만 포함
  (90일 추적이 안 되는 환자는 90일 라벨을 매길 수 없으므로 제외 — 30일 모델은 30일 커버리지만 있어도 포함 가능,
  30일/90일 모델의 분모가 다를 수 있음에 유의)

## 2. Index admission 제외 기준

- 입원 중 사망한 경우 (퇴원일이 없거나 `discharge_to_concept_id`가 사망을 의미) → 재입원 위험군이 아니므로 별도 집계
  (아래 5번 참고)
- `preceding_visit_occurrence_id`로 직전 방문과 연결되어 사실상 하나의 연속 입원(전원)인 경우, 뒤 방문은
  새 index로 세지 않고 원래 입원의 연장으로 병합

## 3. 재입원 판정 규칙

index 퇴원일(`index_discharge_date`) 기준으로:

```
gap_days = 다음 입원의 visit_start_date - index_discharge_date

조건:
  다음 입원의 visit_concept_id = 9201 (Inpatient)
  AND gap_days > 0                         -- 당일 전원/연속입원 제외
  AND 다음 입원이 preceding_visit_occurrence_id로 index와 직접 연결되지 않음
  AND gap_days <= 30  → readmit_30d = 1
  AND gap_days <= 90  → readmit_90d = 1
```

- **재입원 사유 제한 없음(all-cause)**: HF 재악화만이 아니라 원인 불문 재입원을 1차 정의로 사용한다
  (임상 문헌에서 가장 흔히 쓰는 정의이자, 코드로 판별하기 쉬움). HF 특이적 재입원(동일 조건 재발생)은
  민감도 분석으로 별도 산출 가능하도록 파이프라인에 플래그만 남겨둔다.
- **여러 번 재입원한 경우**: 30/90일 창 내 **가장 이른** 재입원 1건만으로 라벨을 정한다(이진 라벨).

## 4. 사망 경쟁위험(competing risk) 처리

PDF 데이터설명서 기준으로 **`death` 테이블은 현재 제공된 18개 테이블 목록에 없음** — 존재 여부 자체가
본선 우선 확인 1순위다. 두 가지 케이스에 대비한다.

- **`death` 테이블이 있는 경우**: 30/90일 창 내 재입원 없이 사망한 경우를 별도 상태(`dead_no_readmit`)로
  분리하고, 주 모델은 "재입원 또는 사망" 복합결과와 "재입원 단독" 두 버전을 모두 산출해 비교한다.
  (사망을 단순히 "재입원 없음=0"으로 두면, 죽어서 재입원을 못 한 고위험군이 저위험군처럼 보이는 편향 발생)
- **`death` 테이블이 없는 경우**: 복합결과 산출이 불가능하므로, `PRIORITY_CHECKS`에 따라 재입원 단독
  1차 결과로 수렴한다(대시보드 `데이터·ERD` 탭의 조건부 경로 C2와 동일한 대응).

## 5. 최종 라벨 스키마 (파이프라인 출력)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `person_id` | int | 환자 |
| `index_visit_occurrence_id` | int | index 입원 |
| `index_admission_date` / `index_discharge_date` | date | index 입원/퇴원일 |
| `gap_days_to_readmit` | int/null | 다음 재입원까지 일수 (없으면 null) |
| `readmit_30d` | 0/1 | 30일 이내 재입원 |
| `readmit_90d` | 0/1 | 90일 이내 재입원 |
| `died_within_90d` | 0/1/null | death 테이블 있을 때만 채움 |
| `composite_90d` | 0/1/null | `readmit_90d OR died_within_90d`, death 테이블 있을 때만 |

이 스키마는 `pipeline/outcome.py`가 그대로 생성하며, `pipeline/train.py`가 이 표를 피처 테이블과
`person_id` 기준으로 조인해 모델을 학습한다.
