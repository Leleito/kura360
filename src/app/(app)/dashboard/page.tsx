"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Wallet,
  TrendingUp,
  Users,
  FileCheck,
  HandCoins,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { AnimatedCounter } from "@/components/premium/animated-counter";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/premium/fade-in";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatKES } from "@/lib/utils";
import { useCampaign } from "@/lib/campaign-context";
import { getFinanceSummary, type FinanceSummary } from "@/lib/actions/transactions";
import { getAgentStats, type AgentStats } from "@/lib/actions/agents";
import { getEvidenceStats } from "@/lib/actions/evidence";
import { getDonationStats, type DonationStats } from "@/lib/actions/donations";
import { getComplianceStatus, type ComplianceStatus } from "@/lib/actions/compliance";

// ── Design token hex values for Recharts (CSS vars don't work in SVG) ──
const COLORS = {
  navy: "#0F2A44",
  green: "#1D6B3F",
  blue: "#2E75B6",
  red: "#E53E3E",
  orange: "#ED8936",
  purple: "#805AD5",
  greenLight: "#27AE60",
  blueLight: "#4A9FE5",
  border: "#E2E8F0",
  textSecondary: "#4A5568",
  textTertiary: "#A0AEC0",
};

// ── Default mock data (shown when no campaign is selected) ──

const DEFAULT_SPENDING_TREND = [
  { day: "Mon", amount: 420000, donations: 185000 },
  { day: "Tue", amount: 680000, donations: 240000 },
  { day: "Wed", amount: 350000, donations: 310000 },
  { day: "Thu", amount: 920000, donations: 150000 },
  { day: "Fri", amount: 1150000, donations: 420000 },
  { day: "Sat", amount: 780000, donations: 560000 },
  { day: "Sun", amount: 290000, donations: 180000 },
];

const DEFAULT_CATEGORY_DATA = [
  { name: "Venue Hire", value: 2100000, color: COLORS.blue },
  { name: "Publicity", value: 3400000, color: COLORS.green },
  { name: "Advertising", value: 1800000, color: COLORS.purple },
  { name: "Transport", value: 900000, color: COLORS.orange },
  { name: "Personnel", value: 500000, color: COLORS.navy },
  { name: "Other", value: 300000, color: COLORS.blueLight },
];

const DEFAULT_RECENT_TRANSACTIONS = [
  {
    id: "TXN-2847",
    description: "Uhuru Gardens rally venue deposit",
    amount: -450000,
    category: "Venue Hire",
    date: "28 Feb 2026",
    status: "verified" as const,
  },
  {
    id: "TXN-2846",
    description: "M-Pesa donation — Wanjiku M.",
    amount: 25000,
    category: "Donation",
    date: "28 Feb 2026",
    status: "verified" as const,
  },
  {
    id: "TXN-2845",
    description: "Billboard printing — Ngong Road",
    amount: -380000,
    category: "Publicity",
    date: "27 Feb 2026",
    status: "pending" as const,
  },
  {
    id: "TXN-2844",
    description: "Agent transport allowance batch",
    amount: -186000,
    category: "Transport",
    date: "27 Feb 2026",
    status: "verified" as const,
  },
  {
    id: "TXN-2843",
    description: "Radio spot — Citizen FM",
    amount: -220000,
    category: "Advertising",
    date: "26 Feb 2026",
    status: "flagged" as const,
  },
];

const DEFAULT_COMPLIANCE_ALERTS = [
  {
    text: "Anonymous donation KES 8,000 exceeds KES 5,000 ECFA threshold",
    level: "critical" as const,
    time: "12 min ago",
  },
  {
    text: "Transport spending at 82% of category limit",
    level: "warning" as const,
    time: "1 hr ago",
  },
  {
    text: "Agent payment batch KES 186,000 pending approval",
    level: "info" as const,
    time: "2 hr ago",
  },
  {
    text: "3 campaign materials missing evidence photos",
    level: "warning" as const,
    time: "3 hr ago",
  },
  {
    text: "Radio advertisement receipt not uploaded — Citizen FM",
    level: "warning" as const,
    time: "5 hr ago",
  },
];

const DEFAULT_AGENT_STATS = [
  { county: "Nairobi", deployed: 312, total: 350, reports: 89 },
  { county: "Mombasa", deployed: 186, total: 220, reports: 64 },
  { county: "Kisumu", deployed: 143, total: 180, reports: 51 },
  { county: "Nakuru", deployed: 128, total: 160, reports: 47 },
  { county: "Eldoret", deployed: 97, total: 130, reports: 38 },
];

