'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Download,
  ChevronRight,
  Scale,
  Users,
  FolderOpen,
  UserCheck,
  BarChart3,
  AlertCircle,
  Info,
  Calendar,
  Timer,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { cn, formatKES } from '@/lib/utils';
import { useCampaign } from '@/lib/campaign-context';
import { getComplianceStatus } from '@/lib/actions/compliance';
import type { ComplianceAlert } from '@/lib/actions/compliance';
import { Button, StatCard } from '@/components/ui';
import { AnimatedCounter } from '@/components/premium';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/premium';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const STATUS_COLORS = {
  pass: '#1D6B3F',
  warning: '#ED8936',
  fail: '#E53E3E',
};

const SPENDING_LIMIT = 35_000_000;
const TOTAL_SPENT = 18_750_000;
const TOTAL_DONATIONS = 22_400_000;

/* -------------------------------------------------------------------------- */
/*  Compliance Checks Data                                                    */
/* -------------------------------------------------------------------------- */

const complianceChecks = [
  {
    id: 'spending-limit',
    label: 'Spending within ECFA limit',
    description: `Campaign spending at ${Math.round((TOTAL_SPENT / SPENDING_LIMIT) * 100)}% of KES 35M limit`,
    status: 'pass' as const,
    category: 'Financial',
  },
  {
    id: 'donation-limits',
    label: 'All donations within legal limits',
    description: 'No individual donation exceeds KES 500,000 threshold',
    status: 'pass' as const,
    category: 'Financial',
  },
  {
    id: 'anonymous-cap',
    label: 'Anonymous donations compliant',
    description: '2 anonymous donations total KES 35,000 (threshold: KES 5,000 each)',
    status: 'pass' as const,
    category: 'Financial',
  },
  {
    id: 'cash-limit',
    label: 'Cash transaction limit exceeded',
    description: '2 cash transactions above KES 100,000 without bank documentation',
    status: 'fail' as const,
    category: 'Financial',
  },
  {
    id: 'kyc-verification',
    label: 'Donor KYC verification',
    description: '3 donors pending KYC verification for donations over KES 100,000',
    status: 'warning' as const,
    category: 'Donor',
  },
  {
    id: 'prohibited-sources',
    label: 'No prohibited funding sources',
    description: 'All donation sources verified against IEBC prohibited list',
    status: 'pass' as const,
    category: 'Donor',
  },
  {
    id: 'foreign-donations',
    label: 'No foreign donations detected',
    description: 'All donors verified as Kenyan nationals or registered entities',
    status: 'pass' as const,
    category: 'Donor',
  },
  {
    id: 'receipt-compliance',
    label: 'Receipt documentation',
    description: '94% of expenditures have receipts attached (target: 100%)',
    status: 'warning' as const,
    category: 'Documentation',
  },
  {
    id: 'evidence-integrity',
    label: 'Evidence vault integrity',
    description: 'All 47 evidence items pass SHA-256 hash verification',
    status: 'pass' as const,
    category: 'Documentation',
  },
  {
    id: 'agent-payments',
    label: 'Agent payment records',
    description: 'All 23 agent payments documented and within IEBC guidelines',
    status: 'pass' as const,
    category: 'Personnel',
  },
  {
    id: 'reporting-deadline',
    label: 'Filing deadline compliance',
    description: 'Next quarterly report due in 18 days',
    status: 'warning' as const,
    category: 'Reporting',
  },
];

/* -------------------------------------------------------------------------- */
/*  Radar Chart Data (compliance by category)                                 */
/* -------------------------------------------------------------------------- */

const CATEGORY_ICONS: Record<string, typeof Scale> = {
  Financial: Scale,
  Donor: Users,
  Documentation: FolderOpen,
  Personnel: UserCheck,
  Reporting: BarChart3,
};

function getCategoryScore(category: string): number {
  const items = complianceChecks.filter((c) => c.category === category);
  if (items.length === 0) return 0;
  const passed = items.filter((c) => c.status === 'pass').length;
  return Math.round((passed / items.length) * 100);
}

const _radarData = ['Financial', 'Donor', 'Documentation', 'Personnel', 'Reporting'].map(
  (cat) => ({
    category: cat,
    score: getCategoryScore(cat),
    fullMark: 100,
  })
);

/* -------------------------------------------------------------------------- */
/*  Category Bar Chart Data                                                   */
/* -------------------------------------------------------------------------- */

