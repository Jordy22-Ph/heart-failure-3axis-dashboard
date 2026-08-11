export type Tab = 'overview' | 'data' | 'matrix' | 'patients' | 'model' | 'submission';
export type GapType = '영양' | '관리' | '영양+관리' | '교정 여지 작음' | '공백 없음';
export type StatusType = '위험' | '경계' | '안정';
export type Period = '30일' | '90일' | '전체';

export const C = {
  ink: '#151E2B',
  inkSoft: '#5B6672',
  inkFaint: '#8B95A1',
  line: '#DFE3E8',
  lineSoft: '#EBEEF1',
  bg: '#F4F5F7',
  axis1: '#2F5FA8',
  axis1Soft: '#E6ECF7',
  axis2: '#2F8A5B',
  axis2Soft: '#E5F2EA',
  axis3: '#B4732B',
  axis3Soft: '#F6EBDD',
  riskHigh: '#A63B32',
  riskHighSoft: '#F5E4E2',
  gold: '#C99A3B',
  goldSoft: '#FBF3E1',
  sidebar: '#0F172A',
};

export const GAP_COLOR: Record<GapType, string> = {
  '영양': C.axis2,
  '관리': C.axis3,
  '영양+관리': C.gold,
  '교정 여지 작음': C.riskHigh,
  '공백 없음': C.inkFaint,
};

export const GAP_BG: Record<GapType, string> = {
  '영양': C.axis2Soft,
  '관리': C.axis3Soft,
  '영양+관리': C.goldSoft,
  '교정 여지 작음': C.riskHighSoft,
  '공백 없음': C.lineSoft,
};

export const STATUS_STYLE: Record<StatusType, { color: string; bg: string }> = {
  '위험': { color: C.riskHigh, bg: C.riskHighSoft },
  '경계': { color: C.gold, bg: C.goldSoft },
  '안정': { color: C.inkFaint, bg: C.lineSoft },
};

export const AXIS_COLOR: Record<number, string> = {
  1: C.axis1,
  2: C.axis2,
  3: C.axis3,
};

export const AXIS_SOFT: Record<number, string> = {
  1: C.axis1Soft,
  2: C.axis2Soft,
  3: C.axis3Soft,
};

export const AXIS_LABEL: Record<number, string> = {
  1: '축1 임상·생리',
  2: '축2 영양',
  3: '축3 관리·치료',
};

export interface Patient {
  id: string;
  clinicalRisk: number;
  correctableGap: number;
  gap: GapType;
  action: string;
  axis1: { bnp: number; egfr: number; potassium: string; status: StatusType };
  axis2: { albumin: string; conut: number; sodium: number; status: StatusType };
  axis3: { gdmtCount: number; pdc: number; continuity: number; status: StatusType };
}

function calcAxisDetail(x: number, y: number, gap: string, rand: () => number) {
  const bnp = Math.round(280 + (x / 100) * 2400 + rand() * 300);
  const egfr = Math.round(78 - (x / 100) * 48 - rand() * 8);
  const potassium = (3.8 + rand() * 0.8 + (x / 100) * 0.3).toFixed(1);
  const axis1Status: StatusType = x >= 65 ? '위험' : x >= 45 ? '경계' : '안정';

  const nW = gap.includes('영양') ? 0.85 : 0.3;
  const albumin = (4.3 - (y / 100) * 1.4 * nW - rand() * 0.3).toFixed(1);
  const conut = Math.max(0, Math.round((y / 100) * 9 * nW + rand() * 2));
  const sodium = Math.round(142 - (y / 100) * 10 * nW - rand() * 3);
  const axis2Status: StatusType = gap.includes('영양') ? (y >= 65 ? '위험' : '경계') : '안정';

  const mW = gap.includes('관리') ? 0.85 : 0.3;
  const gdmtCount = Math.max(0, Math.min(4, Math.round(4 - (y / 100) * 3 * mW - rand())));
  const pdc = Math.max(20, Math.round(96 - (y / 100) * 45 * mW - rand() * 10));
  const continuity = Math.max(15, Math.round(92 - (y / 100) * 50 * mW - rand() * 10));
  const axis3Status: StatusType = gap.includes('관리') ? (y >= 65 ? '위험' : '경계') : '안정';

  return {
    axis1: { bnp, egfr, potassium, status: axis1Status },
    axis2: { albumin, conut, sodium, status: axis2Status },
    axis3: { gdmtCount, pdc, continuity, status: axis3Status },
  };
}

