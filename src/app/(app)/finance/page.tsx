"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingDown,
  Clock,
  Plus,
  FileBarChart,
  Download,
  ArrowRight,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AnimatedCounter } from "@/components/premium/animated-counter";
import { FadeIn } from "@/components/premium/fade-in";
import { Badge } from "@/components/ui/badge";
import { formatKES, formatDateShort, cn, percentage } from "@/lib/utils";
import {
  ECFA_CATEGORIES,
  ECFA_SPENDING_LIMIT,
  type ECFACategory,
  type TransactionStatus,
} from "@/lib/validators/finance";
import { useCampaign } from "@/lib/campaign-context";
import { getFinanceSummary, getTransactions, type FinanceSummary } from "@/lib/actions/transactions";
import { exportTransactionsCSV } from "@/lib/export";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: ECFACategory;
  amount: number;
  receipt_url: string | null;
  status: TransactionStatus;
}

/* -------------------------------------------------------------------------- */
/*  Category colour mapping                                                   */
/* -------------------------------------------------------------------------- */

const CATEGORY_COLORS: Record<ECFACategory, string> = {
  Advertising: "#2E75B6",
  Publicity: "#805AD5",
  "Venue Hire": "#1D6B3F",
  Transport: "#ED8936",
  Personnel: "#E53E3E",
  "Admin & Other": "#A0AEC0",
};

/* -------------------------------------------------------------------------- */
/*  Mock data defaults (shown when no campaign is selected)                    */
/* -------------------------------------------------------------------------- */

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-001",
    date: "2026-02-25",
    description: "Uhuru Gardens rally venue hire & security deposit",
    category: "Venue Hire",
    amount: 850_000,
    receipt_url: "/receipts/txn-001.pdf",
    status: "approved",
  },
  {
    id: "TXN-002",
    date: "2026-02-24",
    description: "Printing 50,000 campaign flyers - Kul Graphics Nairobi",
    category: "Publicity",
    amount: 375_000,
    receipt_url: "/receipts/txn-002.pdf",
    status: "approved",
  },
  {
    id: "TXN-003",
    date: "2026-02-23",
    description: "NTV prime-time 30s campaign advert (7-day run)",
    category: "Advertising",
    amount: 1_200_000,
    receipt_url: "/receipts/txn-003.pdf",
    status: "approved",
  },
  {
    id: "TXN-004",
    date: "2026-02-22",
    description: "Campaign T-shirts 10,000 units - Rivatex Eldoret",
    category: "Publicity",
    amount: 650_000,
    receipt_url: null,
    status: "pending",
  },
  {
    id: "TXN-005",
    date: "2026-02-21",
    description: "Fuel & vehicle hire - Mombasa coast tour (5 vehicles)",
    category: "Transport",
    amount: 420_000,
    receipt_url: "/receipts/txn-005.pdf",
    status: "approved",
  },
  {
    id: "TXN-006",
    date: "2026-02-20",
    description: "Monthly agent stipends - Nairobi constituency coordinators",
    category: "Personnel",
    amount: 540_000,
    receipt_url: "/receipts/txn-006.pdf",
    status: "approved",
  },
  {
    id: "TXN-007",
    date: "2026-02-19",
    description: "Radio Citizen vernacular ads - Kikuyu & Luo slots",
    category: "Advertising",
    amount: 320_000,
    receipt_url: null,
    status: "pending",
  },
  {
    id: "TXN-008",
    date: "2026-02-18",
    description: "Campaign office rent - Lavington, Nairobi (3 months)",
    category: "Admin & Other",
    amount: 450_000,
    receipt_url: "/receipts/txn-008.pdf",
    status: "approved",
  },
];

/* -------------------------------------------------------------------------- */
/*  Category budget allocations (mock sub-limits within KES 35M ceiling)      */
/* -------------------------------------------------------------------------- */

const CATEGORY_BUDGETS: Record<ECFACategory, number> = {
  Advertising: 8_000_000,
  Publicity: 7_000_000,
  "Venue Hire": 6_000_000,
  Transport: 5_000_000,
  Personnel: 5_000_000,
  "Admin & Other": 4_000_000,
};

/* -------------------------------------------------------------------------- */
/*  Mock spending trend (last 30 days)                                        */
/* -------------------------------------------------------------------------- */