const _barChartData = ['Financial', 'Donor', 'Documentation', 'Personnel', 'Reporting'].map(
  (cat) => {
    const items = complianceChecks.filter((c) => c.category === cat);
    const pass = items.filter((c) => c.status === 'pass').length;
    const warn = items.filter((c) => c.status === 'warning').length;
    const fail = items.filter((c) => c.status === 'fail').length;
    return { category: cat, Pass: pass, Warning: warn, Fail: fail };
  }
);

/* -------------------------------------------------------------------------- */
/*  Recent Alerts                                                             */
/* -------------------------------------------------------------------------- */

const recentAlerts = [
  {
    id: '1',
    message: 'Cash transaction of KES 145,000 at Kisumu rally -- bank documentation missing',
    severity: 'fail' as const,
    time: '1 hour ago',
    resolved: false,
  },
  {
    id: '2',
    message: 'Donation from Daniel Kiprotich (KES 450,000) requires KYC verification',
    severity: 'warning' as const,
    time: '2 hours ago',
    resolved: false,
  },
  {
    id: '3',
    message: 'Quarterly ECFA report due in 18 days -- preparation recommended',
    severity: 'info' as const,
    time: '1 day ago',
    resolved: false,
  },
  {
    id: '4',
    message: 'Receipt missing for transport expense (KES 85,000) -- Mombasa rally',
    severity: 'warning' as const,
    time: '2 days ago',
    resolved: false,
  },
  {
    id: '5',
    message: 'Agent allowance batch payment KES 230,000 recorded and verified',
    severity: 'success' as const,
    time: '3 days ago',
    resolved: true,
  },
  {
    id: '6',
    message: 'Spending threshold reached: 50% of campaign limit utilized',
    severity: 'info' as const,
    time: '5 days ago',
    resolved: true,
  },
];

/* -------------------------------------------------------------------------- */
/*  Filing Deadlines                                                          */
/* -------------------------------------------------------------------------- */

const filingDeadlines = [
  { id: 'q1-2026', name: 'Q1 2026 Quarterly Report', status: 'draft' as const, dueDate: '2026-03-18', daysLeft: 18 },
  { id: 'donation-register', name: 'Donation Register Update', status: 'current' as const, dueDate: '2026-03-31', daysLeft: 31 },
  { id: 'expenditure-q1', name: 'Expenditure Summary Q1', status: 'current' as const, dueDate: '2026-04-15', daysLeft: 46 },
];

/* -------------------------------------------------------------------------- */
/*  Reports                                                                   */
/* -------------------------------------------------------------------------- */

