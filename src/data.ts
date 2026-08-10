export type Tab = 'overview' | 'matrix' | 'patients' | 'model';
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

export const PIPELINE_ROWS = [
  { step: '코호트 정의', desc: 'condition_occurrence + concept_ancestor 확장', status: '완료' as const },
  { step: '세 축 피처 산출', desc: 'measurement · drug_era · visit_occurrence', status: '완료' as const },
  { step: '재입원 라벨링', desc: '30/90일, 경쟁위험(사망) 처리', status: '예선 설계' as const },
  { step: '모델 학습·검증', desc: '30일·90일 로지스틱 회귀 · Gradient Boosting', status: '본선 예정' as const },
  { step: '성능 평가', desc: 'AUROC · Calibration · Decision Curve', status: '본선 예정' as const },
  { step: 'SHAP 비교', desc: '30일 vs 90일 모델 간 변수 기여도 비교', status: '본선 예정' as const },
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