const SPENDING_TREND = [
  { date: "Jan 30", amount: 280_000 },
  { date: "Feb 1", amount: 120_000 },
  { date: "Feb 3", amount: 450_000 },
  { date: "Feb 5", amount: 0 },
  { date: "Feb 7", amount: 185_000 },
  { date: "Feb 9", amount: 200_000 },
  { date: "Feb 10", amount: 185_000 },
  { date: "Feb 11", amount: 275_000 },
  { date: "Feb 13", amount: 240_000 },
  { date: "Feb 14", amount: 160_000 },
  { date: "Feb 15", amount: 185_000 },
  { date: "Feb 17", amount: 280_000 },
  { date: "Feb 18", amount: 450_000 },
  { date: "Feb 19", amount: 320_000 },
  { date: "Feb 20", amount: 540_000 },
  { date: "Feb 21", amount: 420_000 },
  { date: "Feb 22", amount: 650_000 },
  { date: "Feb 23", amount: 1_200_000 },
  { date: "Feb 24", amount: 375_000 },
  { date: "Feb 25", amount: 850_000 },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function statusBadge(status: TransactionStatus) {
  const map: Record<TransactionStatus, { variant: "success" | "warning" | "danger"; label: string }> = {
    approved: { variant: "success", label: "Approved" },
    pending: { variant: "warning", label: "Pending" },
    rejected: { variant: "danger", label: "Rejected" },
  };
  return map[status];
}

function statusIcon(status: TransactionStatus) {
  switch (status) {
    case "approved":
      return <CheckCircle2 size={14} className="text-green" />;
    case "pending":
      return <Clock size={14} className="text-orange" />;
    case "rejected":
      return <XCircle size={14} className="text-red" />;
  }
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

/* -------------------------------------------------------------------------- */
/*  Custom Recharts Tooltip                                                   */
/* -------------------------------------------------------------------------- */

function CustomBarTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { category: string; spent: number; budget: number } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-surface-border px-3 py-2 text-xs">
      <p className="font-bold text-navy">{d.category}</p>
      <p className="text-text-secondary">Spent: <span className="font-semibold text-text-primary">{formatKES(d.spent)}</span></p>
      <p className="text-text-tertiary">Budget: {formatKES(d.budget)}</p>
    </div>
  );
}

function CustomAreaTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { date: string; amount: number } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-surface-border px-3 py-2 text-xs">
      <p className="font-semibold text-text-secondary">{d.date}</p>
      <p className="font-bold text-navy">{formatKES(d.amount)}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function FinancePage() {
  const { campaign } = useCampaign();
  const activeCampaignId = campaign?.id ?? null;

  // ── State for real data ──
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [allRawTransactions, setAllRawTransactions] = useState<Array<{
    id: string;
    transaction_date: string;
    description: string;
    category: string;
    amount_kes: number;
    status: string;
    vendor_name?: string | null;
    reference?: string | null;
    receipt_url?: string | null;
    type: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!activeCampaignId) return;
    const campaignId = activeCampaignId;

    async function fetchFinance() {
      setLoading(true);
      try {
        const [finance, txnResult] = await Promise.all([
          getFinanceSummary(campaignId),
          getTransactions(campaignId, { pageSize: 50 }),
        ]);
        if (!finance.error) setFinanceSummary(finance);

        if (!txnResult.error && txnResult.data.length > 0) {
          setAllRawTransactions(txnResult.data);

          const mapped: Transaction[] = txnResult.data.slice(0, 8).map((t) => ({
            id: t.reference ?? t.id.slice(0, 8),
            date: t.transaction_date,
            description: t.description,
            category: t.category as ECFACategory,
            amount: t.amount_kes,
            receipt_url: t.receipt_url,
            status: t.status as TransactionStatus,
          }));
          setTransactions(mapped);
        }
      } catch (err) {
        console.error("[Finance] Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFinance();
  }, [activeCampaignId]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  /* ---- Derived data ---- */
  const spendingLimit = financeSummary?.spendingLimit ?? ECFA_SPENDING_LIMIT;

  const totalSpent = useMemo(() => {
    if (financeSummary) return financeSummary.totalSpent;
    return transactions.filter((t) => t.status === "approved").reduce((sum, t) => sum + t.amount, 0);
  }, [financeSummary, transactions]);

  const budgetRemaining = spendingLimit - totalSpent;
  const pendingApprovals = transactions.filter((t) => t.status === "pending").length;
  const utilPct = percentage(totalSpent, spendingLimit);

  /* Spending per category (approved only) */
  const categoryData = useMemo(() => {
    if (financeSummary?.byCategory && financeSummary.byCategory.length > 0) {
      return ECFA_CATEGORIES.map((cat) => {
        const found = financeSummary.byCategory.find((c) => c.category === cat);
        return {
          category: cat,
          spent: found?.total ?? 0,
          budget: CATEGORY_BUDGETS[cat],
          fill: CATEGORY_COLORS[cat],
        };
      });
    }

    const map: Partial<Record<ECFACategory, number>> = {};
    transactions.filter((t) => t.status === "approved").forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return ECFA_CATEGORIES.map((cat) => ({
      category: cat,
      spent: map[cat] || 0,
      budget: CATEGORY_BUDGETS[cat],
      fill: CATEGORY_COLORS[cat],
    }));
  }, [financeSummary, transactions]);

  /* Donut data */
  const donutData = [
    { name: "Spent", value: totalSpent, color: "#2E75B6" },
    { name: "Remaining", value: Math.max(0, budgetRemaining), color: "#E2E8F0" },
  ];

  /* ---- Action handlers ---- */
  function handleExportCSV() {
    if (allRawTransactions.length > 0) {
      exportTransactionsCSV(allRawTransactions);
      setToastMessage("CSV exported successfully!");
    } else {
      setToastMessage("No transaction data to export.");
    }
  }

  function handleGenerateReport() {
    setToastMessage("Report generation coming soon!");
  }

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-14 bg-surface-border-light rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-surface-border-light rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-80 bg-surface-border-light rounded-2xl animate-pulse" />
          <div className="h-80 bg-surface-border-light rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-navy text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* ---- Page header ---- */}
      <FadeIn direction="none" duration={0.3}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-navy tracking-tight">
              Campaign Finance
            </h1>
            <p className="text-xs text-text-tertiary mt-1">
              ECFA compliant spending limit: {formatKES(spendingLimit)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleGenerateReport}
              className="inline-flex items-center gap-1.5 bg-white text-text-secondary text-xs font-semibold px-4 py-2.5 rounded-xl border border-surface-border hover:bg-surface-bg transition-colors shadow-sm"
            >
              <FileBarChart size={15} />
              Generate Report
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 bg-white text-text-secondary text-xs font-semibold px-4 py-2.5 rounded-xl border border-surface-border hover:bg-surface-bg transition-colors shadow-sm"
            >
              <Download size={15} />
              Export CSV
            </button>
            <Link
              href="/finance/transactions"
              className="inline-flex items-center gap-1.5 bg-green text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus size={15} />
              Record Transaction
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* ---- 4 Premium Stat Cards ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FadeIn delay={0.05} direction="up">
          <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
                Total Budget
              </p>
              <div className="h-8 w-8 rounded-lg bg-blue/10 flex items-center justify-center">
                <Wallet size={16} className="text-blue" />
              </div>
            </div>
            <AnimatedCounter
              value={spendingLimit}
              formatter={(v) => formatKES(Math.round(v))}
              className="text-2xl font-extrabold text-navy tabular-nums block"
            />
            <p className="text-[10px] text-text-tertiary mt-1.5">ECFA statutory ceiling</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1} direction="up">
          <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
                Total Spent
              </p>
              <div className="h-8 w-8 rounded-lg bg-green/10 flex items-center justify-center">
                <Receipt size={16} className="text-green" />
              </div>
            </div>
            <AnimatedCounter
              value={totalSpent}
              formatter={(v) => formatKES(Math.round(v))}
              className="text-2xl font-extrabold text-green tabular-nums block"
            />
            <p className="text-[10px] text-text-tertiary mt-1.5">
              {utilPct}% of limit used
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.15} direction="up">
          <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
                Remaining
              </p>
              <div className="h-8 w-8 rounded-lg bg-navy/10 flex items-center justify-center">
                <TrendingDown size={16} className="text-navy" />
              </div>
            </div>
            <AnimatedCounter
              value={Math.max(0, budgetRemaining)}
              formatter={(v) => formatKES(Math.round(v))}
              className="text-2xl font-extrabold text-navy tabular-nums block"
            />
            <p className="text-[10px] text-text-tertiary mt-1.5">
              {percentage(Math.max(0, budgetRemaining), spendingLimit)}% available
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2} direction="up">
          <div className={cn(
            "bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-shadow",
            pendingApprovals > 0 ? "border-orange/30" : "border-surface-border"
          )}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
                Pending Approvals
              </p>
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center",
                pendingApprovals > 0 ? "bg-orange/10" : "bg-green/10"
              )}>
                {pendingApprovals > 0 ? (
                  <AlertTriangle size={16} className="text-orange" />
                ) : (
                  <CheckCircle2 size={16} className="text-green" />
                )}
              </div>
            </div>
            <AnimatedCounter
              value={pendingApprovals}
              className="text-2xl font-extrabold text-orange tabular-nums block"
            />
            <p className="text-[10px] text-text-tertiary mt-1.5">
              {pendingApprovals > 0 ? "Requires review" : "All clear"}
            </p>
          </div>
        </FadeIn>
      </div>

      {/* ---- Charts Row: Category Spending + Budget Donut ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Spending BarChart */}
        <FadeIn delay={0.25} direction="up" className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-navy">Spending by ECFA Category</h2>
                <p className="text-[10px] text-text-tertiary mt-0.5">Approved expenditure vs. sub-limits</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[10px] text-text-tertiary">
                  <span className="h-2 w-2 rounded-full bg-blue inline-block" /> Spent
                </span>
                <span className="flex items-center gap-1 text-[10px] text-text-tertiary">
                  <span className="h-2 w-2 rounded-full bg-surface-border inline-block" /> Budget
                </span>
              </div>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
                  barGap={4}
                >
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatCompact(v)}
                    tick={{ fontSize: 10, fill: "#A0AEC0" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fontSize: 11, fill: "#4A5568", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#F7F9FC" }} />
                  <Bar
                    dataKey="budget"
                    radius={[0, 4, 4, 0]}
                    fill="#E2E8F0"
                    barSize={14}
                  />
                  <Bar
                    dataKey="spent"
                    radius={[0, 4, 4, 0]}
                    barSize={14}
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.category} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category color legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-surface-border">
              {ECFA_CATEGORIES.map((cat) => (
                <span key={cat} className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                  <span
                    className="h-2 w-2 rounded-full inline-block"
                    style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                  />
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Budget Utilization Donut */}
        <FadeIn delay={0.3} direction="up">
          <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-sm flex flex-col items-center">
            <h2 className="text-sm font-bold text-navy self-start mb-2">Budget Utilization</h2>
            <p className="text-[10px] text-text-tertiary self-start mb-4">Overall ECFA limit consumption</p>
            <div className="relative h-[200px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatedCounter
                  value={utilPct}
                  suffix="%"
                  className="text-3xl font-extrabold text-navy"
                />
                <span className="text-[10px] text-text-tertiary font-medium">Used</span>
              </div>
            </div>

            {/* Donut legend */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-surface-border w-full">
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue inline-block" />
                  <span className="text-[10px] font-semibold text-text-secondary">Spent</span>
                </div>
                <p className="text-xs font-bold text-navy">{formatKES(totalSpent)}</p>
              </div>
              <div className="w-px h-8 bg-surface-border" />
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-surface-border inline-block" />
                  <span className="text-[10px] font-semibold text-text-secondary">Remaining</span>
                </div>
                <p className="text-xs font-bold text-navy">{formatKES(Math.max(0, budgetRemaining))}</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* ---- Spending Trend AreaChart ---- */}
      <FadeIn delay={0.35} direction="up">
        <div className="bg-white rounded-2xl p-5 border border-surface-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-navy">Spending Trend</h2>
              <p className="text-[10px] text-text-tertiary mt-0.5">Daily approved expenditure over the last 30 days</p>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SPENDING_TREND} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2E75B6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#2E75B6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#A0AEC0" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => formatCompact(v)}
                  tick={{ fontSize: 10, fill: "#A0AEC0" }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip content={<CustomAreaTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#2E75B6"
                  strokeWidth={2}
                  fill="url(#spendGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#2E75B6", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </FadeIn>

      {/* ---- Recent Transactions Table ---- */}
      <FadeIn delay={0.4} direction="up">
        <div className="bg-white rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
            <div>
              <h2 className="text-sm font-bold text-navy">Recent Transactions</h2>
              <p className="text-[10px] text-text-tertiary mt-0.5">Latest {transactions.length} expenditure records</p>
            </div>
            <Link
              href="/finance/transactions"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue hover:text-blue/80 transition-colors"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-surface-bg/50">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Description</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Category</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Amount</th>
                  <th className="text-center px-4 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Receipt</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const badge = statusBadge(t.status);
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-surface-border/50 hover:bg-surface-bg/30 transition-colors"
                    >
                      <td className="px-5 py-3 whitespace-nowrap text-text-secondary">
                        {formatDateShort(t.date)}
                      </td>
                      <td className="px-4 py-3 font-medium text-text-primary max-w-[300px]">
                        <span className="truncate block">{t.description}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full inline-block flex-shrink-0"
                            style={{ backgroundColor: CATEGORY_COLORS[t.category] }}
                          />
                          <span className="text-text-secondary">{t.category}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-navy tabular-nums whitespace-nowrap">
                        {formatKES(t.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {t.receipt_url ? (
                          <span className="inline-flex items-center gap-0.5 text-green cursor-pointer hover:text-green/80 transition-colors" title="View receipt">
                            <FileText size={13} />
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-orange" title="Receipt missing">
                            <AlertCircle size={13} />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {statusIcon(t.status)}
                          <Badge text={badge.label} variant={badge.variant} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="flex items-center justify-between px-5 py-3 bg-surface-bg/30 border-t border-surface-border">
            <p className="text-[10px] text-text-tertiary">
              Showing {transactions.length} most recent transactions
            </p>
            <Link
              href="/finance/transactions"
              className="text-[10px] font-semibold text-blue hover:underline"
            >
              See all transactions &rarr;
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
