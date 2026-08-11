# 본선 분석 준비 키트

이 폴더는 웹 대시보드(`src/`)와 별개로, **본선에서 의료데이터안심존을 방문해 실제 OMOP CDM 데이터를 분석할 때 쓸 준비물**입니다.
대시보드가 "결과를 보여줄 그릇"이라면, 이 폴더는 "결과를 만들어낼 도구"입니다.

## 왜 필요한가

안심존 방문은 시간이 제한적이고, 대개 인터넷이 차단되거나 반출 심사를 거쳐야 합니다. 현장에서 처음부터
코호트 정의·SQL·통계 코드를 짜면 시간 안에 결과를 못 낼 위험이 큽니다. 그래서:

- **아웃컴 정의**와 **코호트 SQL**은 지금(인터넷 되는 상태에서) 확정·조사해둡니다.
- **분석 파이프라인**은 지금 미리 짜서, 가짜 샘플 데이터로 끝까지 돌려 디버깅까지 마쳐둡니다.
- 본선 현장에서는 `pipeline/concepts.py`의 자리표시자(placeholder) concept_id만 실제 값으로 교체하고,
  DB 연결 정보만 바꿔서 바로 실행합니다.

## 순서

1. **`01_outcome_definition.md`** — 30/90일 재입원을 어떻게 셀지 알고리즘 수준으로 확정한 문서. 가장 먼저 읽을 것.
2. **`02_concept_id_checklist.md`** — 안심존 가기 전, [Athena](https://athena.ohdsi.org)에서 조회해서
   채워야 할 concept_id 목록. 이미 문헌으로 검증된 값(예: 심부전 SNOMED 316139)은 표시돼 있음.
3. **`03_cohort_extraction.sql`** — concept_ancestor 기반 코호트 추출 + 3축 피처 + 재입원 라벨링 SQL.
   DuckDB에서 바로 실행 가능하고, Postgres 기반 OMOP DB로는 최소 수정으로 이식 가능.
4. **`pipeline/`** — 위 SQL을 실제로 돌려 모델 학습·SHAP까지 계산하는 Python 파이프라인.
   지금은 `sample_data/`의 가짜 데이터로 검증하고, 본선에서는 DB 연결만 바꿔 그대로 씁니다.

## 지금 바로 해볼 수 있는 것 (스모크 테스트)

```bash
cd analysis/pipeline
pip install -r requirements.txt
python run_pipeline.py --data-dir ../sample_data
```

`sample_data/`는 진짜 환자 데이터가 아니라, PDF 데이터설명서의 스키마를 그대로 흉내 낸 **가짜 15명 샘플**입니다.
목적은 통계적 의미가 아니라 "코드가 처음부터 끝까지 에러 없이 돈다"는 것을 지금 확인해두는 것입니다.
measurement/drug의 concept_id는 실제 Athena 값이 아닌 자리표시자이므로, 본선 전 반드시 `02_concept_id_checklist.md`를
채워 `pipeline/concepts.py`를 갱신해야 합니다.

## 본선 당일 체크리스트 (요약)

이 순서로 진행하면 시간을 아낄 수 있습니다. 자세한 배경은 웹 대시보드 "데이터·ERD" 탭의
"본선 우선 확인" 항목과 동일합니다.

1. `death` 테이블 존재·내용 확인
2. 원천 코드 매핑 실패율(`concept_id = 0`) 확인 — 심하면 `_source_concept_id`가 아니라
   `_source_value` 원본 텍스트로 재매핑이 필요할 수 있음
3. `02_concept_id_checklist.md`의 실제 값으로 `pipeline/concepts.py` 갱신
4. `03_cohort_extraction.sql`을 실제 DB에 맞게 접속 정보만 바꿔 실행
5. `pipeline/run_pipeline.py --data-dir <실제 DB 커넥션>` 실행 → 대시보드가 기대하는 JSON 스키마로 결과 저장
6. 결과 JSON을 `src/data.ts`의 `MODEL_METRICS`/`SHAP_*` 자리에 반영해 대시보드를 실측치로 교체