// Category color mapping for real data
const CATEGORY_COLOR_MAP: Record<string, string> = {
  "Venue Hire": COLORS.blue,
  Publicity: COLORS.green,
  Advertising: COLORS.purple,
  Transport: COLORS.orange,
  Personnel: COLORS.navy,
  "Admin & Other": COLORS.blueLight,
};

// ── Custom Recharts Tooltip ──
function SpendingTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-surface-border p-3 text-xs">
      <p className="font-semibold text-text-primary mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-text-secondary">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="capitalize">{entry.name}:</span>
          <span className="font-bold text-text-primary">
            {formatKES(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Pie Chart Custom Label ──
function renderPieLabel(props: { name?: string; percent?: number }) {
  const name = props.name ?? "";
  const percent = props.percent ?? 0;
  if (percent < 0.05) return null;
  return `${name} ${(percent * 100).toFixed(0)}%`;
}

// ── Status badge mapping ──
const statusBadgeMap: Record<string, { text: string; variant: "success" | "warning" | "danger" | "neutral" }> = {
  verified: { text: "Verified", variant: "success" },
  pending: { text: "Pending", variant: "warning" },
  flagged: { text: "Flagged", variant: "danger" },
  approved: { text: "Approved", variant: "success" },
  rejected: { text: "Rejected", variant: "danger" },
};

// ── Alert icon mapping ──
function AlertIcon({ level }: { level: "critical" | "warning" | "info" }) {
  if (level === "critical")
    return <AlertCircle className="w-3.5 h-3.5 text-red flex-shrink-0" />;
  if (level === "warning")
    return <AlertTriangle className="w-3.5 h-3.5 text-orange flex-shrink-0" />;
  return <Info className="w-3.5 h-3.5 text-blue flex-shrink-0" />;
}

// ── Helper: format relative time ──
function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function DashboardPage() {
  const { campaign } = useCampaign();
  const activeCampaignId = campaign?.id ?? null;

  // ── State for real data (defaults = mock data) ──
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [agentData, setAgentData] = useState<AgentStats | null>(null);
  const [evidenceData, setEvidenceData] = useState<{ total: number; verified: number; pending: number; flagged: number } | null>(null);
  const [donationData, setDonationData] = useState<DonationStats | null>(null);
  const [complianceData, setComplianceData] = useState<ComplianceStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeCampaignId) return;
    const campaignId = activeCampaignId;

    async function fetchDashboard() {
      setLoading(true);
      try {
        const [finance, agents, evidence, donations, compliance] = await Promise.all([
          getFinanceSummary(campaignId),
          getAgentStats(campaignId),
          getEvidenceStats(campaignId),
          getDonationStats(campaignId),
          getComplianceStatus(campaignId),
        ]);
        if (!finance.error) setFinanceSummary(finance);
        if (!agents.error) setAgentData(agents);
        if (!evidence.error) setEvidenceData(evidence);
        if (!donations.error) setDonationData(donations);
        if (!compliance.error) setComplianceData(compliance);
      } catch (err) {
        console.error("[Dashboard] Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [activeCampaignId]);

  // ── Derived values (real data or fallback defaults) ──
  const balance = financeSummary?.balance ?? 12400000;
  const totalSpent = financeSummary?.totalSpent ?? 8700000;
  const spendingLimit = financeSummary?.spendingLimit ?? 433000000;
  const spendPct = spendingLimit > 0 ? ((totalSpent / spendingLimit) * 100).toFixed(1) : "0";

  const agentsDeployed = agentData ? (agentData.deployed + agentData.active + agentData.checkedIn) : 1247;
  const agentsTotal = agentData?.total ?? 1580;
  const agentPct = agentsTotal > 0 ? Math.round((agentsDeployed / agentsTotal) * 100) : 79;

  const evidenceTotal = evidenceData?.total ?? 3891;
  const _evidenceVerified = evidenceData?.verified ?? 3891;
  const evidencePending = evidenceData?.pending ?? 0;
  const evidenceSub = evidencePending > 0
    ? `${evidencePending} pending verification`
    : "All verified & compliant";

  const donationsAmount = donationData?.totalAmount ?? 4200000;
  const donorsCount = donationData?.totalCount ?? 2847;

  const complianceScore = complianceData?.score ?? 94;
  const complianceAlertCount = complianceData
    ? complianceData.alerts.filter((a) => !a.resolved).length
    : 4;

  // Category data for pie chart
  const categoryData = financeSummary?.byCategory && financeSummary.byCategory.length > 0
    ? financeSummary.byCategory.map((c) => ({
        name: c.category,
        value: c.total,
        color: CATEGORY_COLOR_MAP[c.category] ?? COLORS.blueLight,
      }))
    : DEFAULT_CATEGORY_DATA;

  const categoryTotal = categoryData.reduce((sum, c) => sum + c.value, 0);

  // Recent transactions for table
  const recentTransactions = financeSummary?.recentTransactions && financeSummary.recentTransactions.length > 0
    ? financeSummary.recentTransactions.slice(0, 5).map((t) => ({
        id: t.reference ?? t.id.slice(0, 8),
        description: t.description,
        amount: t.type === "expense" ? -t.amount_kes : t.amount_kes,
        category: t.category,
        date: new Date(t.transaction_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        status: (t.status === "approved" ? "verified" : t.status === "rejected" ? "flagged" : "pending") as "verified" | "pending" | "flagged",
      }))
    : DEFAULT_RECENT_TRANSACTIONS;

  // Compliance alerts
  const complianceAlerts = complianceData?.alerts && complianceData.alerts.length > 0
    ? complianceData.alerts.filter((a) => !a.resolved).slice(0, 5).map((a) => ({
        text: a.message,
        level: a.level,
        time: formatRelativeTime(a.timestamp),
      }))
    : DEFAULT_COMPLIANCE_ALERTS;

  // Agent stats by county
  const agentStats = agentData?.byCounty && agentData.byCounty.length > 0
    ? agentData.byCounty.slice(0, 5).map((c) => ({
        county: c.county,
        deployed: c.deployed,
        total: c.count,
        reports: 0, // reports not tracked in agent stats yet
      }))
    : DEFAULT_AGENT_STATS;

  // Category spending for progress bars
  const categorySpending = complianceData?.categorySpending && complianceData.categorySpending.length > 0
    ? complianceData.categorySpending
    : null;

  // Spending trend (no server action for this yet -- keep mock)
  const spendingTrend = DEFAULT_SPENDING_TREND;

  const kesFormatter = (v: number) =>
    new Intl.NumberFormat("en-KE", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(v);

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-surface-border-light rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface-border-light rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-72 bg-surface-border-light rounded-xl animate-pulse" />
          <div className="h-72 bg-surface-border-light rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <FadeIn direction="down" duration={0.4}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-lg font-extrabold text-navy tracking-tight">
              Campaign Command Centre
            </h1>
            <p className="text-xs text-text-tertiary mt-0.5">
              {campaign
                ? `${campaign.candidate_name} \u2014 ${campaign.county ?? "All Counties"}`
                : "Gubernatorial Campaign 2027 \u2014 Nairobi County"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-text-tertiary">
            <Clock className="w-3 h-3" />
            <span>Last updated: Today, {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} EAT</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            <span className="text-green font-semibold">Live</span>
          </div>
        </div>
      </FadeIn>

      {/* ── Stat Cards Grid ── */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StaggerItem>
          <StatCard
            label="Campaign Balance"
            value={
              <AnimatedCounter
                value={balance}
                prefix="KES "
                formatter={kesFormatter}
                className="text-xl font-extrabold text-green"
              />
            }
            sub={`of ${formatKES(spendingLimit)} limit (${spendPct}%)`}
            variant="green"
            icon={<Wallet className="w-4 h-4" />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Total Spent"
            value={
              <AnimatedCounter
                value={totalSpent}
                prefix="KES "
                formatter={kesFormatter}
                className="text-xl font-extrabold text-blue"
              />
            }
            sub="6 ECFA categories tracked"
            variant="blue"
            icon={<TrendingUp className="w-4 h-4" />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Agents Deployed"
            value={
              <AnimatedCounter
                value={agentsDeployed}
                formatter={(v) => Math.round(v).toLocaleString()}
                className="text-xl font-extrabold text-purple"
              />
            }
            sub={`of ${agentsTotal.toLocaleString()} assigned (${agentPct}%)`}
            variant="purple"
            icon={<Users className="w-4 h-4" />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Evidence Items"
            value={
              <AnimatedCounter
                value={evidenceTotal}
                formatter={(v) => Math.round(v).toLocaleString()}
                className="text-xl font-extrabold text-navy"
              />
            }
            sub={evidenceSub}
            variant="navy"
            icon={<FileCheck className="w-4 h-4" />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Donations"
            value={
              <AnimatedCounter
                value={donationsAmount}
                prefix="KES "
                formatter={kesFormatter}
                className="text-xl font-extrabold text-green"
              />
            }
            sub={`${donorsCount.toLocaleString()} donors via M-Pesa`}
            variant="green"
            icon={<HandCoins className="w-4 h-4" />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Compliance Score"
            value={
              <AnimatedCounter
                value={complianceScore}
                suffix="%"
                className="text-xl font-extrabold text-orange"
              />
            }
            sub={`${complianceAlertCount} items need attention`}
            variant="orange"
            icon={<ShieldCheck className="w-4 h-4" />}
          />
        </StaggerItem>
      </StaggerContainer>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 7-Day Spending Trend */}
        <FadeIn delay={0.2} className="lg:col-span-2">
          <div className="bg-white rounded-xl p-4 border border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-navy">
                  7-Day Spending Trend
                </h2>
                <p className="text-[10px] text-text-tertiary mt-0.5">
                  Campaign expenditure vs. donations received
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS.blue }}
                  />
                  Spending
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS.green }}
                  />
                  Donations
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={spendingTrend}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradSpending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.blue} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={COLORS.blue} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={COLORS.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={COLORS.border}
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: COLORS.textTertiary }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: COLORS.textTertiary }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <RechartsTooltip content={<SpendingTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name="spending"
                  stroke={COLORS.blue}
                  strokeWidth={2}
                  fill="url(#gradSpending)"
                />
                <Area
                  type="monotone"
                  dataKey="donations"
                  name="donations"
                  stroke={COLORS.green}
                  strokeWidth={2}
                  fill="url(#gradDonations)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>

        {/* ECFA Category Donut */}
        <FadeIn delay={0.3}>
          <div className="bg-white rounded-xl p-4 border border-surface-border">
            <h2 className="text-sm font-bold text-navy mb-1">
              Spending by ECFA Category
            </h2>
            <p className="text-[10px] text-text-tertiary mb-2">
              Total: {formatKES(categoryTotal)}
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={renderPieLabel}
                  strokeWidth={0}
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={6}
                  wrapperStyle={{ fontSize: 10 }}
                  formatter={(value) => (
                    <span className="text-text-secondary">{value}</span>
                  )}
                />
                <RechartsTooltip
                  formatter={(value) => formatKES(Number(value))}
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 8,
                    border: `1px solid ${COLORS.border}`,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>
      </div>

      {/* ── Category Limits + Compliance Alerts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spending vs Limits */}
        <FadeIn delay={0.25} className="lg:col-span-2">
          <div className="bg-white rounded-xl p-4 border border-surface-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-navy">
                  Category Spending vs. ECFA Limits
                </h2>
                <p className="text-[10px] text-text-tertiary mt-0.5">
                  Values in KES millions
                </p>
              </div>
            </div>
            {categorySpending ? (
              categorySpending.map((cs) => (
                <ProgressBar
                  key={cs.category}
                  value={cs.spent / 1_000_000}
                  max={cs.limit / 1_000_000}
                  label={`${cs.category}  ---  KES ${(cs.spent / 1_000_000).toFixed(1)}M of ${(cs.limit / 1_000_000).toFixed(0)}M`}
                  animate
                />
              ))
            ) : (
              <>
                <ProgressBar
                  value={2.1}
                  max={50}
                  label="Venue Hire  ---  KES 2.1M of 50M"
                  animate
                />
                <ProgressBar
                  value={3.4}
                  max={80}
                  label="Publicity Materials  ---  KES 3.4M of 80M"
                  animate
                />
                <ProgressBar
                  value={1.8}
                  max={40}
                  label="Advertising  ---  KES 1.8M of 40M"
                  animate
                />
                <ProgressBar
                  value={24.6}
                  max={30}
                  label="Transport  ---  KES 24.6M of 30M"
                  animate
                />
                <ProgressBar
                  value={0.5}
                  max={20}
                  label="Personnel  ---  KES 0.5M of 20M"
                  animate
                />
              </>
            )}
          </div>
        </FadeIn>

        {/* Compliance Alerts */}
        <FadeIn delay={0.35}>
          <div className="bg-white rounded-xl p-4 border border-surface-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-navy">
                Compliance Alerts
              </h2>
              <span className="text-[9px] font-bold text-white bg-red px-2 py-0.5 rounded-full">
                {complianceAlerts.filter((a) => a.level === "critical").length} Critical
              </span>
            </div>
            <div className="space-y-2">
              {complianceAlerts.map((alert, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 p-2.5 rounded-lg text-xs leading-relaxed border-l-[3px] ${
                    alert.level === "critical"
                      ? "bg-red-pale text-red border-l-red"
                      : alert.level === "warning"
                        ? "bg-orange-pale text-amber-800 border-l-orange"
                        : "bg-surface-border-light text-text-secondary border-l-blue"
                  }`}
                >
                  <AlertIcon level={alert.level} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] leading-snug">{alert.text}</p>
                    <p className="text-[9px] text-text-tertiary mt-0.5">
                      {alert.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* ── Transactions + Agent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <FadeIn delay={0.3} className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-surface-border">
            <div className="flex items-center justify-between p-4 pb-0">
              <div>
                <h2 className="text-sm font-bold text-navy">
                  Recent Transactions
                </h2>
                <p className="text-[10px] text-text-tertiary mt-0.5">
                  Latest {recentTransactions.length} campaign financial entries
                </p>
              </div>
              <button className="flex items-center gap-1 text-[10px] text-blue font-semibold hover:underline">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs mt-3">
                <thead>
                  <tr className="border-t border-b border-surface-border text-text-tertiary">
                    <th className="text-left py-2 px-4 font-semibold text-[10px]">
                      ID
                    </th>
                    <th className="text-left py-2 px-4 font-semibold text-[10px]">
                      Description
                    </th>
                    <th className="text-left py-2 px-4 font-semibold text-[10px]">
                      Category
                    </th>
                    <th className="text-right py-2 px-4 font-semibold text-[10px]">
                      Amount
                    </th>
                    <th className="text-left py-2 px-4 font-semibold text-[10px]">
                      Date
                    </th>
                    <th className="text-center py-2 px-4 font-semibold text-[10px]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => {
                    const badge = statusBadgeMap[tx.status] ?? { text: tx.status, variant: "neutral" as const };
                    return (
                      <tr
                        key={tx.id}
                        className="border-b border-surface-border-light hover:bg-surface-border-light/50 transition-colors"
                      >
                        <td className="py-2.5 px-4 font-mono text-text-tertiary text-[10px]">
                          {tx.id}
                        </td>
                        <td className="py-2.5 px-4 text-text-primary font-medium max-w-[200px] truncate">
                          {tx.description}
                        </td>
                        <td className="py-2.5 px-4 text-text-secondary">
                          {tx.category}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold tabular-nums">
                          <span
                            className={`flex items-center justify-end gap-0.5 ${
                              tx.amount > 0 ? "text-green" : "text-text-primary"
                            }`}
                          >
                            {tx.amount > 0 ? (
                              <ArrowUpRight className="w-3 h-3 text-green" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 text-text-tertiary" />
                            )}
                            {formatKES(Math.abs(tx.amount))}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-text-tertiary">
                          {tx.date}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <Badge
                            text={badge.text}
                            variant={badge.variant}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>

        {/* Agent Activity */}
        <FadeIn delay={0.4}>
          <div className="bg-white rounded-xl p-4 border border-surface-border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-navy">
                  Agent Activity
                </h2>
                <p className="text-[10px] text-text-tertiary mt-0.5">
                  Deployment by county
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-purple">
                  <AnimatedCounter
                    value={agentsDeployed}
                    formatter={(v) => Math.round(v).toLocaleString()}
                  />
                </p>
                <p className="text-[9px] text-text-tertiary">of {agentsTotal.toLocaleString()} total</p>
              </div>
            </div>

            <div className="space-y-3">
              {agentStats.map((county) => {
                const pct = county.total > 0
                  ? Math.round((county.deployed / county.total) * 100)
                  : 0;
                return (
                  <div key={county.county}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-text-tertiary" />
                        <span className="text-[11px] font-semibold text-text-primary">
                          {county.county}
                        </span>
                      </div>
                      <span className="text-[10px] text-text-secondary">
                        <span className="font-bold text-purple">
                          {county.deployed}
                        </span>
                        /{county.total}
                        {county.reports > 0 && (
                          <span className="text-text-tertiary ml-1.5">
                            {county.reports} reports
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-1.5 bg-surface-border-light rounded-full overflow-hidden">
                      <div
                        className="h-1.5 bg-purple rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="mt-4 w-full flex items-center justify-center gap-1 text-[10px] text-blue font-semibold py-2 rounded-lg border border-surface-border hover:bg-surface-border-light transition-colors">
              View all agents <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