function makePatients(): Patient[] {
  const seedNames: [string, number, number, GapType, string][] = [
    ['P-014', 72, 78, '영양', '알부민 교정 · 영양 상담'],
    ['P-233', 68, 71, '관리', '복약 순응 관리 · 외래 연계'],
    ['P-091', 65, 82, '영양+관리', '영양 중재 + 연속성 강화'],
    ['P-402', 61, 18, '교정 여지 작음', '집중 임상 추적'],
  ];
  let seedS = 7;
  const seedRand = () => { seedS = (seedS * 9301 + 49297) % 233280; return seedS / 233280; };
  const base: Patient[] = seedNames.map(([id, x, y, gap, action]) => ({
    id, clinicalRisk: x, correctableGap: y, gap, action,
    ...calcAxisDetail(x, y, gap, seedRand),
  }));
  let s = 42;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const actionMap: Record<GapType, string> = {
    '영양': '알부민·CONUT 재평가 · 영양 상담',
    '관리': '복약 순응(PDC) 확인 · 외래 연계',
    '영양+관리': '영양 중재 + 진료 연속성 강화',
    '교정 여지 작음': '임상 지표 집중 추적',
    '공백 없음': '표준 경과 관찰',
  };
  for (let i = 1; i <= 30; i++) {
    const x = Math.round(10 + rand() * 85);
    const y = Math.round(5 + rand() * 90);
    let gap: GapType;
    if (x < 50 && y < 50) gap = '공백 없음';
    else if (x >= 50 && y < 40) gap = '교정 여지 작음';
    else if (y >= 60 && x < 55) gap = rand() > 0.5 ? '영양' : '관리';
    else gap = rand() > 0.55 ? '영양+관리' : (rand() > 0.5 ? '영양' : '관리');
    base.push({
      id: `P-${String(100 + i)}`,
      clinicalRisk: x,
      correctableGap: y,
      gap,
      action: actionMap[gap],
      ...calcAxisDetail(x, y, gap, rand),
    });
  }
  return base;
}

export const PATIENTS = makePatients();

export const READMISSION_BARS = [
  { name: '30일\n상급종합', short: '30일', value: 14.4, period: '30일' as Period },
  { name: '30일 HF\n고위험군', short: '30일 HF', value: 19.0, period: '30일' as Period },
  { name: '90일\n단일기관', short: '90일', value: 22.8, period: '90일' as Period },
  { name: '3.8년\nKorHF', short: 'KorHF', value: 27, period: '전체' as Period },
];

export interface ShapFeature {
  name: string;
  axis: 1 | 2 | 3;
  val: number;
}

export const SHAP_30D: ShapFeature[] = [
  { name: 'BNP 감소율(trajectory)', axis: 1, val: 0.28 },
  { name: 'eGFR 기울기', axis: 1, val: 0.21 },
  { name: 'CONUT 점수', axis: 2, val: 0.15 },
  { name: '저나트륨혈증', axis: 2, val: 0.10 },
  { name: 'GDMT 완결도', axis: 3, val: 0.09 },
  { name: 'PDC 순응도', axis: 3, val: 0.07 },
  { name: '진료연속성 지수', axis: 3, val: 0.06 },
  { name: '다제약물 지수', axis: 3, val: 0.04 },
];

export const SHAP_90D: ShapFeature[] = [
  { name: '진료연속성 지수', axis: 3, val: 0.20 },
  { name: 'PDC 순응도', axis: 3, val: 0.18 },
  { name: 'CONUT 점수', axis: 2, val: 0.16 },
  { name: 'BNP 감소율(trajectory)', axis: 1, val: 0.14 },
  { name: '저알부민혈증', axis: 2, val: 0.12 },
  { name: 'GDMT 완결도', axis: 3, val: 0.09 },
  { name: 'eGFR 기울기', axis: 1, val: 0.07 },
  { name: '다제약물 지수', axis: 3, val: 0.04 },
];

export const SHAP_GLOBAL: ShapFeature[] = [
  { name: 'BNP 감소율(trajectory)', axis: 1, val: 0.19 },
  { name: 'CONUT 점수', axis: 2, val: 0.15 },
  { name: 'eGFR 기울기', axis: 1, val: 0.13 },
  { name: '진료연속성 지수', axis: 3, val: 0.14 },
  { name: 'PDC 순응도', axis: 3, val: 0.12 },
  { name: '저알부민혈증', axis: 2, val: 0.11 },
  { name: 'GDMT 완결도', axis: 3, val: 0.10 },
  { name: '다제약물 지수', axis: 3, val: 0.06 },
];

export const MODEL_METRICS = {
  d30: { auroc: 0.78, brier: 0.14, threshold: 0.35, rate: '14.4%' },
  d90: { auroc: 0.74, brier: 0.17, threshold: 0.42, rate: '22.8%' },
};