const reports = [
  { id: 'q1-2026', name: 'Q1 2026 Quarterly Report', status: 'draft' as const, dueDate: '2026-03-18' },
  { id: 'initial', name: 'Initial Campaign Filing', status: 'submitted' as const, dueDate: '2026-03-01' },
  { id: 'donation-register', name: 'Donation Register', status: 'current' as const, dueDate: 'Ongoing' },
  { id: 'expenditure-report', name: 'Expenditure Summary', status: 'current' as const, dueDate: 'Ongoing' },
  { id: 'agent-report', name: 'Agent Payments Report', status: 'submitted' as const, dueDate: '2026-02-15' },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const statusIcon = { pass: CheckCircle2, warning: AlertTriangle, fail: XCircle };

function severityIcon(severity: string) {
  switch (severity) {
    case 'fail':
      return <XCircle className="h-4 w-4 text-red" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-orange" />;
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-green" />;
    case 'info':
      return <Info className="h-4 w-4 text-blue" />;
    default:
      return <AlertCircle className="h-4 w-4 text-text-tertiary" />;
  }
}

/* -------------------------------------------------------------------------- */
/*  Custom Tooltip                                                            */
/* -------------------------------------------------------------------------- */

function BarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-surface-border px-3 py-2">
      <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-text-primary">{entry.name}: {entry.value}</span>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Compliance Score Ring (custom SVG)                                        */
/* -------------------------------------------------------------------------- */

function ComplianceScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? STATUS_COLORS.pass : score >= 60 ? STATUS_COLORS.warning : STATUS_COLORS.fail;

  return (
    <div className="relative h-40 w-40">
      <svg className="h-40 w-40 -rotate-90" viewBox="0 0 128 128">
        {/* Background ring */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="10"
        />
        {/* Score ring */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
        {/* Glow effect */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          opacity="0.15"
          filter="blur(4px)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedCounter
          value={score}
          suffix="%"
          className="text-3xl font-extrabold text-navy"
        />
        <p className="text-[10px] text-text-tertiary font-medium mt-0.5">Compliance</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                            */
/* -------------------------------------------------------------------------- */

// ---------------------------------------------------------------------------
// Map server ComplianceAlert to the UI alert format
// ---------------------------------------------------------------------------

function mapServerAlertToUI(alert: ComplianceAlert) {
  const severityMap: Record<string, 'fail' | 'warning' | 'info' | 'success'> = {
    critical: 'fail',
    warning: 'warning',
    info: 'info',
  };
  return {
    id: alert.id,
    message: alert.message,
    severity: severityMap[alert.level] ?? ('info' as const),
    time: new Date(alert.timestamp).toLocaleString(),
    resolved: alert.resolved,
  };
}

export default function CompliancePage() {
  const { campaign } = useCampaign();
  const activeCampaignId = campaign?.id ?? null;

  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  // Compliance data state (defaults to mock data values)
  const [activeComplianceChecks, setActiveComplianceChecks] = useState(complianceChecks);
  const [activeAlerts, setActiveAlerts] = useState(recentAlerts);
  const [spendingLimit, setSpendingLimit] = useState(SPENDING_LIMIT);
  const [totalSpent, setTotalSpent] = useState(TOTAL_SPENT);
  const [totalDonations, _setTotalDonations] = useState(TOTAL_DONATIONS);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const refreshCompliance = useCallback(async () => {
    if (!activeCampaignId) return;
    setLoading(true);
    try {
      const result = await getComplianceStatus(activeCampaignId);
      if (!result.error) {
        // Map server compliance data to the checks format
        const serverChecks: typeof complianceChecks = [];

        // Map category spending to checks
        for (const cat of result.categorySpending) {
          const status = cat.percentage > 100 ? 'fail' : cat.percentage > 80 ? 'warning' : 'pass';
          serverChecks.push({
            id: `cat-${cat.category}`,
            label: `${cat.category} spending`,
            description: `${cat.category} at ${cat.percentage.toFixed(0)}% of KES ${formatKES(cat.limit)} limit`,
            status: status as 'pass' | 'warning' | 'fail',
            category: 'Financial',
          });
        }

        // Map donation compliance to checks
        if (result.donationCompliance.anonymousOverThreshold === 0) {
          serverChecks.push({
            id: 'anon-ok',
            label: 'Anonymous donations compliant',
            description: 'No anonymous donations exceed ECFA threshold',
            status: 'pass',
            category: 'Donor',
          });
        } else {
          serverChecks.push({
            id: 'anon-fail',
            label: 'Anonymous donation violations',
            description: `${result.donationCompliance.anonymousOverThreshold} anonymous donation(s) exceed threshold`,
            status: 'fail',
            category: 'Donor',
          });
        }

        if (result.donationCompliance.singleSourceViolations === 0) {
          serverChecks.push({
            id: 'single-source-ok',
            label: 'No single-source violations',
            description: 'All donors within 20% single-source cap',
            status: 'pass',
            category: 'Donor',
          });
        } else {
          serverChecks.push({
            id: 'single-source-fail',
            label: 'Single-source cap exceeded',
            description: `${result.donationCompliance.singleSourceViolations} donor(s) exceed 20% single-source cap`,
            status: 'fail',
            category: 'Donor',
          });
        }

        if (result.donationCompliance.kycPending === 0) {
          serverChecks.push({
            id: 'kyc-ok',
            label: 'Donor KYC verification complete',
            description: 'All donors have completed KYC verification',
            status: 'pass',
            category: 'Donor',
          });
        } else {
          serverChecks.push({
            id: 'kyc-pending',
            label: 'Donor KYC verification pending',
            description: `${result.donationCompliance.kycPending} donation(s) pending KYC verification`,
            status: 'warning',
            category: 'Donor',
          });
        }

        // Only update if we got real server data (non-empty checks)
        if (serverChecks.length > 0) {
          setActiveComplianceChecks(serverChecks);
        }

        // Map server alerts
        if (result.alerts.length > 0) {
          setActiveAlerts(result.alerts.map(mapServerAlertToUI));
        }

        // Update spending data from category spending
        const serverTotalSpent = result.categorySpending.reduce((sum, c) => sum + c.spent, 0);
        if (serverTotalSpent > 0 || result.categorySpending.length > 0) {
          setTotalSpent(serverTotalSpent);
          // Use the campaign's spending limit
          const campaignLimit = campaign?.spending_limit_kes ?? SPENDING_LIMIT;
          setSpendingLimit(campaignLimit);
        }
      }
    } catch {
      // On error, keep mock data
    } finally {
      setLoading(false);
    }
  }, [activeCampaignId, campaign?.spending_limit_kes]);

  useEffect(() => {
    refreshCompliance();
  }, [refreshCompliance]);

  // ---------------------------------------------------------------------------
  // Derived data (now based on active state instead of hardcoded constants)
  // ---------------------------------------------------------------------------

  const passCount = activeComplianceChecks.filter((c) => c.status === 'pass').length;
  const warnCount = activeComplianceChecks.filter((c) => c.status === 'warning').length;
  const failCount = activeComplianceChecks.filter((c) => c.status === 'fail').length;
  const overallScore = activeComplianceChecks.length > 0
    ? Math.round((passCount / activeComplianceChecks.length) * 100)
    : 0;

  const categories = ['all', ...Array.from(new Set(activeComplianceChecks.map((c) => c.category)))];
  const filtered =
    filterCategory === 'all'
      ? activeComplianceChecks
      : activeComplianceChecks.filter((c) => c.category === filterCategory);

  const spendingPercent = spendingLimit > 0 ? Math.round((totalSpent / spendingLimit) * 100) : 0;

  // Recompute radar data based on current checks
  const activeRadarData = ['Financial', 'Donor', 'Documentation', 'Personnel', 'Reporting'].map(
    (cat) => {
      const items = activeComplianceChecks.filter((c) => c.category === cat);
      const score = items.length > 0
        ? Math.round((items.filter((c) => c.status === 'pass').length / items.length) * 100)
        : 0;
      return { category: cat, score, fullMark: 100 };
    }
  );

  // Recompute bar chart data based on current checks
  const activeBarChartData = ['Financial', 'Donor', 'Documentation', 'Personnel', 'Reporting'].map(
    (cat) => {
      const items = activeComplianceChecks.filter((c) => c.category === cat);
      const pass = items.filter((c) => c.status === 'pass').length;
      const warn = items.filter((c) => c.status === 'warning').length;
      const fail = items.filter((c) => c.status === 'fail').length;
      return { category: cat, Pass: pass, Warning: warn, Fail: fail };
    }
  );

  return (
    <div>
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-40 bg-white/60 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 border-3 border-blue border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-text-secondary font-medium">Loading compliance data...</p>
          </div>
        </div>
      )}

      {/* ---- Header ---- */}
      <FadeIn direction="down" duration={0.35}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-navy flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-green" />
              Compliance Dashboard
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              ECFA compliance monitoring, reporting deadlines, and audit status
            </p>
          </div>
          <Button>
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </FadeIn>

      {/* ---- Score + Stats Row ---- */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          {/* Compliance Score Ring */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-surface-border p-6 flex flex-col items-center justify-center">
            <ComplianceScoreRing score={overallScore} />
            <p className="text-sm font-semibold text-navy mt-3">Overall Score</p>
            <p className="text-[10px] text-text-tertiary mt-0.5">
              {passCount} pass / {warnCount} warnings / {failCount} failures
            </p>
          </div>

          {/* 3 Mini Stat Cards */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <StatCard
              label="Checks Passed"
              value={
                <AnimatedCounter
                  value={passCount}
                  className="text-xl font-extrabold"
                />
              }
              sub={`of ${activeComplianceChecks.length} total checks`}
              variant="green"
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <StatCard
              label="Warnings"
              value={
                <AnimatedCounter
                  value={warnCount}
                  className="text-xl font-extrabold"
                />
              }
              sub="Require attention"
              variant="orange"
              icon={<AlertTriangle className="h-4 w-4" />}
            />
            <StatCard
              label="Violations"
              value={
                <AnimatedCounter
                  value={failCount}
                  className="text-xl font-extrabold"
                />
              }
              sub="Immediate action needed"
              variant="red"
              icon={<XCircle className="h-4 w-4" />}
            />
          </div>

          {/* Radar Chart */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-surface-border p-5">
            <h2 className="text-sm font-bold text-navy mb-1">By Category</h2>
            <p className="text-[10px] text-text-tertiary mb-2">Compliance score breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={activeRadarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: '#94A3B8' }}
                  tickCount={3}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#1D6B3F"
                  fill="#1D6B3F"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Stacked Bar Chart */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-surface-border p-5">
            <h2 className="text-sm font-bold text-navy mb-1">Check Results</h2>
            <p className="text-[10px] text-text-tertiary mb-2">By category breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activeBarChartData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 9, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="Pass" stackId="a" fill={STATUS_COLORS.pass} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Warning" stackId="a" fill={STATUS_COLORS.warning} />
                <Bar dataKey="Fail" stackId="a" fill={STATUS_COLORS.fail} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </FadeIn>

      {/* ---- Spending Limit Bar ---- */}
      <FadeIn delay={0.2}>
        <div className="bg-white rounded-xl border border-surface-border p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue/10 flex items-center justify-center">
                <Scale className="h-5 w-5 text-blue" />
              </div>
              <div>
                <p className="text-sm font-bold text-navy">ECFA Spending Limit</p>
                <p className="text-xs text-text-tertiary">
                  {formatKES(totalSpent)} of {formatKES(spendingLimit)} utilized
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-text-tertiary">Remaining</p>
                <p className="text-sm font-bold text-navy">{formatKES(spendingLimit - totalSpent)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-tertiary">Total Donations</p>
                <p className="text-sm font-bold text-green">{formatKES(totalDonations)}</p>
              </div>
            </div>
          </div>
          <div className="w-full h-3 bg-surface-bg rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${spendingPercent}%`,
                background: spendingPercent >= 90
                  ? STATUS_COLORS.fail
                  : spendingPercent >= 70
                    ? STATUS_COLORS.warning
                    : STATUS_COLORS.pass,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-text-tertiary">0%</p>
            <p className="text-xs font-semibold" style={{ color: spendingPercent >= 90 ? STATUS_COLORS.fail : spendingPercent >= 70 ? STATUS_COLORS.warning : STATUS_COLORS.pass }}>
              {spendingPercent}% utilized
            </p>
            <p className="text-[10px] text-text-tertiary">100%</p>
          </div>
        </div>
      </FadeIn>

      {/* ---- Compliance Check Cards ---- */}
      <FadeIn delay={0.3}>
        <div className="bg-white rounded-xl border border-surface-border mb-6">
          <div className="px-5 py-4 border-b border-surface-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-navy">Compliance Checks</h2>
              <span className="text-xs text-text-tertiary">
                {filtered.length} check{filtered.length !== 1 ? 's' : ''}{loading ? ' (loading...)' : ''}
              </span>
            </div>
            {/* Category filter pills */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => {
                const isActive = filterCategory === cat;
                const CatIcon = cat !== 'all' ? CATEGORY_ICONS[cat] : ShieldCheck;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                      isActive
                        ? 'bg-navy text-white shadow-sm'
                        : 'bg-surface-bg text-text-secondary hover:bg-surface-border-light'
                    )}
                  >
                    {CatIcon && <CatIcon className="h-3 w-3" />}
                    {cat === 'all' ? 'All Checks' : cat}
                  </button>
                );
              })}
            </div>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {filtered.map((check) => {
              const Icon = statusIcon[check.status];
              const color = STATUS_COLORS[check.status];
              const CatIcon = CATEGORY_ICONS[check.category];
              return (
                <StaggerItem key={check.id}>
                  <div
                    className={cn(
                      'relative flex flex-col p-4 rounded-xl border transition-all hover:shadow-sm',
                      check.status === 'pass' && 'bg-green-pale/20 border-green/10',
                      check.status === 'warning' && 'bg-orange-pale/20 border-orange/10',
                      check.status === 'fail' && 'bg-red-pale/20 border-red/10'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: color + '15' }}
                      >
                        <Icon className="h-4 w-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-navy">{check.label}</p>
                        <p className="text-[10px] text-text-tertiary mt-0.5 leading-relaxed">
                          {check.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-border-light/50">
                      <div className="flex items-center gap-1.5">
                        {CatIcon && <CatIcon className="h-3 w-3 text-text-tertiary" />}
                        <span className="text-[10px] text-text-tertiary">{check.category}</span>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: color + '15', color }}
                      >
                        {check.status === 'pass' ? 'Pass' : check.status === 'warning' ? 'Attention' : 'Fail'}
                      </span>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </FadeIn>

      {/* ---- Bottom Row: Alerts + Deadlines + Reports ---- */}
      <FadeIn delay={0.4}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Alerts Timeline */}
          <div className="bg-white rounded-xl border border-surface-border">
            <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-navy flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange" />
                Recent Alerts
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-pale text-orange">
                {activeAlerts.filter((a) => !a.resolved).length} active
              </span>
            </div>
            <div className="divide-y divide-surface-border-light">
              {activeAlerts.map((alert) => (
                <div key={alert.id} className="px-5 py-3 flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {severityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-xs leading-relaxed',
                      alert.resolved ? 'text-text-tertiary line-through' : 'text-text-primary'
                    )}>
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-text-tertiary" />
                      <p className="text-[10px] text-text-tertiary">{alert.time}</p>
                      {alert.resolved && (
                        <span className="text-[10px] font-medium text-green bg-green-pale px-1.5 py-0.5 rounded">
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filing Deadlines with Countdown */}
          <div className="bg-white rounded-xl border border-surface-border">
            <div className="px-5 py-4 border-b border-surface-border">
              <h2 className="text-sm font-bold text-navy flex items-center gap-2">
                <Timer className="h-4 w-4 text-blue" />
                Upcoming Deadlines
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {filingDeadlines.map((deadline) => {
                const urgency =
                  deadline.daysLeft <= 14 ? 'fail' : deadline.daysLeft <= 30 ? 'warning' : 'pass';
                return (
                  <div
                    key={deadline.id}
                    className={cn(
                      'p-4 rounded-xl border transition-all',
                      urgency === 'fail' && 'bg-red-pale/20 border-red/10',
                      urgency === 'warning' && 'bg-orange-pale/20 border-orange/10',
                      urgency === 'pass' && 'bg-surface-bg border-surface-border-light'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-navy">{deadline.name}</p>
                      <span
                        className="text-lg font-extrabold"
                        style={{ color: STATUS_COLORS[urgency] }}
                      >
                        {deadline.daysLeft}d
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-text-tertiary" />
                        <span className="text-[10px] text-text-tertiary">{deadline.dueDate}</span>
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-medium px-2 py-0.5 rounded-full',
                          deadline.status === 'draft' && 'bg-orange-pale text-orange',
                          deadline.status === 'current' && 'bg-blue/10 text-blue'
                        )}
                      >
                        {deadline.status}
                      </span>
                    </div>
                    {/* Countdown progress bar */}
                    <div className="mt-2 w-full h-1.5 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(5, 100 - (deadline.daysLeft / 60) * 100)}%`,
                          backgroundColor: STATUS_COLORS[urgency],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regulatory Reports */}
          <div className="bg-white rounded-xl border border-surface-border">
            <div className="px-5 py-4 border-b border-surface-border">
              <h2 className="text-sm font-bold text-navy flex items-center gap-2">
                <FileText className="h-4 w-4 text-navy" />
                Required Reports
              </h2>
            </div>
            <div className="divide-y divide-surface-border-light">
              {reports.map((report) => (
                <div key={report.id} className="px-5 py-3 flex items-center gap-3 group hover:bg-surface-bg transition-colors">
                  <div
                    className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                      report.status === 'submitted' && 'bg-green-pale',
                      report.status === 'draft' && 'bg-orange-pale',
                      report.status === 'current' && 'bg-blue/10'
                    )}
                  >
                    <FileText
                      className={cn(
                        'h-4 w-4',
                        report.status === 'submitted' && 'text-green',
                        report.status === 'draft' && 'text-orange',
                        report.status === 'current' && 'text-blue'
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy">{report.name}</p>
                    <p className="text-[10px] text-text-tertiary">Due: {report.dueDate}</p>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0',
                      report.status === 'submitted' && 'bg-green-pale text-green',
                      report.status === 'draft' && 'bg-orange-pale text-orange',
                      report.status === 'current' && 'bg-blue/10 text-blue'
                    )}
                  >
                    {report.status}
                  </span>
                  <button className="text-text-tertiary group-hover:text-navy transition-colors shrink-0">
                    {report.status === 'submitted' ? (
                      <Download className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
