"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  CheckSquare,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Filter,
  Trash2,
  X,
  BarChart3,
} from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/premium/animated-counter";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/premium/fade-in";
import { formatKES, formatDateShort, cn, percentage } from "@/lib/utils";
import {
  ECFA_CATEGORIES,
  TRANSACTION_STATUSES,
  ECFA_SPENDING_LIMIT,
  type ECFACategory,
  type TransactionStatus,
} from "@/lib/validators/finance";

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
  notes: string;
  created_by: string;
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
/*  Mock data - 15 realistic Kenyan campaign transactions                     */
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
    notes: "Deposit for March 8 rally. Balance KES 400K due on event day.",
    created_by: "James Mwangi",
  },
  {
    id: "TXN-002",
    date: "2026-02-24",
    description: "Printing 50,000 campaign flyers - Kul Graphics Nairobi",
    category: "Publicity",
    amount: 375_000,
    receipt_url: "/receipts/txn-002.pdf",
    status: "approved",
    notes: "Full-colour A5 flyers for Nairobi county distribution.",
    created_by: "Amina Osman",
  },
  {
    id: "TXN-003",
    date: "2026-02-23",
    description: "NTV prime-time 30s campaign advert (7-day run)",
    category: "Advertising",
    amount: 1_200_000,
    receipt_url: "/receipts/txn-003.pdf",
    status: "approved",
    notes: "Booked via MediaMax agency. Airs 7pm-9pm slot.",
    created_by: "James Mwangi",
  },
  {
    id: "TXN-004",
    date: "2026-02-22",
    description: "Campaign T-shirts 10,000 units - Rivatex Eldoret",
    category: "Publicity",
    amount: 650_000,
    receipt_url: null,
    status: "pending",
    notes: "Branded T-shirts for Rift Valley grassroots mobilisation.",
    created_by: "Peter Kipchoge",
  },
  {
    id: "TXN-005",
    date: "2026-02-21",
    description: "Fuel & vehicle hire - Mombasa coast tour (5 vehicles)",
    category: "Transport",
    amount: 420_000,
    receipt_url: "/receipts/txn-005.pdf",
    status: "approved",
    notes: "3-day coastal campaign swing: Mombasa, Kilifi, Kwale.",
    created_by: "Fatma Hassan",
  },
  {
    id: "TXN-006",
    date: "2026-02-20",
    description: "Monthly agent stipends - Nairobi constituency coordinators",
    category: "Personnel",
    amount: 540_000,
    receipt_url: "/receipts/txn-006.pdf",
    status: "approved",
    notes: "18 coordinators x KES 30,000 for February 2026.",
    created_by: "James Mwangi",
  },
  {
    id: "TXN-007",
    date: "2026-02-19",
    description: "Radio Citizen vernacular ads - Kikuyu & Luo slots",
    category: "Advertising",
    amount: 320_000,
    receipt_url: null,
    status: "pending",
    notes: "2 weeks morning drive-time. Awaiting signed media plan.",
    created_by: "Amina Osman",
  },
  {
    id: "TXN-008",
    date: "2026-02-18",
    description: "Campaign office rent - Lavington, Nairobi (3 months)",
    category: "Admin & Other",
    amount: 450_000,
    receipt_url: "/receipts/txn-008.pdf",
    status: "approved",
    notes: "Q1 2026 rent. 4-bedroom converted office, 2nd floor.",
    created_by: "Grace Wanjiku",
  },
  {
    id: "TXN-009",
    date: "2026-02-17",
    description: "Sound & stage equipment hire - Kisumu rally",
    category: "Venue Hire",
    amount: 280_000,
    receipt_url: "/receipts/txn-009.pdf",
    status: "approved",
    notes: "Full PA system, LED screens, generators for Jomo Kenyatta Ground.",
    created_by: "Peter Kipchoge",
  },
  {
    id: "TXN-010",
    date: "2026-02-16",
    description: "Billboard printing (6 units) - highways Nairobi-Nakuru",
    category: "Publicity",
    amount: 720_000,
    receipt_url: null,
    status: "rejected",
    notes: "Rejected: vendor not in approved supplier list.",
    created_by: "Amina Osman",
  },
  {
    id: "TXN-011",
    date: "2026-02-15",
    description: "Chartered bus hire - Nakuru to Nairobi supporters transport",
    category: "Transport",
    amount: 185_000,
    receipt_url: "/receipts/txn-011.pdf",
    status: "approved",
    notes: "3 buses, 50 seats each. Return trip for mega-rally.",
    created_by: "Fatma Hassan",
  },
  {
    id: "TXN-012",
    date: "2026-02-14",
    description: "SMS bulk messaging - Safaricom 200K subscribers",
    category: "Advertising",
    amount: 160_000,
    receipt_url: "/receipts/txn-012.pdf",
    status: "approved",
    notes: "Rally notification for Nairobi & environs. Sent via Africa's Talking.",
    created_by: "Grace Wanjiku",
  },
  {
    id: "TXN-013",
    date: "2026-02-13",
    description: "Catering - Eldoret stakeholders' dinner (300 guests)",
    category: "Venue Hire",
    amount: 390_000,
    receipt_url: null,
    status: "pending",
    notes: "Awaiting final headcount confirmation from Uasin Gishu coordinator.",
    created_by: "James Mwangi",
  },
  {
    id: "TXN-014",
    date: "2026-02-11",
    description: "Social media management - February retainer",
    category: "Advertising",
    amount: 275_000,
    receipt_url: "/receipts/txn-014.pdf",
    status: "approved",
    notes: "Agency: Digital Edge Kenya. Facebook, X, TikTok content creation.",
    created_by: "Amina Osman",
  },
  {
    id: "TXN-015",
    date: "2026-02-09",
    description: "Helicopter charter - Western Kenya campaign tour",
    category: "Transport",
    amount: 980_000,
    receipt_url: null,
    status: "rejected",
    notes: "Rejected: exceeds per-trip transport policy. Use road convoy instead.",
    created_by: "James Mwangi",
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

type SortKey = "date" | "description" | "category" | "amount" | "status";
type SortDir = "asc" | "desc";

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

const PAGE_SIZE = 8;

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function TransactionsPage() {
  /* ---- Filters ---- */
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  /* ---- Sort ---- */
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  /* ---- Pagination ---- */
  const [page, setPage] = useState(1);

  /* ---- Selection ---- */
  const [selected, setSelected] = useState<Set<string>>(new Set());

  /* ---- Derived: stats ---- */
  const totalAmount = MOCK_TRANSACTIONS.reduce((s, t) => s + t.amount, 0);
  const approvedAmount = MOCK_TRANSACTIONS.filter((t) => t.status === "approved").reduce((s, t) => s + t.amount, 0);
  const approvedCount = MOCK_TRANSACTIONS.filter((t) => t.status === "approved").length;
  const pendingCount = MOCK_TRANSACTIONS.filter((t) => t.status === "pending").length;
  const approvedPct = percentage(approvedCount, MOCK_TRANSACTIONS.length);

  /* ---- Derived: filtered + sorted ---- */
  const filtered = useMemo(() => {
    let list = [...MOCK_TRANSACTIONS];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q) ||
          t.created_by.toLowerCase().includes(q)
      );
    }

    if (categoryFilter) list = list.filter((t) => t.category === categoryFilter);
    if (statusFilter) list = list.filter((t) => t.status === statusFilter);
    if (dateFrom) list = list.filter((t) => t.date >= dateFrom);
    if (dateTo) list = list.filter((t) => t.date <= dateTo);

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "date":
          cmp = a.date.localeCompare(b.date);
          break;
        case "description":
          cmp = a.description.localeCompare(b.description);
          break;
        case "category":
          cmp = a.category.localeCompare(b.category);
          break;
        case "amount":
          cmp = a.amount - b.amount;
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [search, categoryFilter, statusFilter, dateFrom, dateTo, sortKey, sortDir]);

  /* ---- Pagination derived ---- */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const filteredTotal = filtered.reduce((sum, t) => sum + t.amount, 0);

  /* ---- Handlers ---- */
  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map((t) => t.id)));
    }
  }

  function clearFilters() {
    setSearch("");
    setCategoryFilter("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  const hasActiveFilters = search || categoryFilter || statusFilter || dateFrom || dateTo;

  function SortIndicator({ columnKey }: { columnKey: SortKey }) {
    const isActive = sortKey === columnKey;
    return (
      <svg
        className={cn(
          "h-3 w-3 ml-0.5 transition-colors",
          isActive ? "text-blue" : "text-text-tertiary/40"
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l5 5 5-5M7 8l5-5 5 5" />
      </svg>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <div className="space-y-6">
      {/* ---- Page header ---- */}
      <FadeIn direction="none" duration={0.3}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/finance"
              className="p-2 rounded-xl hover:bg-surface-bg border border-transparent hover:border-surface-border transition-all"
              aria-label="Back to finance dashboard"
            >
              <ArrowLeft size={18} className="text-text-secondary" />
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-navy tracking-tight">All Transactions</h1>
              <p className="text-xs text-text-tertiary mt-0.5">
                Full expenditure ledger &mdash; {MOCK_TRANSACTIONS.length} transactions recorded
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk actions bar */}
            {selected.size > 0 && (
              <FadeIn direction="right" duration={0.2}>
                <div className="flex items-center gap-2 bg-blue/5 rounded-xl px-3 py-1.5 border border-blue/20">
                  <span className="text-[10px] font-bold text-blue">{selected.size} selected</span>
                  <button className="inline-flex items-center gap-1 text-[10px] font-semibold text-green bg-green/10 px-2.5 py-1.5 rounded-lg hover:bg-green/20 transition-colors">
                    <CheckSquare size={12} />
                    Approve
                  </button>
                  <button className="inline-flex items-center gap-1 text-[10px] font-semibold text-red bg-red/10 px-2.5 py-1.5 rounded-lg hover:bg-red/20 transition-colors">
                    <Trash2 size={12} />
                    Reject
                  </button>
                  <button
                    onClick={() => setSelected(new Set())}
                    className="p-1 rounded-md hover:bg-surface-bg transition-colors"
                    aria-label="Clear selection"
                  >
                    <X size={12} className="text-text-tertiary" />
                  </button>
                </div>
              </FadeIn>
            )}
            <button className="inline-flex items-center gap-1.5 bg-white text-text-secondary text-xs font-semibold px-4 py-2.5 rounded-xl border border-surface-border hover:bg-surface-bg transition-colors shadow-sm">
              <Download size={15} />
              Export CSV
            </button>
          </div>
        </div>
      </FadeIn>

      {/* ---- Summary Stats (4 cards) ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FadeIn delay={0.05} direction="up">
          <div className="bg-white rounded-2xl p-4 border border-surface-border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Total Transactions</p>
              <div className="h-7 w-7 rounded-lg bg-navy/10 flex items-center justify-center">
                <BarChart3 size={14} className="text-navy" />
              </div>
            </div>
            <AnimatedCounter
              value={MOCK_TRANSACTIONS.length}
              className="text-xl font-extrabold text-navy block"
            />
            <p className="text-[10px] text-text-tertiary mt-0.5">
              {formatKES(totalAmount)} total value
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1} direction="up">
          <div className="bg-white rounded-2xl p-4 border border-surface-border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Approved Spend</p>
              <div className="h-7 w-7 rounded-lg bg-green/10 flex items-center justify-center">
                <CheckCircle2 size={14} className="text-green" />
              </div>
            </div>
            <AnimatedCounter
              value={approvedAmount}
              formatter={(v) => formatKES(Math.round(v))}
              className="text-xl font-extrabold text-green block tabular-nums"
            />
            <p className="text-[10px] text-text-tertiary mt-0.5">
              {percentage(approvedAmount, ECFA_SPENDING_LIMIT)}% of KES 35M limit
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.15} direction="up">
          <div className="bg-white rounded-2xl p-4 border border-surface-border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Approved Rate</p>
              <div className="h-7 w-7 rounded-lg bg-blue/10 flex items-center justify-center">
                <CheckSquare size={14} className="text-blue" />
              </div>
            </div>
            <AnimatedCounter
              value={approvedPct}
              suffix="%"
              className="text-xl font-extrabold text-blue block"
            />
            <p className="text-[10px] text-text-tertiary mt-0.5">
              {approvedCount} of {MOCK_TRANSACTIONS.length} approved
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2} direction="up">
          <div className={cn(
            "bg-white rounded-2xl p-4 border shadow-sm",
            pendingCount > 0 ? "border-orange/30" : "border-surface-border"
          )}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Pending Review</p>
              <div className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center",
                pendingCount > 0 ? "bg-orange/10" : "bg-green/10"
              )}>
                <Clock size={14} className={pendingCount > 0 ? "text-orange" : "text-green"} />
              </div>
            </div>
            <AnimatedCounter
              value={pendingCount}
              className={cn(
                "text-xl font-extrabold block",
                pendingCount > 0 ? "text-orange" : "text-green"
              )}
            />
            <p className="text-[10px] text-text-tertiary mt-0.5">
              {pendingCount > 0 ? "Requires action" : "All reviewed"}
            </p>
          </div>
        </FadeIn>
      </div>

      {/* ---- Filters ---- */}
      <FadeIn delay={0.25} direction="up">
        <div className="bg-white rounded-2xl p-4 border border-surface-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={14} className="text-text-tertiary" />
            <span className="text-xs font-bold text-text-secondary">Filters</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-red hover:text-red/80 transition-colors"
              >
                <X size={10} />
                Clear all
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[220px]">
              <SearchInput
                value={search}
                onChange={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
                placeholder="Search by description, ID, notes, or person..."
              />
            </div>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-2.5 rounded-xl border border-surface-border bg-white text-text-secondary focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue min-h-[44px] transition-colors"
            >
              <option value="">All Categories</option>
              {ECFA_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-2.5 rounded-xl border border-surface-border bg-white text-text-secondary focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue min-h-[44px] transition-colors"
            >
              <option value="">All Statuses</option>
              {TRANSACTION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>

            {/* Date from */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-text-tertiary font-semibold whitespace-nowrap">From</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="text-xs px-3 py-2.5 rounded-xl border border-surface-border bg-white text-text-secondary focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue min-h-[44px] transition-colors"
              />
            </div>

            {/* Date to */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-text-tertiary font-semibold whitespace-nowrap">To</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="text-xs px-3 py-2.5 rounded-xl border border-surface-border bg-white text-text-secondary focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue min-h-[44px] transition-colors"
              />
            </div>
          </div>

          {/* Filter summary */}
          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-surface-border">
              <p className="text-[10px] text-text-tertiary">
                Showing <span className="font-bold text-text-secondary">{filtered.length}</span> of {MOCK_TRANSACTIONS.length} transactions
                {filtered.length > 0 && (
                  <> &mdash; filtered total: <span className="font-bold text-navy">{formatKES(filteredTotal)}</span></>
                )}
              </p>
            </div>
          )}
        </div>
      </FadeIn>

      {/* ---- Transactions Table ---- */}
      <FadeIn delay={0.3} direction="up">
        <div className="bg-white rounded-2xl border border-surface-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-surface-bg/50 border-b border-surface-border">
                  {/* Checkbox */}
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={paginated.length > 0 && selected.size === paginated.length}
                      onChange={toggleSelectAll}
                      className="rounded border-surface-border accent-blue"
                      aria-label="Select all"
                    />
                  </th>
                  <th className="px-3 py-3.5 text-left">
                    <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
                      ID
                    </span>
                  </th>
                  <th
                    className="px-3 py-3.5 text-left cursor-pointer select-none group"
                    onClick={() => toggleSort("date")}
                  >
                    <span className="inline-flex items-center text-[10px] font-semibold text-text-tertiary uppercase tracking-wider group-hover:text-text-secondary transition-colors">
                      Date
                      <SortIndicator columnKey="date" />
                    </span>
                  </th>
                  <th
                    className="px-3 py-3.5 text-left cursor-pointer select-none group"
                    onClick={() => toggleSort("description")}
                  >
                    <span className="inline-flex items-center text-[10px] font-semibold text-text-tertiary uppercase tracking-wider group-hover:text-text-secondary transition-colors">
                      Description
                      <SortIndicator columnKey="description" />
                    </span>
                  </th>
                  <th
                    className="px-3 py-3.5 text-left cursor-pointer select-none group"
                    onClick={() => toggleSort("category")}
                  >
                    <span className="inline-flex items-center text-[10px] font-semibold text-text-tertiary uppercase tracking-wider group-hover:text-text-secondary transition-colors">
                      Category
                      <SortIndicator columnKey="category" />
                    </span>
                  </th>
                  <th
                    className="px-3 py-3.5 text-right cursor-pointer select-none group"
                    onClick={() => toggleSort("amount")}
                  >
                    <span className="inline-flex items-center text-[10px] font-semibold text-text-tertiary uppercase tracking-wider group-hover:text-text-secondary transition-colors">
                      Amount
                      <SortIndicator columnKey="amount" />
                    </span>
                  </th>
                  <th className="px-3 py-3.5 text-center">
                    <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
                      Receipt
                    </span>
                  </th>
                  <th
                    className="px-3 py-3.5 text-left cursor-pointer select-none group"
                    onClick={() => toggleSort("status")}
                  >
                    <span className="inline-flex items-center text-[10px] font-semibold text-text-tertiary uppercase tracking-wider group-hover:text-text-secondary transition-colors">
                      Status
                      <SortIndicator columnKey="status" />
                    </span>
                  </th>
                  <th className="px-3 py-3.5 text-left">
                    <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
                      Recorded By
                    </span>
                  </th>
                </tr>
              </thead>

              {/* Table body with stagger animation */}
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-surface-bg flex items-center justify-center">
                          <FileText size={24} className="text-text-tertiary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-secondary">No transactions found</p>
                          <p className="text-xs text-text-tertiary mt-0.5">Try adjusting your filters or search query.</p>
                        </div>
                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="text-xs font-semibold text-blue hover:underline mt-1"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  <StaggerContainer staggerDelay={0.04}>
                    {paginated.map((t) => {
                      const badge = statusBadge(t.status);
                      const isSelected = selected.has(t.id);
                      return (
                        <StaggerItem key={t.id}>
                          <tr
                            className={cn(
                              "border-b border-surface-border/50 transition-colors",
                              isSelected
                                ? "bg-blue/5"
                                : "hover:bg-surface-bg/40"
                            )}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(t.id)}
                                className="rounded border-surface-border accent-blue"
                                aria-label={`Select ${t.id}`}
                              />
                            </td>
                            <td className="px-3 py-3 text-text-tertiary font-mono text-[10px]">
                              {t.id}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-text-secondary">
                              {formatDateShort(t.date)}
                            </td>
                            <td className="px-3 py-3 font-medium text-text-primary max-w-[300px]">
                              <div className="truncate" title={t.description}>
                                {t.description}
                              </div>
                              {t.notes && (
                                <p
                                  className="text-[10px] text-text-tertiary truncate mt-0.5 max-w-[280px]"
                                  title={t.notes}
                                >
                                  {t.notes}
                                </p>
                              )}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5">
                                <span
                                  className="h-2 w-2 rounded-full inline-block flex-shrink-0"
                                  style={{ backgroundColor: CATEGORY_COLORS[t.category] }}
                                />
                                <span className="text-text-secondary">{t.category}</span>
                              </span>
                            </td>
                            <td className="px-3 py-3 text-right font-bold text-navy tabular-nums whitespace-nowrap">
                              {formatKES(t.amount)}
                            </td>
                            <td className="px-3 py-3 text-center">
                              {t.receipt_url ? (
                                <span
                                  className="inline-flex items-center gap-0.5 text-green cursor-pointer hover:text-green/80 transition-colors"
                                  title="View receipt"
                                >
                                  <FileText size={14} />
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-orange" title="Receipt missing">
                                  <AlertCircle size={14} />
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1">
                                {statusIcon(t.status)}
                                <Badge text={badge.label} variant={badge.variant} />
                              </div>
                            </td>
                            <td className="px-3 py-3 text-text-secondary whitespace-nowrap text-[11px]">
                              {t.created_by}
                            </td>
                          </tr>
                        </StaggerItem>
                      );
                    })}
                  </StaggerContainer>
                )}
              </tbody>
            </table>
          </div>

          {/* ---- Pagination ---- */}
          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-surface-border bg-surface-bg/30">
              <p className="text-[10px] text-text-tertiary">
                Showing{" "}
                <span className="font-semibold text-text-secondary">
                  {(page - 1) * PAGE_SIZE + 1}&ndash;{Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of {filtered.length} transactions
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-surface-border disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} className="text-text-secondary" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "min-w-[32px] h-8 rounded-lg text-[11px] font-bold transition-all",
                      p === page
                        ? "bg-navy text-white shadow-sm"
                        : "text-text-secondary hover:bg-white hover:shadow-sm hover:border-surface-border border border-transparent"
                    )}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-surface-border disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  aria-label="Next page"
                >
                  <ChevronRight size={14} className="text-text-secondary" />
                </button>
              </div>
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
