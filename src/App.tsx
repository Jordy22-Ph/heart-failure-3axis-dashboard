import { useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer,
  ScatterChart, Scatter, CartesianGrid, ReferenceArea, ReferenceLine, LabelList,
} from 'recharts';
import {
  C, GAP_COLOR, GAP_BG, STATUS_STYLE, AXIS_COLOR, AXIS_SOFT, AXIS_LABEL,
  PATIENTS, READMISSION_BARS, SHAP_30D, SHAP_90D, SHAP_GLOBAL,
  MODEL_METRICS, AXIS_DEFINITIONS,
  EVAL_CRITERIA, AXIS_CONNECTION, INTEGRITY_NOTE, DOMAIN_TABLE, ERD_ENTITIES,
  PRIORITY_CHECKS, ANALYSIS_ROUTES, SUBMISSION_CHECKLIST,
  type Tab, type GapType, type StatusType, type Period, type Patient, type ShapFeature,
  type RouteItem,
} from './data';

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconGrid({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" fill={active ? '#fff' : 'currentColor'} opacity={active ? 1 : 0.6} />
      <rect x="11" y="2" width="7" height="7" rx="1.5" fill={active ? '#fff' : 'currentColor'} opacity={active ? 1 : 0.6} />
      <rect x="2" y="11" width="7" height="7" rx="1.5" fill={active ? '#fff' : 'currentColor'} opacity={active ? 1 : 0.6} />
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill={active ? '#fff' : 'currentColor'} opacity={active ? 1 : 0.6} />
    </svg>
  );
}
function IconScatter({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="5" cy="14" r="2.5" fill={active ? '#fff' : 'currentColor'} opacity={active ? 1 : 0.6} />
      <circle cx="12" cy="7" r="2.5" fill={active ? '#fff' : 'currentColor'} opacity={active ? 1 : 0.6} />
      <circle cx="16" cy="13" r="2" fill={active ? '#fff' : 'currentColor'} opacity={active ? 0.7 : 0.4} />
      <circle cx="8" cy="11" r="1.5" fill={active ? '#fff' : 'currentColor'} opacity={active ? 0.7 : 0.4} />
    </svg>
  );
}
function IconUsers({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="8" cy="6" r="3" fill={active ? '#fff' : 'currentColor'} opacity={active ? 1 : 0.6} />
      <path d="M2 16c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" opacity={active ? 1 : 0.6} />
      <circle cx="15" cy="7" r="2" fill={active ? '#fff' : 'currentColor'} opacity={active ? 0.7 : 0.4} />
      <path d="M18 16c0-2-1.343-3.5-3-3.5" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" opacity={active ? 0.7 : 0.4} />
    </svg>
  );
}
function IconBrain({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 3c-1.5 0-2.8.8-3.5 2C5 5.2 3.5 6.5 3.5 8.5c0 1.2.6 2.2 1.5 2.8V14a1 1 0 001 1h8a1 1 0 001-1v-2.7c.9-.6 1.5-1.6 1.5-2.8 0-2-1.5-3.3-3-3.5C12.8 3.8 11.5 3 10 3z"
        fill={active ? '#fff' : 'currentColor'} opacity={active ? 1 : 0.6} />
      <line x1="10" y1="8" x2="10" y2="14" stroke={active ? C.axis1 : 'transparent'} strokeWidth="1.2" />
    </svg>
  );
}
function IconChevron({ down }: { down?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: down ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconInfo() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 6v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function IconHeartPulse({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 16.5s-6-3.8-6-8A3.4 3.4 0 0110 6a3.4 3.4 0 016 2.5c0 4.2-6 8-6 8z"
        stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity={active ? 1 : 0.75} />
      <path d="M4.5 10h2l1-2.2 2 4.4 1.4-3h4.6"
        stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconHospital({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="4" y="3" width="12" height="14" rx="2" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.7" opacity={active ? 1 : 0.75} />
      <path d="M10 6v5M7.5 8.5h5M7 17v-3h6v3" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function IconClipboard({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M7 4.5h-.5A2.5 2.5 0 004 7v8a2 2 0 002 2h8a2 2 0 002-2V7a2.5 2.5 0 00-2.5-2.5H13"
        stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="7" y="3" width="6" height="3.5" rx="1.5" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.6" />
      <path d="M7.5 10h5M7.5 13h3" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" opacity={0.8} />
    </svg>
  );
}
function IconWallet({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 6.5A2.5 2.5 0 016.5 4H15a1 1 0 011 1v2H6.5A2.5 2.5 0 004 9.5v4A2.5 2.5 0 006.5 16H16a1 1 0 001-1v-3.5a1 1 0 00-1-1h-3.5a1.5 1.5 0 000 3H17"
        stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCare({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 10.5l3 3 7-7" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 17a7 7 0 100-14 7 7 0 000 14z" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.5" opacity={0.75} />
    </svg>
  );
}
function IconDatabase({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <ellipse cx="10" cy="5" rx="6.5" ry="2.5" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.7" opacity={active ? 1 : 0.75} />
      <path d="M3.5 5v10c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5V5" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.7" strokeLinecap="round" opacity={active ? 1 : 0.75} />
      <path d="M3.5 10c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.5" opacity={0.6} />
    </svg>
  );
}
function IconShieldCheck({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2.5l6 2.2v4.6c0 4-2.6 6.9-6 8.2-3.4-1.3-6-4.2-6-8.2V4.7l6-2.2z" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.7" strokeLinejoin="round" opacity={active ? 1 : 0.75} />
      <path d="M7.3 10.2l1.9 1.9 3.5-3.9" stroke={active ? '#fff' : 'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Shared micro-components ──────────────────────────────────────────────────

function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono-data"
      style={{ color, background: bg }}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: StatusType }) {
  const s = STATUS_STYLE[status];
  return <Pill label={status} color={s.color} bg={s.bg} />;
}

function ProgressBar({ value, color, bg = C.lineSoft, height = 6 }: {
  value: number; color: string; bg?: string; height?: number;
}) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ background: bg, height }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${width}%`, background: color }} />
    </div>
  );
}

function TrendIndicator({ label, direction }: { label: string; direction: 'up' | 'down' | 'neutral' }) {
  const style = direction === 'up'
    ? { color: C.riskHigh, background: C.riskHighSoft }
    : direction === 'down'
    ? { color: C.axis2, background: C.axis2Soft }
    : { color: C.inkFaint, background: C.lineSoft };
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-mono-data font-medium" style={style}>
      <span>{direction === 'up' ? '↑' : direction === 'down' ? '↓' : '–'}</span>
      {label}
    </span>
  );
}

function RiskBadge({ level }: { level: '높음' | '중간' | '낮음' | '개선' }) {
  const style = level === '높음'
    ? { color: C.riskHigh, background: C.riskHighSoft }
    : level === '중간'
    ? { color: C.gold, background: C.goldSoft }
    : level === '개선'
    ? { color: C.axis2, background: C.axis2Soft }
    : { color: C.inkFaint, background: C.lineSoft };
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" style={style}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}

function SectionLabel({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1" style={{ color: color ?? C.inkFaint }}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color ?? C.inkFaint }} />
      <span className="font-mono-data text-xs tracking-widest uppercase">{children}</span>
    </div>
  );
}

function Card({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`bg-white rounded-lg border ${className}`}
      style={{ borderColor: C.line, ...style }}>
      {children}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS: { tab: Tab | null; icon: React.FC<{ active?: boolean }>; label: string }[] = [
  { tab: 'overview', icon: IconGrid, label: '개요' },
  { tab: 'data', icon: IconDatabase, label: '데이터·ERD' },
  { tab: 'matrix', icon: IconScatter, label: '위험 매트릭스' },
  { tab: 'patients', icon: IconUsers, label: '환자 목록' },
  { tab: 'model', icon: IconBrain, label: 'AI 모델' },
  { tab: 'submission', icon: IconShieldCheck, label: '제출 준비' },
];

function Sidebar({ tab, setTab, expanded, onClose }: {
  tab: Tab; setTab: (t: Tab) => void; expanded: boolean; onClose: () => void;
}) {
  return (
    <>
      {expanded && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col py-5 transition-all duration-300
          ${expanded ? 'w-56' : 'w-16'}
          lg:relative lg:flex`}
        style={{ background: C.sidebar, minWidth: expanded ? 224 : 64 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: C.axis1 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 11 L5 7 L8 9 L11 4 L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="14" cy="5" r="1.5" fill="white" opacity="0.6" />
            </svg>
          </div>
          {expanded && (
            <div>
              <div className="text-white text-sm font-semibold leading-none">CardioCDM</div>
              <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>Analytics</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 px-2">
          {NAV_ITEMS.map(({ tab: t, icon: Icon, label }) => {
            const isActive = t !== null && tab === t;
            return (
              <button
                key={label}
                onClick={() => { if (t) { setTab(t); onClose(); } }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left
                  ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                style={isActive ? { background: C.axis1 } : {}}
                title={!expanded ? label : undefined}
              >
                <span className="flex-shrink-0"><Icon active={isActive} /></span>
                {expanded && <span className="text-sm font-medium">{label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

const TAB_LABELS: Record<Tab, { title: string; subtitle: string }> = {
  overview: { title: '심부전 3축 개입 우선순위', subtitle: '임상 위험 → 영양 위험 → 관리 위험 → 통합 위험 → 교정 가능성 → 개입 우선순위' },
  data: { title: '데이터 기반 · OMOP CDM ERD', subtitle: '안심존 반입 전 확인한 스키마 구조와 데이터 가용성별 조건부 분석 경로' },
  matrix: { title: '위험 × 교정 가능성 매트릭스', subtitle: '임상 위험 vs 교정 가능 공백 — 우상단이 최우선 개입 대상' },
  patients: { title: '개입 우선순위 목록', subtitle: '임상 위험 순 정렬 · 축별 공백으로 필터링' },
  model: { title: '재입원 예측 AI 모델', subtitle: '30일 / 90일 모델 성능 비교 · SHAP 변수 기여도' },
  submission: { title: '제출 준비 상태', subtitle: '예선 제안서 완성도 체크리스트 · 보안 유의사항' },
};

function Header({ tab, period, setPeriod, onMenuOpen }: {
  tab: Tab; period: Period; setPeriod: (p: Period) => void; onMenuOpen: () => void;
}) {
  const { title, subtitle } = TAB_LABELS[tab];
  const periods: Period[] = ['30일', '90일', '전체'];
  return (
    <header className="bg-white border-b flex-shrink-0 px-4 lg:px-6 py-3 flex items-center gap-4"
      style={{ borderColor: C.line }}>
      <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        onClick={onMenuOpen}>
        <IconMenu />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="text-base font-semibold truncate" style={{ color: C.ink }}>{title}</h1>
        <p className="text-xs truncate mt-0.5" style={{ color: C.inkFaint }}>{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          {periods.map(p => (
            <button key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                period === p ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

interface KPIData {
  value: string;
  label: string;
  note: string;
  icon: React.FC<{ active?: boolean }>;
  progress: number;
  risk: '높음' | '중간' | '낮음' | '개선';
  trendLabel?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  accentColor?: string;
}

function KPICard({ data }: { data: KPIData }) {
  const Icon = data.icon;
  const color = data.accentColor ?? C.ink;
  return (
    <Card className="p-4 flex min-h-[140px] flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border"
          style={{ color, background: `${color}12`, borderColor: `${color}26` }}>
          <Icon />
        </div>
        <RiskBadge level={data.risk} />
      </div>
      <div>
        <div className="text-xs font-medium" style={{ color: C.inkSoft }}>{data.label}</div>
        <div className="mt-1 text-2xl font-mono-data font-semibold leading-none" style={{ color }}>
          {data.value}
        </div>
      </div>
      <div className="mt-auto space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs truncate" style={{ color: C.inkFaint }}>{data.note}</span>
          {data.trendLabel && data.trendDirection && (
            <TrendIndicator label={data.trendLabel} direction={data.trendDirection} />
          )}
        </div>
        <ProgressBar value={data.progress} color={color} bg={C.lineSoft} />
      </div>
    </Card>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

const READMISSION_COLORS = [C.axis1, '#3B7EC8', C.axis3, C.riskHigh];

function ReadmissionChart({ period }: { period: Period }) {
  const bars = period === '30일'
    ? READMISSION_BARS.filter(b => b.period === '30일')
    : period === '90일'
    ? READMISSION_BARS.filter(b => b.period !== '30일')
    : READMISSION_BARS;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border rounded-lg p-2.5 shadow-lg text-sm" style={{ borderColor: C.line }}>
        <div className="text-xs font-medium mb-1" style={{ color: C.inkSoft }}>{label?.replace('\n', ' ')}</div>
        <div className="font-mono-data font-semibold text-base" style={{ color: C.ink }}>{payload[0].value}%</div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={bars} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}
        barCategoryGap="40%">
        <CartesianGrid vertical={false} stroke={C.lineSoft} />
        <XAxis dataKey="short" tick={{ fontSize: 11, fill: C.inkSoft }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 32]} tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: C.inkFaint }}
          axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: C.lineSoft, radius: 4 }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={42}>
          <LabelList dataKey="value" position="top" formatter={(v: any) => `${v}%`} style={{ fill: C.inkSoft, fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
          {bars.map((_, i) => (
            <Cell key={i} fill={READMISSION_COLORS[i % READMISSION_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface RiskFlowStep {
  title: string;
  subtitle: string;
  value: string;
  color: string;
  bg: string;
  progress: number;
  icon: React.FC<{ active?: boolean }>;
  badge: '높음' | '중간' | '낮음' | '개선';
}

function RiskFlowPanel() {
  const steps: RiskFlowStep[] = [
    {
      title: '임상 위험',
      subtitle: 'BNP · eGFR · 전해질',
      value: '축1',
      color: C.axis1,
      bg: C.axis1Soft,
      progress: 72,
      icon: IconHeartPulse,
      badge: '높음',
    },
    {
      title: '영양 위험',
      subtitle: 'CONUT · 알부민 · Na',
      value: '축2',
      color: C.axis2,
      bg: C.axis2Soft,
      progress: 64,
      icon: IconClipboard,
      badge: '중간',
    },
    {
      title: '관리 위험',
      subtitle: 'GDMT · PDC · 연속성',
      value: '축3',
      color: C.axis3,
      bg: C.axis3Soft,
      progress: 59,
      icon: IconHospital,
      badge: '중간',
    },
    {
      title: '통합 위험',
      subtitle: '3축 점수 결합',
      value: 'Risk',
      color: C.riskHigh,
      bg: C.riskHighSoft,
      progress: 76,
      icon: IconGrid,
      badge: '높음',
    },
    {
      title: '교정 가능성',
      subtitle: '영양·관리 공백',
      value: 'Gap',
      color: C.gold,
      bg: C.goldSoft,
      progress: 68,
      icon: IconCare,
      badge: '개선',
    },
    {
      title: '개입 우선순위',
      subtitle: '위험 × 교정 가능성',
      value: 'Action',
      color: C.ink,
      bg: '#EEF2F6',
      progress: 82,
      icon: IconBrain,
      badge: '높음',
    },
  ];

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <SectionLabel color={C.axis1}>3축 판단 흐름</SectionLabel>
          <div className="text-lg font-semibold" style={{ color: C.ink }}>
            임상 위험에서 개입 우선순위까지 한 번에 연결
          </div>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: C.inkSoft }}>
            병태생리 위험을 먼저 보고, 영양·관리 공백을 더해 통합 위험과 교정 가능성을 분리한 뒤 개입 순위를 정합니다.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2" style={{ borderColor: C.line, background: C.bg }}>
          <RiskBadge level="높음" />
          <span className="text-xs font-mono-data" style={{ color: C.inkSoft }}>Priority logic</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 xl:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] xl:items-stretch">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="contents">
              <div className="rounded-lg border p-3" style={{ borderColor: `${step.color}2E`, background: i < 3 ? '#FFFFFF' : step.bg }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border"
                    style={{ color: step.color, background: step.bg, borderColor: `${step.color}30` }}>
                    <Icon />
                  </div>
                  <RiskBadge level={step.badge} />
                </div>
                <div className="mt-3">
                  <div className="text-xs font-mono-data font-semibold" style={{ color: step.color }}>{step.value}</div>
                  <div className="mt-0.5 font-semibold" style={{ color: C.ink }}>{step.title}</div>
                  <div className="mt-1 text-xs leading-relaxed" style={{ color: C.inkSoft }}>{step.subtitle}</div>
                </div>
                <div className="mt-3">
                  <ProgressBar value={step.progress} color={step.color} bg={i < 3 ? C.lineSoft : 'rgba(255,255,255,0.75)'} height={7} />
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex items-center justify-center py-1 xl:px-0 xl:py-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border text-xs font-mono-data"
                    style={{ borderColor: C.line, color: C.inkFaint, background: 'white' }}>
                    <span className="xl:hidden">↓</span>
                    <span className="hidden xl:inline">→</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function EvaluationCriteria() {
  return (
    <div>
      <SectionLabel>예선 심사기준 대응</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {EVAL_CRITERIA.map(e => (
          <Card key={e.code} className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono-data text-xs tracking-wide" style={{ color: e.color }}>{e.code}</span>
              <span className="font-mono-data text-xs" style={{ color: C.inkFaint }}>{e.weight}점</span>
            </div>
            <div className="font-semibold text-sm mt-2" style={{ color: C.ink }}>{e.name}</div>
            <div className="text-xs mt-0.5" style={{ color: C.inkFaint }}>{e.official}</div>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: C.inkSoft }}>{e.answer}</p>
            <div className="mt-2.5">
              <ProgressBar value={e.weight} color={e.color} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OverviewTab({ activeAxis, setActiveAxis, period }: {
  activeAxis: number; setActiveAxis: (n: number) => void; period: Period;
}) {
  const kpis: KPIData[] = [
    { value: '2.58%', label: '국내 심부전 유병률', note: '2020년 기준', icon: IconHeartPulse, progress: 58, risk: '중간', trendLabel: '+200%', trendDirection: 'up', accentColor: C.axis1 },
    { value: '14.4%', label: '30일 재입원율', note: '267 / 1,857명', icon: IconHospital, progress: 64, risk: '높음', trendLabel: 'AUC .735', trendDirection: 'neutral', accentColor: C.riskHigh },
    { value: '22.8%', label: '90일 재입원율', note: '169 / 741명', icon: IconClipboard, progress: 76, risk: '높음', trendLabel: '장기↑', trendDirection: 'up', accentColor: C.axis3 },
    { value: '×16', label: '총 의료비용 증가', note: "'02→'22", icon: IconWallet, progress: 88, risk: '높음', trendLabel: '급증', trendDirection: 'up', accentColor: C.gold },
    { value: '-8%', label: '퇴원관리 개입 효과', note: '1주 이내 관리', icon: IconCare, progress: 42, risk: '개선', trendLabel: '재입원↓', trendDirection: 'down', accentColor: C.axis2 },
  ];

  const readmissionLabel = period === '30일' ? '30일 재입원율' : period === '90일' ? '90일 재입원율' : '재입원율 비교';
  const readmissionDesc = period === '30일'
    ? '30일 상급종합(14.4%) · 고위험군(19.0%)'
    : period === '90일'
    ? '90일 단일기관(22.8%) · 장기(KorHF 27%)'
    : '모집단·추적 기간에 따라 14.4%~27% 범위로 보고됨';

  return (
    <div className="space-y-6">
      <EvaluationCriteria />

      <RiskFlowPanel />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {kpis.map((k, i) => <KPICard key={i} data={k} />)}
      </div>

      {/* Chart + Axis cards */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Readmission bar chart */}
        <Card className="lg:col-span-2 p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <SectionLabel>정의별 비교</SectionLabel>
              <div className="font-semibold mb-0.5" style={{ color: C.ink }}>{readmissionLabel}</div>
              <p className="text-xs" style={{ color: C.inkSoft }}>{readmissionDesc}</p>
            </div>
            <div className="rounded-lg border px-2 py-1 text-xs font-mono-data" style={{ borderColor: C.line, color: C.inkSoft, background: C.bg }}>
              %
            </div>
          </div>
          <ReadmissionChart period={period} />
          <p className="text-xs mt-2 flex items-start gap-1" style={{ color: C.inkFaint }}>
            <IconInfo /><span>모집단·추적 기간에 따라 수치 차이가 발생함 — 단일 수치로 단정하지 않음</span>
          </p>
        </Card>

        {/* 3-axis cards */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <SectionLabel>세 개의 독립적 위험 축</SectionLabel>
          {AXIS_DEFINITIONS.map(a => {
            const isActive = activeAxis === a.n;
            return (
              <button key={a.n}
                onClick={() => setActiveAxis(a.n)}
                className={`text-left rounded-xl border p-3.5 transition-all hover:shadow-sm ${isActive ? 'shadow-sm' : ''}`}
                style={{
                  borderColor: isActive ? a.color : C.line,
                  background: isActive ? a.soft : 'white',
                }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <SectionLabel color={a.color}>축{a.n} · {a.key}</SectionLabel>
                    <div className="font-semibold text-sm mb-1" style={{ color: C.ink }}>{a.title}</div>
                    <p className="text-xs leading-relaxed" style={{ color: C.inkSoft }}>{a.sub}</p>
                  </div>
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold font-mono-data text-white"
                      style={{ background: a.color }}>
                      {a.n}
                    </div>
                  </div>
                </div>
                {isActive && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {a.tags.map(t => (
                      <span key={t} className="text-xs font-mono-data px-2 py-0.5 rounded-full"
                        style={{ color: a.color, background: `${a.color}18`, border: `1px solid ${a.color}33` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Axis connection */}
      <Card className="p-5">
        <SectionLabel color={C.gold}>축 간 연결</SectionLabel>
        <div className="font-semibold mb-1.5" style={{ color: C.ink }}>세 축은 독립적이지만, 교차 지점에서 개입 순위가 갈립니다</div>
        <p className="text-sm leading-relaxed" style={{ color: C.inkSoft }}>{AXIS_CONNECTION}</p>
      </Card>
    </div>
  );
}

// ─── Data · ERD Tab ───────────────────────────────────────────────────────────

const ROUTE_GROUPS: { key: 'full' | 'partial' | 'base'; label: string; color: string; bg: string }[] = [
  { key: 'full', label: '완전 분석', color: C.axis2, bg: C.axis2Soft },
  { key: 'partial', label: '축소 분석', color: C.gold, bg: C.goldSoft },
  { key: 'base', label: '최소 산출물', color: C.inkFaint, bg: C.lineSoft },
];

function RouteList({ items, color, bg }: { items: RouteItem[]; color: string; bg: string }) {
  return (
    <div className="space-y-2">
      {items.map(r => (
        <div key={r.id} className="flex items-start gap-3 rounded-lg border p-3" style={{ borderColor: C.lineSoft }}>
          <span className="font-mono-data text-xs font-semibold flex-shrink-0 mt-0.5" style={{ color: C.axis1 }}>{r.id}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium" style={{ color: C.ink }}>{r.title}</div>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: C.inkSoft }}>{r.desc}</p>
          </div>
          <span className="flex-shrink-0"><Pill label={r.tag} color={color} bg={bg} /></span>
        </div>
      ))}
    </div>
  );
}

function DataTab() {
  const [route, setRoute] = useState<'full' | 'partial' | 'base'>('full');
  const activeGroup = ROUTE_GROUPS.find(g => g.key === route)!;

  return (
    <div className="space-y-6">
      {/* Domain table */}
      <Card className="overflow-hidden">
        <div className="p-5 pb-3">
          <SectionLabel>안심존 반입 전 확인한 기반</SectionLabel>
          <div className="font-semibold" style={{ color: C.ink }}>OMOP CDM 도메인별 활용 계획</div>
          <p className="text-xs mt-1" style={{ color: C.inkSoft }}>예선 단계는 Eunomia 합성 표본으로 구조·연결만 확인했으며, 값 충실도·반복 측정은 본선 검증 대상입니다.</p>
        </div>
        <div className="grid gap-3 px-5 py-2.5 text-xs font-mono-data uppercase tracking-wide border-b"
          style={{ gridTemplateColumns: '1fr 1.6fr 1.4fr 96px', color: C.inkFaint, borderColor: C.line, background: C.bg }}>
          <div>도메인</div><div>주요 테이블</div><div>활용</div><div>상태</div>
        </div>
        <div className="divide-y" style={{ borderColor: C.lineSoft }}>
          {DOMAIN_TABLE.map(d => (
            <div key={d.domain} className="grid gap-3 px-5 py-3 items-center text-sm" style={{ gridTemplateColumns: '1fr 1.6fr 1.4fr 96px' }}>
              <div style={{ color: C.ink }}>{d.domain}</div>
              <div className="font-mono-data text-xs" style={{ color: C.inkSoft }}>{d.tables}</div>
              <div className="text-xs" style={{ color: C.inkSoft }}>{d.usage}</div>
              <div>
                <Pill label={d.status} color={d.status === '구조 확인' ? C.axis2 : C.gold} bg={d.status === '구조 확인' ? C.axis2Soft : C.goldSoft} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ERD grid */}
      <div>
        <SectionLabel>핵심 ERD · 표준 OMOP CDM 연결</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ERD_ENTITIES.map(e => (
            <div key={e.name}
              className={`rounded-lg border p-3 ${e.core ? '' : 'border-dashed'}`}
              style={{ borderColor: e.core ? '#CDDCFD' : C.gold, background: e.core ? C.axis1Soft : C.goldSoft }}>
              <div className="font-mono-data text-xs font-semibold" style={{ color: e.core ? C.axis1 : '#9B682B' }}>{e.name}</div>
              {e.fields.map(f => (
                <div key={f} className="text-xs mt-1" style={{ color: C.inkSoft }}>{f}</div>
              ))}
              {!e.core && <div className="text-xs mt-1.5 font-medium" style={{ color: '#9B682B' }}>본선 재확인 대상</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Priority checks + integrity note */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <SectionLabel>본선 우선 확인 5가지</SectionLabel>
          <div className="font-semibold mb-3" style={{ color: C.ink }}>안심존 반입 직후 점검 순서</div>
          <ol className="space-y-2">
            {PRIORITY_CHECKS.map((c, i) => (
              <li key={c} className="flex items-start gap-2.5 text-sm" style={{ color: C.inkSoft }}>
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono-data font-semibold text-white mt-0.5"
                  style={{ background: C.axis1 }}>{i + 1}</span>
                {c}
              </li>
            ))}
          </ol>
        </Card>

        <div className="rounded-xl border p-5 leading-relaxed text-sm" style={{ borderColor: C.gold, background: C.goldSoft, color: C.ink }}>
          <strong style={{ color: '#8A6A18' }}>정합성 원칙</strong>
          <p className="mt-2">{INTEGRITY_NOTE}</p>
        </div>
      </div>

      {/* Conditional analysis routes */}
      <Card className="p-5">
        <SectionLabel>데이터 가용성에 따른 조건부 분석 경로</SectionLabel>
        <div className="font-semibold mb-3" style={{ color: C.ink }}>본선 실데이터 밀도에 맞춰 세 단계로 대응합니다</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {ROUTE_GROUPS.map(g => {
            const isActive = route === g.key;
            return (
              <button key={g.key}
                onClick={() => setRoute(g.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                style={{
                  borderColor: isActive ? g.color : C.line,
                  color: isActive ? g.color : C.inkSoft,
                  background: isActive ? g.bg : 'white',
                }}>
                {g.label}
              </button>
            );
          })}
        </div>
        <RouteList items={ANALYSIS_ROUTES[route]} color={activeGroup.color} bg={activeGroup.bg} />
      </Card>
    </div>
  );
}

// ─── Matrix Tab ───────────────────────────────────────────────────────────────

function makeScatterDot(onDotClick: (p: Patient) => void, selectedId: string | null) {
  return function ScatterDot({ cx, cy, payload }: any) {
    const isSelected = selectedId === payload.id;
    const color = GAP_COLOR[payload.gap as GapType];
    return (
      <g onClick={() => onDotClick(payload)} style={{ cursor: 'pointer' }}>
        {isSelected && <circle cx={cx} cy={cy} r={11} fill={color} opacity={0.2} />}
        <circle
          cx={cx} cy={cy} r={isSelected ? 7 : 5.5}
          fill={color}
          stroke={isSelected ? C.ink : 'rgba(255,255,255,0.85)'}
          strokeWidth={isSelected ? 2 : 1}
        />
      </g>
    );
  };
}

const CustomMatrixTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  const color = GAP_COLOR[p.gap as GapType];
  const bg = GAP_BG[p.gap as GapType];
  return (
    <div className="bg-white rounded-xl border shadow-xl p-3 text-xs" style={{ borderColor: C.line }}>
      <div className="font-mono-data font-semibold text-sm mb-1" style={{ color: C.ink }}>{p.id}</div>
      <div className="space-y-0.5 mb-2" style={{ color: C.inkSoft }}>
        <div>임상 위험: <span className="font-mono-data font-medium" style={{ color: C.ink }}>{p.clinicalRisk}</span></div>
        <div>교정 가능 공백: <span className="font-mono-data font-medium" style={{ color: C.ink }}>{p.correctableGap}</span></div>
      </div>
      <Pill label={p.gap} color={color} bg={bg} />
    </div>
  );
};

const QUADRANT_LABELS = [
  { x: 25, y: 75, label: '영양·관리 공백\n(교정 대상)', color: C.axis2 },
  { x: 75, y: 75, label: '최우선 개입', color: C.riskHigh },
  { x: 25, y: 20, label: '표준 관찰', color: C.inkFaint },
  { x: 75, y: 20, label: '고위험\n(교정 여지 제한)', color: C.axis3 },
];

function MatrixTab({ selected, setSelected }: {
  selected: Patient | null; setSelected: (p: Patient | null) => void;
}) {
  const ScatterDot = makeScatterDot(setSelected, selected?.id ?? null);

  const gapTypes = Object.keys(GAP_COLOR) as GapType[];
  const priority = PATIENTS.filter(p => p.clinicalRisk >= 50 && p.correctableGap >= 60).length;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <SectionLabel>3.3절 · 통합 로직</SectionLabel>
            <div className="font-semibold" style={{ color: C.ink }}>위험 × 교정 가능성 매트릭스</div>
            <p className="text-xs mt-0.5" style={{ color: C.inkSoft }}>
              우상단 — 고위험·교정 가능 공백이 있는 환자 — 이 최우선 개입 대상 · 점을 클릭해 상세 확인
            </p>
          </div>
          {selected && (
            <button onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50 transition-colors"
              style={{ borderColor: C.line, color: C.inkSoft }}>
              <IconX /> 선택 해제
            </button>
          )}
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: '전체 환자', value: PATIENTS.length, color: C.axis1 },
            { label: '우선 개입', value: priority, color: C.riskHigh },
            { label: '영양 공백', value: PATIENTS.filter(p => p.gap.includes('영양')).length, color: C.axis2 },
            { label: '관리 공백', value: PATIENTS.filter(p => p.gap.includes('관리')).length, color: C.axis3 },
          ].map(s => (
            <div key={s.label} className="rounded-lg border px-3 py-2" style={{ borderColor: `${s.color}25`, background: `${s.color}0F` }}>
              <div className="text-xs" style={{ color: C.inkSoft }}>{s.label}</div>
              <div className="font-mono-data text-lg font-semibold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={420}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
            {/* Quadrant backgrounds */}
            <ReferenceArea x1={0} x2={50} y1={50} y2={100} fill={C.axis2Soft} fillOpacity={0.4} />
            <ReferenceArea x1={50} x2={100} y1={40} y2={100} fill="#FBF3E1" fillOpacity={0.7} />
            <ReferenceArea x1={0} x2={50} y1={0} y2={50} fill={C.lineSoft} fillOpacity={0.5} />
            <ReferenceArea x1={50} x2={100} y1={0} y2={40} fill={C.riskHighSoft} fillOpacity={0.5} />

            <CartesianGrid strokeDasharray="3 3" stroke={C.line} opacity={0.65} />

            <XAxis type="number" dataKey="clinicalRisk" domain={[0, 100]} name="임상 위험"
              label={{ value: '임상 위험 (축1) →', position: 'insideBottom', offset: -12, fontSize: 12, fill: C.inkSoft }}
              tick={{ fontSize: 11, fill: C.inkFaint }} axisLine={false} tickLine={false} />
            <YAxis type="number" dataKey="correctableGap" domain={[0, 100]} name="교정 가능 공백"
              label={{ value: '교정 가능 공백 (축2·3) →', angle: -90, position: 'insideLeft', offset: 12, fontSize: 12, fill: C.inkSoft }}
              tick={{ fontSize: 11, fill: C.inkFaint }} axisLine={false} tickLine={false} />

            {/* Dividers */}
            <ReferenceLine x={50} stroke={C.inkFaint} strokeDasharray="4 3" strokeWidth={1} />
            <ReferenceLine y={50} stroke={C.inkFaint} strokeDasharray="4 3" strokeWidth={1} />

            <Tooltip content={<CustomMatrixTooltip />} />
            <Scatter data={PATIENTS} shape={<ScatterDot />} />
          </ScatterChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-2 border-t" style={{ borderColor: C.lineSoft }}>
          {gapTypes.map(g => (
            <div key={g} className="flex items-center gap-1.5 text-xs" style={{ color: C.inkSoft }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: GAP_COLOR[g] }} />
              {g}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Patients Tab ─────────────────────────────────────────────────────────────

function MiniAxisCard({ num, title, color, soft, status, children }: {
  num: number; title: string; color: string; soft: string;
  status: StatusType; children: React.ReactNode;
}) {
  const s = STATUS_STYLE[status];
  return (
    <div className="flex-1 rounded-xl p-3 border" style={{ background: soft, borderColor: `${color}40` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono-data font-medium" style={{ color }}>축{num} · {title}</span>
        <StatusBadge status={status} />
      </div>
      <div className="flex gap-4">{children}</div>
    </div>
  );
}

function Metric({ label, value, unit }: { label: string; value: string | number; unit: string }) {
  return (
    <div>
      <div className="text-sm font-mono-data font-semibold" style={{ color: C.ink }}>
        {value}<span className="text-xs font-normal ml-0.5" style={{ color: C.inkFaint }}>{unit}</span>
      </div>
      <div className="text-xs mt-0.5" style={{ color: C.inkFaint }}>{label}</div>
    </div>
  );
}

function PatientDetail({ p }: { p: Patient }) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      <MiniAxisCard num={1} title="임상·생리" color={C.axis1} soft={C.axis1Soft} status={p.axis1.status}>
        <Metric label="BNP" value={p.axis1.bnp} unit="pg/mL" />
        <Metric label="eGFR" value={p.axis1.egfr} unit="mL/min" />
        <Metric label="K+" value={p.axis1.potassium} unit="mmol/L" />
      </MiniAxisCard>
      <MiniAxisCard num={2} title="영양" color={C.axis2} soft={C.axis2Soft} status={p.axis2.status}>
        <Metric label="알부민" value={p.axis2.albumin} unit="g/dL" />
        <Metric label="CONUT" value={p.axis2.conut} unit="점" />
        <Metric label="Na" value={p.axis2.sodium} unit="mmol/L" />
      </MiniAxisCard>
      <MiniAxisCard num={3} title="관리·치료" color={C.axis3} soft={C.axis3Soft} status={p.axis3.status}>
        <Metric label="GDMT" value={p.axis3.gdmtCount} unit="/4계열" />
        <Metric label="PDC" value={p.axis3.pdc} unit="%" />
        <Metric label="연속성" value={p.axis3.continuity} unit="점" />
      </MiniAxisCard>
    </div>
  );
}

function PatientsTab({ filter, setFilter, expandedId, setExpandedId, sortedPatients }: {
  filter: string; setFilter: (f: string) => void;
  expandedId: string | null; setExpandedId: (id: string | null) => void;
  sortedPatients: Patient[];
}) {
  const gapTypes: GapType[] = ['영양', '관리', '영양+관리', '교정 여지 작음', '공백 없음'];
  const filters = ['전체', ...gapTypes];
  const count = (f: string) => f === '전체' ? PATIENTS.length : PATIENTS.filter(p => p.gap === f).length;

  const handleRowClick = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map(f => {
          const isActive = filter === f;
          const c = f === '전체' ? C.axis1 : GAP_COLOR[f as GapType];
          const bg = f === '전체' ? C.axis1Soft : GAP_BG[f as GapType];
          return (
            <button key={f}
              onClick={() => { setFilter(f); setExpandedId(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={{
                borderColor: isActive ? c : C.line,
                color: isActive ? c : C.inkSoft,
                background: isActive ? bg : 'white',
              }}>
              {f}
              <span className="font-mono-data font-semibold">{count(f)}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="grid gap-3 px-4 py-2.5 text-xs font-mono-data uppercase tracking-wide border-b"
          style={{
            gridTemplateColumns: '90px 1fr 1fr 1fr 2fr 20px',
            color: C.inkFaint,
            borderColor: C.line,
            background: C.bg,
          }}>
          <div>환자</div>
          <div>임상 위험</div>
          <div>교정 공백</div>
          <div>주 공백</div>
          <div className="hidden md:block">권고 개입</div>
          <div />
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100" style={{ maxHeight: 520, overflowY: 'auto' }}>
          {sortedPatients.map(p => {
            const isOpen = expandedId === p.id;
            const gapColor = GAP_COLOR[p.gap];
            const gapBg = GAP_BG[p.gap];
            return (
              <div key={p.id}>
                <div
                  className={`grid gap-3 px-4 py-3 items-center cursor-pointer transition-colors hover:bg-gray-50 ${isOpen ? 'bg-blue-50/60' : ''}`}
                  style={{ gridTemplateColumns: '90px 1fr 1fr 1fr 2fr 20px' }}
                  onClick={() => handleRowClick(p.id)}
                >
                  <div className="font-mono-data text-sm font-medium" style={{ color: C.ink }}>{p.id}</div>
                  <div className="font-mono-data text-sm" style={{ color: p.clinicalRisk >= 65 ? C.riskHigh : p.clinicalRisk >= 45 ? C.gold : C.inkSoft }}>
                    <div className="flex items-center gap-1.5">
                      <span>{p.clinicalRisk}</span>
                      <div className="w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${p.clinicalRisk}%`, background: p.clinicalRisk >= 65 ? C.riskHigh : p.clinicalRisk >= 45 ? C.gold : C.axis1 }} />
                      </div>
                    </div>
                  </div>
                  <div className="font-mono-data text-sm" style={{ color: C.inkSoft }}>{p.correctableGap}</div>
                  <div><Pill label={p.gap} color={gapColor} bg={gapBg} /></div>
                  <div className="hidden md:block text-xs" style={{ color: C.inkSoft }}>{p.action}</div>
                  <div className="text-gray-400 transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-4 pb-3" style={{ background: '#F8FAFB' }}>
                    <div className="text-xs mb-2 pt-1" style={{ color: C.inkFaint }}>
                      <span className="font-medium" style={{ color: C.ink }}>권고 개입 — </span>{p.action}
                    </div>
                    <PatientDetail p={p} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <p className="text-xs flex items-start gap-1" style={{ color: C.inkFaint }}>
        <IconInfo />
        <span>환자 행을 클릭하면 축별(임상·영양·관리) 상세 지표가 펼쳐집니다. 표의 값은 OMOP CDM 구조 기반 예시이며 실데이터가 아닙니다.</span>
      </p>
    </div>
  );
}

// ─── Model Tab ────────────────────────────────────────────────────────────────

function ShapChart({ data, title, subtitle }: { data: ShapFeature[]; title: string; subtitle: string }) {
  const chartData = [...data].sort((a, b) => b.val - a.val);
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
      <div className="bg-white border rounded-lg p-2.5 shadow-lg text-xs" style={{ borderColor: C.line }}>
        <div className="font-medium mb-0.5" style={{ color: C.ink }}>{d.payload?.name}</div>
        <div className="font-mono-data" style={{ color: AXIS_COLOR[d.payload?.axis as number] }}>
          {AXIS_LABEL[d.payload?.axis as number]} · {d.value?.toFixed(2)}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-sm mb-0.5" style={{ color: C.ink }}>{title}</div>
          <p className="text-xs" style={{ color: C.inkFaint }}>{subtitle}</p>
        </div>
        <div className="rounded-lg border px-2 py-1 text-xs font-mono-data" style={{ borderColor: C.line, color: C.inkSoft, background: C.bg }}>
          SHAP
        </div>
      </div>
      <ResponsiveContainer width="100%" height={chartData.length * 36 + 20}>
        <BarChart layout="vertical" data={chartData} margin={{ top: 0, right: 46, left: 0, bottom: 0 }}>
          <XAxis type="number" domain={[0, 0.32]} tick={{ fontSize: 10, fill: C.inkFaint }}
            tickFormatter={v => v.toFixed(2)} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={155}
            tick={{ fontSize: 11, fill: C.inkSoft }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: C.lineSoft }} />
          <Bar dataKey="val" radius={[0, 6, 6, 0]} maxBarSize={16}
            label={{ position: 'right', formatter: (v: any) => typeof v === 'number' ? v.toFixed(2) : v, fontSize: 10, fill: C.inkFaint }}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={AXIS_COLOR[entry.axis]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Axis legend */}
      <div className="flex gap-4 mt-3 pt-3 border-t" style={{ borderColor: C.lineSoft }}>
        {[1, 2, 3].map(a => (
          <div key={a} className="flex items-center gap-1.5 text-xs" style={{ color: C.inkSoft }}>
            <span className="w-2 h-2 rounded-sm" style={{ background: AXIS_COLOR[a] }} />
            {AXIS_LABEL[a]}
          </div>
        ))}
      </div>
    </Card>
  );
}

function GlobalShapSection() {
  const sorted = [...SHAP_GLOBAL].sort((a, b) => b.val - a.val);
  const totals: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  SHAP_GLOBAL.forEach(f => { totals[f.axis] += f.val; });
  const sum = totals[1] + totals[2] + totals[3];
  const pct = (a: number) => Math.round((totals[a] / sum) * 100);

  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>전역 변수 중요도 · 핵심 가설 검증</SectionLabel>
        <ShapChart data={sorted} title="통합 모델 · 전체 SHAP 중요도 순위"
          subtitle="30일·90일 구분 없이 전체 피처를 하나의 순위로 — 축1에 편중되지 않는지가 관건" />
      </div>

      {/* Stacked axis contribution */}
      <Card className="p-4">
        <div className="text-sm font-medium mb-3" style={{ color: C.inkSoft }}>축별 기여 비중 합산</div>
        <div className="flex rounded-lg overflow-hidden h-8">
          {[1, 2, 3].map(a => (
            <div key={a} className="flex items-center justify-center text-xs font-mono-data text-white font-medium"
              style={{ width: `${pct(a)}%`, background: AXIS_COLOR[a] }}>
              {pct(a)}%
            </div>
          ))}
        </div>
        <div className="flex gap-5 mt-3 flex-wrap">
          {[1, 2, 3].map(a => (
            <div key={a} className="flex items-center gap-1.5 text-xs" style={{ color: C.inkSoft }}>
              <span className="w-2 h-2 rounded-sm" style={{ background: AXIS_COLOR[a] }} />
              {AXIS_LABEL[a]} · <span className="font-mono-data font-semibold" style={{ color: C.ink }}>{pct(a)}%</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="rounded-xl border p-4 text-sm leading-relaxed" style={{ borderColor: C.gold, background: C.goldSoft, color: C.ink }}>
        <strong>검증 대상 가설</strong> — 기존 재입원 모델이 임상·행정 변수에 편중되어 c-통계량 0.60에 그친다는 지적(Keenan 2008·Kansagara 2011)을 근거로,
        위처럼 축2(영양)·축3(관리) 변수가 전체 중요도의 상당 부분을 차지한다면,
        <em> "영양·관리 공백이 임상 지표와 독립적으로 재입원 위험을 설명한다"</em>는 전제가 실증적으로 뒷받침된다.
        본선 실데이터로 확정한다.
      </div>
    </div>
  );
}

function ModelTab({ period }: { period: Period }) {
  const [shapView, setShapView] = useState<'30일' | '90일' | '전체'>('전체');
  const shapData = shapView === '30일' ? SHAP_30D : shapView === '90일' ? SHAP_90D : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <SectionLabel color={C.gold}>2.6절 · 통합 모델링</SectionLabel>
        <div className="rounded-xl border-2 border-dashed p-6 text-center space-y-2"
          style={{ borderColor: C.inkFaint, background: 'repeating-linear-gradient(135deg, #FAFAFB, #FAFAFB 10px, #F3F4F6 10px, #F3F4F6 20px)' }}>
          <div className="text-2xl font-mono-data" style={{ color: C.inkFaint }}>?</div>
          <div className="font-semibold" style={{ color: C.inkSoft }}>모델 학습은 본선 실데이터로 진행 예정</div>
          <p className="text-sm max-w-md mx-auto" style={{ color: C.inkFaint }}>
            아래는 결과가 채워질 형식을 보여주는 예시입니다. 수치는 실제 학습 결과가 아닙니다.
          </p>
        </div>
      </div>

      {/* Model metrics */}
      <div>
        <SectionLabel>모델 성능 비교 (예시 형식)</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: '30일 재입원 모델', m: MODEL_METRICS.d30, color: C.axis1 },
            { label: '90일 재입원 모델', m: MODEL_METRICS.d90, color: C.axis3 },
          ].map(({ label, m, color }) => (
            <Card key={label} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold" style={{ color: C.ink }}>{label}</span>
                <span className="text-xs font-mono-data px-2 py-0.5 rounded-full" style={{ color: C.inkFaint, background: C.lineSoft }}>예시 값</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: m.auroc, l: 'AUROC', big: true },
                  { v: m.brier, l: 'Brier Score' },
                  { v: m.threshold, l: '최적 임계값' },
                  { v: m.rate, l: '표본 재입원율', str: true },
                ].map(({ v, l, big, str }) => (
                  <div key={l} className="border-t pt-2" style={{ borderColor: C.lineSoft }}>
                    <div className={`font-mono-data font-semibold ${big ? 'text-2xl' : 'text-lg'}`}
                      style={{ color: big ? color : C.ink }}>
                      {str ? v : typeof v === 'number' ? v : v}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: C.inkFaint }}>{l}</div>
                    {typeof v === 'number' && (
                      <div className="mt-2">
                        <ProgressBar value={v * 100} color={big ? color : C.inkSoft} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
        <p className="text-xs mt-2 flex items-start gap-1" style={{ color: C.inkFaint }}>
          <IconInfo /><span>두 모델은 별도로 학습하며, 판별력·보정력을 나란히 비교해 예측 시점에 따른 성능 차이를 확인합니다.</span>
        </p>
      </div>

      {/* SHAP comparison */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <SectionLabel>SHAP 변수 기여도 비교 (예시 형식)</SectionLabel>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {(['30일', '90일', '전체'] as const).map(p => (
              <button key={p}
                onClick={() => setShapView(p)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${shapView === p ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {shapView === '전체' ? (
          <GlobalShapSection />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ShapChart
              data={SHAP_30D}
              title="30일 모델"
              subtitle="단기 재입원은 병태생리적 악화(축1) 기여가 큼"
            />
            <ShapChart
              data={SHAP_90D}
              title="90일 모델"
              subtitle="장기 재입원은 관리·영양 공백(축2·3) 기여가 커짐"
            />
          </div>
        )}

        {shapView !== '전체' && (
          <div className="rounded-xl border p-4 text-sm leading-relaxed mt-3"
            style={{ borderColor: C.gold, background: C.goldSoft, color: C.ink }}>
            <strong>가설</strong> — 30일 모델은 BNP·eGFR 등 축1 피처가 상위권을 차지하고,
            90일 모델은 진료연속성·PDC 등 축3(관리)·축2(영양) 피처의 기여도가 상대적으로 커진다.
            맞다면 "단기는 병태생리, 장기는 교정 가능한 공백이 더 결정적"이라는 전제를 데이터로 뒷받침하는 근거가 된다.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Submission Tab ───────────────────────────────────────────────────────────

function SubmissionTab() {
  const doneCount = SUBMISSION_CHECKLIST.filter(c => c.done).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-1">
            <SectionLabel>제출물 완성도 체크리스트</SectionLabel>
            <span className="font-mono-data text-xs" style={{ color: C.inkSoft }}>{doneCount}/{SUBMISSION_CHECKLIST.length} 완료</span>
          </div>
          <div className="mb-4">
            <ProgressBar value={(doneCount / SUBMISSION_CHECKLIST.length) * 100} color={C.axis2} />
          </div>
          <div className="space-y-2">
            {SUBMISSION_CHECKLIST.map(c => (
              <div key={c.text} className="flex items-start gap-2.5 rounded-lg p-2.5 text-sm" style={{ background: C.bg }}>
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5"
                  style={c.done
                    ? { color: '#fff', background: C.axis2 }
                    : { color: C.gold, background: C.goldSoft, border: `1.5px solid ${C.gold}` }}>
                  {c.done ? '✓' : '!'}
                </span>
                <span style={{ color: c.done ? C.ink : C.inkSoft }}>{c.text}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border p-5 leading-relaxed text-sm" style={{ borderColor: C.gold, background: C.goldSoft, color: C.ink }}>
            <strong style={{ color: '#8A6A18' }}>보안 유의사항</strong>
            <p className="mt-2">이 대시보드는 안심존 실데이터를 불러오지 않습니다. 예선 단계에서는 구조 설계만 제시하며, 본선에 진출해 안심존 내에서 검증된 통계·모델 결과만 시각화로 확장합니다.</p>
          </div>
          <Card className="p-5">
            <SectionLabel color={C.axis1}>핵심 주장 요약</SectionLabel>
            <ul className="space-y-2.5 mt-2 text-sm" style={{ color: C.inkSoft }}>
              <li><strong style={{ color: C.ink }}>왜 3축인가</strong> — 임상 위험만으로는 "무엇을 지금 바꿀 수 있는가"에 답하지 못합니다.</li>
              <li><strong style={{ color: C.ink }}>왜 OMOP인가</strong> — 표준 스키마이므로 기관 간 재현·확장이 가능합니다.</li>
              <li><strong style={{ color: C.ink }}>왜 지금인가</strong> — 재입원·의료비 부담이 급증하는 시점에 교정 가능한 개입 우선순위가 필요합니다.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Right Panel ──────────────────────────────────────────────────────────────

function SummaryMetric({ label, value, color, progress }: {
  label: string; value: string | number; color: string; progress?: number;
}) {
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: `${color}30`, background: 'white' }}>
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-xs" style={{ color: C.inkSoft }}>{label}</div>
        <div className="font-mono-data text-lg font-semibold" style={{ color }}>{value}</div>
      </div>
      {progress !== undefined && (
        <div className="mt-2">
          <ProgressBar value={progress} color={color} bg={C.lineSoft} />
        </div>
      )}
    </div>
  );
}

function RightPanel({ tab, activeAxis, selected, filter, patients }: {
  tab: Tab; activeAxis: number; selected: Patient | null; filter: string; patients: Patient[];
}) {
  if (tab === 'overview') {
    const ax = AXIS_DEFINITIONS.find(a => a.n === activeAxis)!;
    const highRisk = patients.filter(p => p.clinicalRisk >= 65).length;
    const priority = patients.filter(p => p.clinicalRisk >= 50 && p.correctableGap >= 60).length;
    const avgClinical = Math.round(patients.reduce((sum, p) => sum + p.clinicalRisk, 0) / patients.length);
    const avgGap = Math.round(patients.reduce((sum, p) => sum + p.correctableGap, 0) / patients.length);
    return (
      <aside className="hidden xl:flex flex-col w-72 2xl:w-80 flex-shrink-0 border-l overflow-y-auto"
        style={{ borderColor: C.line, background: '#FAFBFC' }}>
        <div className="p-4 border-b" style={{ borderColor: C.line }}>
          <SectionLabel color={C.axis1}>Summary</SectionLabel>
          <div className="font-semibold" style={{ color: C.ink }}>코호트 요약 패널</div>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.inkSoft }}>
            현재 합성 코호트 {patients.length}명 기준 · 선택 축과 공백 분포를 함께 표시합니다.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-4 pb-2">
          <SummaryMetric label="고위험" value={highRisk} color={C.riskHigh} progress={(highRisk / patients.length) * 100} />
          <SummaryMetric label="개입 후보" value={priority} color={C.gold} progress={(priority / patients.length) * 100} />
          <SummaryMetric label="평균 위험" value={avgClinical} color={C.axis1} progress={avgClinical} />
          <SummaryMetric label="평균 공백" value={avgGap} color={C.axis2} progress={avgGap} />
        </div>

        <div className="px-4 py-3 border-y" style={{ borderColor: C.line }}>
          <SectionLabel color={ax.color}>축{ax.n} 상세 프로파일</SectionLabel>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold" style={{ color: C.ink }}>{ax.key}</div>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: C.inkSoft }}>{ax.sub}</p>
            </div>
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-mono-data font-semibold text-white"
              style={{ background: ax.color }}>
              {ax.n}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          {ax.metrics.map(m => (
            <div key={m.key} className="rounded-lg p-3 border" style={{ borderColor: `${ax.color}30`, background: ax.soft }}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono-data text-xs font-semibold" style={{ color: ax.color }}>{m.key}</span>
                <span className="text-xs font-mono-data" style={{ color: C.inkFaint }}>{m.unit}</span>
              </div>
              <div className="text-xs" style={{ color: C.inkSoft }}>{m.desc}</div>
            </div>
          ))}
        </div>

        {/* Gap distribution mini-chart */}
        <div className="p-4 border-t" style={{ borderColor: C.line }}>
          <div className="text-xs font-medium mb-3" style={{ color: C.inkSoft }}>공백 유형 분포</div>
          {(['영양', '관리', '영양+관리', '교정 여지 작음', '공백 없음'] as GapType[]).map(g => {
            const cnt = PATIENTS.filter(p => p.gap === g).length;
            const pct = Math.round((cnt / PATIENTS.length) * 100);
            return (
              <div key={g} className="mb-2">
                <div className="flex justify-between text-xs mb-0.5">
                  <span style={{ color: C.inkSoft }}>{g}</span>
                  <span className="font-mono-data" style={{ color: C.ink }}>{cnt}</span>
                </div>
                <ProgressBar value={pct} color={GAP_COLOR[g]} />
              </div>
            );
          })}
        </div>
      </aside>
    );
  }

  if (tab === 'matrix') {
    return (
      <aside className="hidden xl:flex flex-col w-72 2xl:w-80 flex-shrink-0 border-l overflow-y-auto"
        style={{ borderColor: C.line, background: '#FAFBFC' }}>
        {selected ? (
          <>
            <div className="p-4 border-b" style={{ borderColor: C.line }}>
              <SectionLabel color={GAP_COLOR[selected.gap]}>선택된 환자</SectionLabel>
              <div className="font-mono-data text-2xl font-semibold" style={{ color: C.ink }}>{selected.id}</div>
              <div className="flex items-center gap-2 mt-2">
                <Pill label={selected.gap} color={GAP_COLOR[selected.gap]} bg={GAP_BG[selected.gap]} />
              </div>
            </div>

            <div className="p-4 space-y-2">
              {/* Risk indicators */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-2.5 text-center" style={{ background: C.axis1Soft }}>
                  <div className="font-mono-data text-xl font-semibold" style={{ color: C.axis1 }}>{selected.clinicalRisk}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.inkSoft }}>임상 위험</div>
                  <div className="mt-2">
                    <ProgressBar value={selected.clinicalRisk} color={C.axis1} bg="rgba(255,255,255,0.75)" />
                  </div>
                </div>
                <div className="rounded-lg p-2.5 text-center" style={{ background: C.axis2Soft }}>
                  <div className="font-mono-data text-xl font-semibold" style={{ color: C.axis2 }}>{selected.correctableGap}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.inkSoft }}>교정 가능 공백</div>
                  <div className="mt-2">
                    <ProgressBar value={selected.correctableGap} color={C.axis2} bg="rgba(255,255,255,0.75)" />
                  </div>
                </div>
              </div>

              {/* Axis status */}
              {[
                { n: 1, label: '임상·생리', status: selected.axis1.status },
                { n: 2, label: '영양', status: selected.axis2.status },
                { n: 3, label: '관리·치료', status: selected.axis3.status },
              ].map(({ n, label, status }) => {
                const s = STATUS_STYLE[status as StatusType];
                return (
                  <div key={n} className="flex items-center justify-between p-2.5 rounded-lg border"
                    style={{ borderColor: C.lineSoft, background: 'white' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono-data font-semibold text-white"
                        style={{ background: AXIS_COLOR[n] }}>
                        {n}
                      </div>
                      <span className="text-xs font-medium" style={{ color: C.ink }}>축{n} {label}</span>
                    </div>
                    <Pill label={status} color={s.color} bg={s.bg} />
                  </div>
                );
              })}

              {/* Recommended action */}
              <div className="rounded-lg p-3" style={{ background: C.goldSoft, border: `1px solid ${C.gold}40` }}>
                <div className="text-xs font-medium mb-1" style={{ color: C.gold }}>권고 개입</div>
                <div className="text-sm" style={{ color: C.ink }}>{selected.action}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div>
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: C.lineSoft }}>
                <IconScatter />
              </div>
              <div className="text-sm font-medium mb-1" style={{ color: C.inkSoft }}>환자를 선택하세요</div>
              <p className="text-xs" style={{ color: C.inkFaint }}>
                매트릭스에서 점을 클릭하면 해당 환자의 축별 위험과 권고 개입이 표시됩니다.
              </p>
            </div>
          </div>
        )}
      </aside>
    );
  }

  if (tab === 'patients') {
    const groups = (['영양', '관리', '영양+관리', '교정 여지 작음', '공백 없음'] as GapType[]).map(g => ({
      gap: g, count: patients.filter(p => p.gap === g).length,
    }));
    const highRisk = patients.filter(p => p.clinicalRisk >= 65).length;
    const correctable = patients.filter(p => p.correctableGap >= 60 && p.clinicalRisk >= 50).length;

    return (
      <aside className="hidden xl:flex flex-col w-72 2xl:w-80 flex-shrink-0 border-l overflow-y-auto"
        style={{ borderColor: C.line, background: '#FAFBFC' }}>
        <div className="p-4 border-b" style={{ borderColor: C.line }}>
          <SectionLabel>코호트 요약</SectionLabel>
          <div className="font-semibold text-lg" style={{ color: C.ink }}>전체 {patients.length}명</div>
        </div>

        <div className="p-4 space-y-4">
          {/* Key stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg p-2.5 text-center border" style={{ borderColor: C.riskHigh + '40', background: C.riskHighSoft }}>
              <div className="font-mono-data text-xl font-semibold" style={{ color: C.riskHigh }}>{highRisk}</div>
              <div className="text-xs mt-0.5" style={{ color: C.inkSoft }}>고위험 (임상≥65)</div>
            </div>
            <div className="rounded-lg p-2.5 text-center border" style={{ borderColor: C.gold + '40', background: C.goldSoft }}>
              <div className="font-mono-data text-xl font-semibold" style={{ color: C.gold }}>{correctable}</div>
              <div className="text-xs mt-0.5" style={{ color: C.inkSoft }}>우선 개입 대상</div>
            </div>
          </div>

          {/* Gap distribution */}
          <div>
            <div className="text-xs font-medium mb-2" style={{ color: C.inkSoft }}>공백 유형별 환자 수</div>
            <div className="space-y-2">
              {groups.map(({ gap, count }) => {
                const pct = Math.round((count / patients.length) * 100);
                return (
                  <div key={gap}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span style={{ color: C.inkSoft }}>{gap}</span>
                      <span className="font-mono-data font-semibold" style={{ color: C.ink }}>{count}명 <span className="text-gray-400 font-normal">{pct}%</span></span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: C.lineSoft }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: GAP_COLOR[gap] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  if (tab === 'data') {
    const coreCount = ERD_ENTITIES.filter(e => e.core).length;
    const pendingCount = ERD_ENTITIES.length - coreCount;
    const confirmed = DOMAIN_TABLE.filter(d => d.status === '구조 확인').length;
    const recheck = DOMAIN_TABLE.length - confirmed;

    return (
      <aside className="hidden xl:flex flex-col w-72 2xl:w-80 flex-shrink-0 border-l overflow-y-auto"
        style={{ borderColor: C.line, background: '#FAFBFC' }}>
        <div className="p-4 border-b" style={{ borderColor: C.line }}>
          <SectionLabel color={C.axis1}>Summary</SectionLabel>
          <div className="font-semibold" style={{ color: C.ink }}>데이터 기반 요약</div>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.inkSoft }}>
            예선 단계에서 구조·연결을 확인한 OMOP CDM 엔티티와 도메인 상태입니다.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-4">
          <SummaryMetric label="핵심 엔티티" value={coreCount} color={C.axis1} progress={(coreCount / ERD_ENTITIES.length) * 100} />
          <SummaryMetric label="본선 재확인" value={pendingCount} color={C.gold} progress={(pendingCount / ERD_ENTITIES.length) * 100} />
          <SummaryMetric label="구조 확인" value={confirmed} color={C.axis2} progress={(confirmed / DOMAIN_TABLE.length) * 100} />
          <SummaryMetric label="값 재확인" value={recheck} color={C.axis3} progress={(recheck / DOMAIN_TABLE.length) * 100} />
        </div>

        <div className="px-4 pb-4">
          <div className="text-xs font-medium mb-2" style={{ color: C.inkSoft }}>조건부 분석 경로</div>
          <div className="space-y-2">
            {ROUTE_GROUPS.map(g => (
              <div key={g.key} className="flex items-center justify-between rounded-lg p-2.5 border" style={{ borderColor: C.lineSoft, background: 'white' }}>
                <span className="text-xs font-medium" style={{ color: C.ink }}>{g.label}</span>
                <Pill label={`${ANALYSIS_ROUTES[g.key].length}개 항목`} color={g.color} bg={g.bg} />
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  if (tab === 'submission') {
    const doneCount = SUBMISSION_CHECKLIST.filter(c => c.done).length;
    return (
      <aside className="hidden xl:flex flex-col w-72 2xl:w-80 flex-shrink-0 border-l overflow-y-auto"
        style={{ borderColor: C.line, background: '#FAFBFC' }}>
        <div className="p-4 border-b" style={{ borderColor: C.line }}>
          <SectionLabel color={C.axis2}>Summary</SectionLabel>
          <div className="font-semibold" style={{ color: C.ink }}>제출 준비 요약</div>
        </div>

        <div className="p-4">
          <SummaryMetric label="체크리스트 완료" value={`${doneCount}/${SUBMISSION_CHECKLIST.length}`} color={C.axis2}
            progress={(doneCount / SUBMISSION_CHECKLIST.length) * 100} />
        </div>

        <div className="px-4 pb-4">
          <div className="text-xs font-medium mb-2" style={{ color: C.inkSoft }}>심사기준 가중치</div>
          <div className="space-y-2">
            {EVAL_CRITERIA.map(e => (
              <div key={e.code} className="flex items-center justify-between rounded-lg p-2.5 border" style={{ borderColor: C.lineSoft, background: 'white' }}>
                <span className="text-xs font-medium" style={{ color: C.ink }}>{e.name}</span>
                <span className="font-mono-data text-xs font-semibold" style={{ color: e.color }}>{e.weight}점</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  // model tab
  return (
    <aside className="hidden xl:flex flex-col w-72 2xl:w-80 flex-shrink-0 border-l overflow-y-auto"
      style={{ borderColor: C.line, background: '#FAFBFC' }}>
      <div className="p-4 border-b" style={{ borderColor: C.line }}>
        <SectionLabel color={C.gold}>핵심 가설</SectionLabel>
        <div className="font-semibold" style={{ color: C.ink }}>3-축 분리의 타당성</div>
      </div>

      <div className="p-4 space-y-4">
        {/* Model comparison mini */}
        {[
          { label: '30일 모델 AUROC', value: 0.78, color: C.axis1, desc: '단기 예측력' },
          { label: '90일 모델 AUROC', value: 0.74, color: C.axis3, desc: '장기 예측력' },
        ].map(({ label, value, color, desc }) => (
          <div key={label} className="border rounded-lg p-3" style={{ borderColor: C.lineSoft, background: 'white' }}>
            <div className="text-xs mb-1" style={{ color: C.inkSoft }}>{label}</div>
            <div className="font-mono-data text-2xl font-semibold" style={{ color }}>{value}</div>
            <div className="mt-1.5 h-1.5 rounded-full" style={{ background: C.lineSoft }}>
              <div className="h-full rounded-full" style={{ width: `${value * 100}%`, background: color }} />
            </div>
            <div className="text-xs mt-1" style={{ color: C.inkFaint }}>{desc}</div>
          </div>
        ))}

        <div className="text-xs leading-relaxed p-3 rounded-lg" style={{ background: C.axis1Soft, color: C.inkSoft }}>
          <strong style={{ color: C.ink }}>기존 한계 (Kansagara 2011)</strong><br />
          임상·행정 변수 편중으로 c-통계량 0.60 한계. 본 연구는 영양·관리 축을 추가해 이를 극복하는 것이 목표.
        </div>
      </div>
    </aside>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState<Tab>('overview');
  const [activeAxis, setActiveAxis] = useState(1);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [filter, setFilter] = useState('전체');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('전체');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredPatients = filter === '전체'
    ? PATIENTS
    : PATIENTS.filter(p => p.gap === filter);
  const sortedPatients = [...filteredPatients].sort((a, b) => b.clinicalRisk - a.clinicalRisk);

  const handleTabChange = useCallback((t: Tab) => {
    setTab(t);
    setExpandedId(null);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: C.bg, fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <Sidebar
        tab={tab}
        setTab={handleTabChange}
        expanded={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 ml-16 lg:ml-0">
        <Header
          tab={tab}
          period={period}
          setPeriod={setPeriod}
          onMenuOpen={() => setSidebarOpen(true)}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {/* Sub-header with mobile period selector */}
            <div className="flex items-center justify-between mb-5 sm:hidden">
              <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border" style={{ borderColor: C.line }}>
                {(['30일', '90일', '전체'] as Period[]).map(p => (
                  <button key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${period === p ? 'bg-gray-900 text-white' : 'text-gray-500'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {tab === 'overview' && (
              <OverviewTab
                activeAxis={activeAxis}
                setActiveAxis={setActiveAxis}
                period={period}
              />
            )}
            {tab === 'data' && <DataTab />}
            {tab === 'matrix' && (
              <MatrixTab
                selected={selected}
                setSelected={setSelected}
              />
            )}
            {tab === 'patients' && (
              <PatientsTab
                filter={filter}
                setFilter={setFilter}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                sortedPatients={sortedPatients}
              />
            )}
            {tab === 'model' && <ModelTab period={period} />}
            {tab === 'submission' && <SubmissionTab />}
          </main>

          {/* Right panel */}
          <RightPanel
            tab={tab}
            activeAxis={activeAxis}
            selected={selected}
            filter={filter}
            patients={PATIENTS}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 border-t flex items-center gap-3 flex-shrink-0"
          style={{ borderColor: C.line, background: 'white' }}>
          <div className="text-xs" style={{ color: C.inkFaint }}>
            계명대 동산의료원 · 의료데이터안심존 · OMOP CDM v5.3.1 · 합성 데이터 기반 예선 단계 산출물
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: C.inkFaint }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.axis2 }} />
            Eunomia dump · v0.1
          </div>
        </div>
      </div>
    </div>
  );
}