export const AXIS_DEFINITIONS = [
  {
    n: 1,
    key: '임상·생리',
    title: '관측 대상',
    color: C.axis1,
    soft: C.axis1Soft,
    sub: 'BNP/NT-proBNP·eGFR·전해질로 병태생리적 악화를 관측. 단기 교정 여지는 작음.',
    tags: ['measurement', 'condition_occurrence', 'BNP trajectory', 'eGFR slope'],
    metrics: [
      { key: 'BNP', unit: 'pg/mL', desc: '심부전 중증도 마커' },
      { key: 'eGFR', unit: 'mL/min', desc: '신기능 지표' },
      { key: 'K+', unit: 'mmol/L', desc: '전해질 균형' },
    ],
  },
  {
    n: 2,
    key: '영양',
    title: '개입 대상',
    color: C.axis2,
    soft: C.axis2Soft,
    sub: 'CONUT·GNRI·저알부민혈증·심장악액질. 영양 중재로 교정 가능성이 높음.',
    tags: ['CONUT', 'GNRI', '알부민 <3.5g/dL', 'Na <135mmol/L'],
    metrics: [
      { key: '알부민', unit: 'g/dL', desc: '영양 상태 지표' },
      { key: 'CONUT', unit: '점', desc: '영양불량 종합 점수' },
      { key: 'Na', unit: 'mmol/L', desc: '저나트륨혈증' },
    ],
  },
  {
    n: 3,
    key: '관리·치료',
    title: '개입 대상',
    color: C.axis3,
    soft: C.axis3Soft,
    sub: 'GDMT 처방·복약 순응도·진료 연속성. 관리 개입으로 교정 가능성이 높음.',
    tags: ['drug_era.GAP_DAYS', 'PDC/MPR', '진료연속성 지수', 'GDMT 4계열'],
    metrics: [
      { key: 'GDMT', unit: '/4계열', desc: '심부전 표준 치료 처방 완결도' },
      { key: 'PDC', unit: '%', desc: '복약 순응도' },
      { key: '연속성', unit: '점', desc: '진료 연속성 지수' },
    ],
  },
];

// ─── 제안서 대응 콘텐츠 (예선 아이디어 제안서 첨부용) ─────────────────────────

export interface EvalCriterion {
  code: string;
  name: string;
  weight: number;
  official: string;
  answer: string;
  color: string;
}

// 예선 심사기준 원문(시의성/실현성/참신성/파급성)과 배점을 그대로 반영하고,
// answer는 이 대시보드·아이디어가 각 기준에 어떻게 대응하는지를 설명한다.
export const EVAL_CRITERIA: EvalCriterion[] = [
  {
    code: 'TIMELINESS', name: '시의성', weight: 20,
    official: '아이디어 제안 배경 및 필요성',
    answer: '고령화·의료비 급증과 30일 14.4%·90일 22.8% 재입원율을 근거로, 지금 다뤄야 할 문제임을 제시합니다.',
    color: C.axis1,
  },
  {
    code: 'FEASIBILITY', name: '실현성', weight: 30,
    official: '제안 내용의 구현 및 실현·적용 가능성',
    answer: '표준 OMOP CDM 스키마와 데이터 가용성별 조건부 분석 경로(A/B/C)로, 본선 실데이터 반입 이후의 구현 리스크를 낮췄습니다.',
    color: C.axis2,
  },
  {
    code: 'NOVELTY', name: '참신성', weight: 30,
    official: '아이디어의 독창성·참신성',
    answer: '단일 위험 점수 대신 임상·영양·관리 3축을 교차해, "누가 위험한가"가 아니라 "무엇을 지금 바꿀 수 있는가"로 질문을 바꿉니다.',
    color: C.axis3,
  },
  {
    code: 'IMPACT', name: '파급성', weight: 20,
    official: '기대효과 및 파급력 · 아이디어의 향후 발전 가능성',
    answer: '영양 상담·복약 순응 관리·외래 연계 등 퇴원관리 자원 배분 근거로 쓰일 수 있고, 표준 스키마 기반이라 다른 OMOP 참여기관으로 확장할 수 있습니다.',
    color: C.gold,
  },
];

export const AXIS_CONNECTION =
  'eGFR 저하는 RAASi/MRA 감량으로 이어져 축3(치료 공백)을 만들 수 있습니다. 체질량 감소와 저알부민혈증은 단순 영양 부족이 아니라 개입이 필요한 임상 위험 신호입니다. 세 축을 독립적으로 관측하되, 교차하는 지점에서 개입 우선순위를 도출합니다.';

export const INTEGRITY_NOTE =
  '알부민·나트륨은 심부전 사망의 독립 예측인자로도 보고되어, 단순 영양 지표로만 다룰 수 없습니다. CONUT/GNRI의 구성요소를 중증도 공변량으로도 해석하고, 사망·복합결과와의 관계를 함께 검토합니다.';

