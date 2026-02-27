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
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { formatKES, formatDateShort, percentage } from "@/lib/utils";
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
/*  Mock data - 18 realistic Kenyan campaign transactions                     */
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
    description: "Campaign banners (200 units) - Kisii & Nyamira counties",
    category: "Publicity",
    amount: 240_000,
    receipt_url: "/receipts/txn-013.pdf",
    status: "approved",
    notes: "PVC banners 3m x 1m for roadside placement.",
    created_by: "Peter Kipchoge",
  },
  {
    id: "TXN-014",
    date: "2026-02-12",
    description: "Catering - Eldoret stakeholders' dinner (300 guests)",
    category: "Venue Hire",
    amount: 390_000,
    receipt_url: null,
    status: "pending",
    notes: "Awaiting final headcount confirmation from Uasin Gishu coordinator.",
    created_by: "James Mwangi",
  },
  {
    id: "TXN-015",
    date: "2026-02-11",
    description: "Social media management - February retainer",
    category: "Advertising",
    amount: 275_000,
    receipt_url: "/receipts/txn-015.pdf",
    status: "approved",
    notes: "Agency: Digital Edge Kenya. Facebook, X, TikTok content creation.",
    created_by: "Amina Osman",
  },
  {
    id: "TXN-016",
    date: "2026-02-10",
    description: "Office supplies & IT equipment - campaign HQ",
    category: "Admin & Other",
    amount: 185_000,
    receipt_url: "/receipts/txn-016.pdf",
    status: "approved",
    notes: "2 laptops, printer, stationery, WhatsApp Business subscription.",
    created_by: "Grace Wanjiku",
  },
  {
    id: "TXN-017",
    date: "2026-02-09",
    description: "Helicopter charter - Western Kenya campaign tour",
    category: "Transport",
    amount: 980_000,
    receipt_url: null,
    status: "rejected",
    notes: "Rejected: exceeds per-trip transport policy. Use road convoy instead.",
    created_by: "James Mwangi",
  },
  {
    id: "TXN-018",
    date: "2026-02-08",
    description: "Volunteer coordinator wages - Mombasa team (10 staff)",
    category: "Personnel",
    amount: 200_000,
    receipt_url: "/receipts/txn-018.pdf",
    status: "approved",
    notes: "10 coordinators x KES 20,000 stipend for February field work.",
    created_by: "Fatma Hassan",
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
  const totalSpent = MOCK_TRANSACTIONS.filter((t) => t.status === "approved").reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const approvedCount = MOCK_TRANSACTIONS.filter((t) => t.status === "approved").length;
  const pendingCount = MOCK_TRANSACTIONS.filter((t) => t.status === "pending").length;
  const rejectedCount = MOCK_TRANSACTIONS.filter((t) => t.status === "rejected").length;

  /* ---- Derived: filtered + sorted ---- */
  const filtered = useMemo(() => {
    let list = [...MOCK_TRANSACTIONS];

    // Text search
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

    // Category
    if (categoryFilter) {
      list = list.filter((t) => t.category === categoryFilter);
    }

    // Status
    if (statusFilter) {
      list = list.filter((t) => t.status === statusFilter);
    }

    // Date range
    if (dateFrom) {
      list = list.filter((t) => t.date >= dateFrom);
    }
    if (dateTo) {
      list = list.filter((t) => t.date <= dateTo);
    }

    // Sort
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

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/finance"
            className="p-1.5 rounded-lg hover:bg-surface-bg transition-colors"
            aria-label="Back to finance dashboard"
          >
            <ArrowLeft size={18} className="text-text-secondary" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-navy">All Transactions</h1>
            <p className="text-xs text-text-tertiary mt-0.5">
              Full expenditure ledger &mdash; {MOCK_TRANSACTIONS.length} transactions recorded
            </p>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-green bg-green-pale px-3 py-2 rounded-lg hover:opacity-90 transition-opacity">
              <CheckSquare size={14} />
              Approve Selected ({selected.size})
            </button>
          )}
          <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue bg-surface-bg border border-surface-border px-3 py-2 rounded-lg hover:bg-surface-border-light transition-colors">
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Approved Spend"
          value={formatKES(totalSpent)}
          sub={`${percentage(totalSpent, ECFA_SPENDING_LIMIT)}% of KES 35M limit`}
          variant="blue"
        />
        <StatCard
          label="Approved"
          value={approvedCount.toString()}
          sub={`${formatKES(MOCK_TRANSACTIONS.filter((t) => t.status === "approved").reduce((s, t) => s + t.amount, 0))}`}
          variant="green"
        />
        <StatCard
          label="Pending Review"
          value={pendingCount.toString()}
          sub={`${formatKES(MOCK_TRANSACTIONS.filter((t) => t.status === "pending").reduce((s, t) => s + t.amount, 0))}`}
          variant="orange"
        />
        <StatCard
          label="Rejected"
          value={rejectedCount.toString()}
          sub={`${formatKES(MOCK_TRANSACTIONS.filter((t) => t.status === "rejected").reduce((s, t) => s + t.amount, 0))}`}
          variant="red"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-surface-border mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-text-tertiary" />
          <span className="text-xs font-bold text-text-secondary">Filters</span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-[10px] font-semibold text-red hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by description, ID, notes, or person..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2 rounded-lg border border-surface-border bg-surface-bg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue/30"
            />
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs px-3 py-2 rounded-lg border border-surface-border bg-surface-bg text-text-secondary focus:outline-none focus:ring-2 focus:ring-blue/30"
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
            className="text-xs px-3 py-2 rounded-lg border border-surface-border bg-surface-bg text-text-secondary focus:outline-none focus:ring-2 focus:ring-blue/30"
          >
            <option value="">All Statuses</option>
            {TRANSACTION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          {/* Date from */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-tertiary font-semibold">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-2 rounded-lg border border-surface-border bg-surface-bg text-text-secondary focus:outline-none focus:ring-2 focus:ring-blue/30"
            />
          </div>

          {/* Date to */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-tertiary font-semibold">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-2 rounded-lg border border-surface-border bg-surface-bg text-text-secondary focus:outline-none focus:ring-2 focus:ring-blue/30"
            />
          </div>
        </div>

        {/* Filter summary */}
        {hasActiveFilters && (
          <p className="text-[10px] text-text-tertiary mt-2">
            Showing {filtered.length} of {MOCK_TRANSACTIONS.length} transactions
            {filtered.length > 0 && <> &mdash; filtered total: <span className="font-bold text-navy">{formatKES(filteredTotal)}</span></>}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-surface-border bg-surface-bg/50">
                {/* Checkbox */}
                <th className="px-4 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selected.size === paginated.length}
                    onChange={toggleSelectAll}
                    className="rounded border-surface-border"
                    aria-label="Select all"
                  />
                </th>
                <th className="px-3 py-3 text-left">
                  <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
                    ID
                  </span>
                </th>
                <th
                  className="px-3 py-3 text-left cursor-pointer select-none"
                  onClick={() => toggleSort("date")}
                >
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
                    Date
                    <ArrowUpDown size={10} className={sortKey === "date" ? "text-blue" : ""} />
                  </span>
                </th>
                <th
                  className="px-3 py-3 text-left cursor-pointer select-none"
                  onClick={() => toggleSort("description")}
                >
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
                    Description
                    <ArrowUpDown size={10} className={sortKey === "description" ? "text-blue" : ""} />
                  </span>
                </th>
                <th
                  className="px-3 py-3 text-left cursor-pointer select-none"
                  onClick={() => toggleSort("category")}
                >
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
                    Category
                    <ArrowUpDown size={10} className={sortKey === "category" ? "text-blue" : ""} />
                  </span>
                </th>
                <th
                  className="px-3 py-3 text-right cursor-pointer select-none"
                  onClick={() => toggleSort("amount")}
                >
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
                    Amount
                    <ArrowUpDown size={10} className={sortKey === "amount" ? "text-blue" : ""} />
                  </span>
                </th>
                <th className="px-3 py-3 text-center">
                  <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
                    Receipt
                  </span>
                </th>
                <th
                  className="px-3 py-3 text-left cursor-pointer select-none"
                  onClick={() => toggleSort("status")}
                >
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
                    Status
                    <ArrowUpDown size={10} className={sortKey === "status" ? "text-blue" : ""} />
                  </span>
                </th>
                <th className="px-3 py-3 text-left">
                  <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
                    Recorded By
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-text-tertiary">
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={32} className="text-surface-border" />
                      <p className="text-sm font-semibold">No transactions found</p>
                      <p className="text-xs">Try adjusting your filters or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((t) => {
                  const badge = statusBadge(t.status);
                  const isSelected = selected.has(t.id);
                  return (
                    <tr
                      key={t.id}
                      className={`border-b border-surface-border-light transition-colors ${
                        isSelected
                          ? "bg-blue/5"
                          : "hover:bg-surface-bg/50"
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(t.id)}
                          className="rounded border-surface-border"
                          aria-label={`Select ${t.id}`}
                        />
                      </td>
                      <td className="px-3 py-2.5 text-text-tertiary font-mono text-[10px]">
                        {t.id}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-text-secondary">
                        {formatDateShort(t.date)}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-text-primary max-w-[300px]">
                        <div className="truncate" title={t.description}>
                          {t.description}
                        </div>
                        {t.notes && (
                          <p
                            className="text-[10px] text-text-tertiary truncate mt-0.5"
                            title={t.notes}
                          >
                            {t.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-text-secondary whitespace-nowrap">
                        {t.category}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-navy tabular-nums whitespace-nowrap">
                        {formatKES(t.amount)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {t.receipt_url ? (
                          <span
                            className="inline-flex items-center gap-0.5 text-blue hover:underline cursor-pointer"
                            title="View receipt"
                          >
                            <FileText size={12} />
                          </span>
                        ) : (
                          <span className="text-text-tertiary">&mdash;</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          {statusIcon(t.status)}
                          <Badge text={badge.label} variant={badge.variant} />
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-text-secondary whitespace-nowrap">
                        {t.created_by}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border bg-surface-bg/30">
            <p className="text-[10px] text-text-tertiary">
              Showing {(page - 1) * PAGE_SIZE + 1}&ndash;
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} transactions
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-md hover:bg-surface-border-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} className="text-text-secondary" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[28px] h-7 rounded-md text-[10px] font-bold transition-colors ${
                    p === page
                      ? "bg-navy text-white"
                      : "text-text-secondary hover:bg-surface-border-light"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-md hover:bg-surface-border-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={14} className="text-text-secondary" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
