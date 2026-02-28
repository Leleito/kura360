"use client";

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

// ── 7-Day Spending Trend ──
const spendingTrend = [
  { day: "Mon", amount: 420000, donations: 185000 },
  { day: "Tue", amount: 680000, donations: 240000 },
  { day: "Wed", amount: 350000, donations: 310000 },
  { day: "Thu", amount: 920000, donations: 150000 },
  { day: "Fri", amount: 1150000, donations: 420000 },
  { day: "Sat", amount: 780000, donations: 560000 },
  { day: "Sun", amount: 290000, donations: 180000 },
];

// ── ECFA Category Breakdown ──
const categoryData = [
  { name: "Venue Hire", value: 2100000, color: COLORS.blue },
  { name: "Publicity", value: 3400000, color: COLORS.green },
  { name: "Advertising", value: 1800000, color: COLORS.purple },
  { name: "Transport", value: 900000, color: COLORS.orange },
  { name: "Personnel", value: 500000, color: COLORS.navy },
  { name: "Other", value: 300000, color: COLORS.blueLight },
];

// ── Recent Transactions ──
const recentTransactions = [
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

// ── Compliance Alerts ──
const complianceAlerts = [
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

// ── Agent Activity ──
const agentStats = [
  { county: "Nairobi", deployed: 312, total: 350, reports: 89 },
  { county: "Mombasa", deployed: 186, total: 220, reports: 64 },
  { county: "Kisumu", deployed: 143, total: 180, reports: 51 },
  { county: "Nakuru", deployed: 128, total: 160, reports: 47 },
  { county: "Eldoret", deployed: 97, total: 130, reports: 38 },
];

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
const statusBadge: Record<string, { text: string; variant: "success" | "warning" | "danger" | "neutral" }> = {
  verified: { text: "Verified", variant: "success" },
  pending: { text: "Pending", variant: "warning" },
  flagged: { text: "Flagged", variant: "danger" },
};

// ── Alert icon mapping ──
function AlertIcon({ level }: { level: "critical" | "warning" | "info" }) {
  if (level === "critical")
    return <AlertCircle className="w-3.5 h-3.5 text-red flex-shrink-0" />;
  if (level === "warning")
    return <AlertTriangle className="w-3.5 h-3.5 text-orange flex-shrink-0" />;
  return <Info className="w-3.5 h-3.5 text-blue flex-shrink-0" />;
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function DashboardPage() {
  const kesFormatter = (v: number) =>
    new Intl.NumberFormat("en-KE", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(v);

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
              Gubernatorial Campaign 2027 &mdash; Nairobi County
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-text-tertiary">
            <Clock className="w-3 h-3" />
            <span>Last updated: Today, 14:32 EAT</span>
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
                value={12400000}
                prefix="KES "
                formatter={kesFormatter}
                className="text-xl font-extrabold text-green"
              />
            }
            sub="of KES 433M limit (2.9%)"
            variant="green"
            icon={<Wallet className="w-4 h-4" />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Total Spent"
            value={
              <AnimatedCounter
                value={8700000}
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
                value={1247}
                formatter={(v) => Math.round(v).toLocaleString()}
                className="text-xl font-extrabold text-purple"
              />
            }
            sub="of 1,580 assigned (79%)"
            variant="purple"
            icon={<Users className="w-4 h-4" />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Evidence Items"
            value={
              <AnimatedCounter
                value={3891}
                formatter={(v) => Math.round(v).toLocaleString()}
                className="text-xl font-extrabold text-navy"
              />
            }
            sub="All verified & compliant"
            variant="navy"
            icon={<FileCheck className="w-4 h-4" />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Donations"
            value={
              <AnimatedCounter
                value={4200000}
                prefix="KES "
                formatter={kesFormatter}
                className="text-xl font-extrabold text-green"
              />
            }
            sub="2,847 donors via M-Pesa"
            variant="green"
            icon={<HandCoins className="w-4 h-4" />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Compliance Score"
            value={
              <AnimatedCounter
                value={94}
                suffix="%"
                className="text-xl font-extrabold text-orange"
              />
            }
            sub="4 items need attention"
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
              Total: {formatKES(9000000)}
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
                  Latest 5 campaign financial entries
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
                  {recentTransactions.map((tx) => (
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
                          text={statusBadge[tx.status].text}
                          variant={statusBadge[tx.status].variant}
                        />
                      </td>
                    </tr>
                  ))}
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
                    value={1247}
                    formatter={(v) => Math.round(v).toLocaleString()}
                  />
                </p>
                <p className="text-[9px] text-text-tertiary">of 1,580 total</p>
              </div>
            </div>

            <div className="space-y-3">
              {agentStats.map((county) => {
                const pct = Math.round(
                  (county.deployed / county.total) * 100
                );
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
                        <span className="text-text-tertiary ml-1.5">
                          {county.reports} reports
                        </span>
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