export interface DomainRow {
  domain: string;
  tables: string;
  usage: string;
  status: '구조 확인' | '값 재확인';
}

export const DOMAIN_TABLE: DomainRow[] = [
  { domain: '인구·관측', tables: 'person · observation_period', usage: '기본 공변량·관측기간', status: '구조 확인' },
  { domain: '진단·코호트', tables: 'condition_occurrence · concept_ancestor', usage: 'HF 환자군 확장', status: '구조 확인' },
  { domain: '검사·수치', tables: 'measurement', usage: 'BNP·eGFR·CONUT/GNRI', status: '값 재확인' },
  { domain: '처방·관리', tables: 'drug_exposure · drug_era', usage: 'GDMT·GAP_DAYS', status: '구조 확인' },
  { domain: '방문·결과', tables: 'visit_occurrence', usage: '30/90일 재입원', status: '구조 확인' },
];

export interface ErdEntity {
  name: string;
  fields: string[];
  core: boolean;
}

export const ERD_ENTITIES: ErdEntity[] = [
  { name: 'PERSON', fields: ['person_id (PK)', '성별·출생연도'], core: true },
  { name: 'VISIT_OCCURRENCE', fields: ['person_id (FK)', '입·퇴원일 · 방문 유형'], core: true },
  { name: 'CONDITION_OCCURRENCE', fields: ['person_id (FK)', 'condition_concept_id'], core: true },
  { name: 'MEASUREMENT', fields: ['person_id (FK)', 'value_as_number · 단위'], core: true },
  { name: 'DRUG_EXPOSURE', fields: ['person_id (FK)', 'drug_concept_id'], core: true },
  { name: 'DRUG_ERA', fields: ['person_id (FK)', 'gap_days'], core: true },
  { name: 'CONCEPT / ANCESTOR', fields: ['개념 매핑 · 계층 확장'], core: true },
  { name: 'OBSERVATION · DEATH', fields: ['EF·NYHA / 사망정보', '본선 재확인 대상'], core: false },
];

export const PRIORITY_CHECKS = [
  'death 테이블의 존재·내용',
  'BNP·알부민·Na·Cr 실측값과 반복측정',
  'EF의 저장 위치·형식',
  'drug_era.GAP_DAYS 중간값과 이상치',
  '이뇨제 스크리닝·림프구수(CONUT 재료)',
];

export interface RouteItem {
  id: string;
  title: string;
  desc: string;
  tag: string;
}

export const ANALYSIS_ROUTES: { full: RouteItem[]; partial: RouteItem[]; base: RouteItem[] } = {
  full: [
    { id: 'A1', title: 'EF 세분화 GDMT + BNP trajectory', desc: 'EF·BNP 반복측정이 있고 수치형으로 저장된 경우', tag: '축1 완전' },
    { id: 'A2', title: 'CONUT + GNRI + 체중 추이', desc: '알부민·이뇨·림프구·체중·신장 확보 시', tag: '축2 완전' },
    { id: 'A3', title: '연속성 4지표 균등 가중', desc: '외래·입원·처방·처방공백을 모두 구분할 수 있는 경우', tag: '축3 완전' },
  ],
  partial: [
    { id: 'B1', title: '심부전 일반군 + 기본 검사값', desc: 'EF 부족 시 세분화 없이 코호트를 유지', tag: '조건부' },
    { id: 'B2', title: '알부민 + Na 또는 GNRI', desc: 'CONUT 재료가 일부 부족한 경우', tag: '조건부' },
    { id: 'B3', title: '처방공백 중심 관리지표', desc: '외래·입원 또는 방문 이력이 부족한 경우', tag: '조건부' },
  ],
  base: [
    { id: 'C1', title: '진단·약물·방문 프로파일', desc: '검사값이 희박해도 concept_ancestor·drug_era·방문으로 산출', tag: '최소 보장' },
    { id: 'C2', title: '재입원 단독 1차 결과', desc: 'death가 없으면 복합결과 대신 30/90일 재입원율로 수렴', tag: '최소 보장' },
  ],
};

export interface ChecklistItem {
  text: string;
  done: boolean;
}

export const SUBMISSION_CHECKLIST: ChecklistItem[] = [
  { text: 'OMOP CDM 핵심 테이블·PK/FK를 반영한 ERD', done: true },
  { text: '3축 피처의 문헌 근거와 1:1 매핑', done: true },
  { text: '"고위험 × 교정 가능 공백" 개입 우선순위 로직', done: true },
  { text: '실데이터 밀도·결측률·반복측정 본선 검증', done: false },
  { text: '30/90일 모델 성능·SHAP 결과 연결', done: false },
];
