"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  DollarSign,
  Wallet,
  Receipt,
  Clock,
  Plus,
  X,
  Upload,
  ExternalLink,
  ArrowRight,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
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
}

/* -------------------------------------------------------------------------- */
/*  Mock data - 10 realistic Kenyan campaign transactions                     */
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
  },
];

/* -------------------------------------------------------------------------- */
/*  Category budget allocations (mock sub-limits within the KES 35M ceiling)  */
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
/*  Helper: status badge variant map                                          */
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

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function FinancePage() {
  /* ---- Filters ---- */
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  /* ---- Modal ---- */
  const [modalOpen, setModalOpen] = useState(false);

  /* ---- Form state ---- */
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formNotes, setFormNotes] = useState("");

  /* ---- Derived data ---- */
  const filteredTransactions = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((t) => {
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter && t.category !== categoryFilter) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      return true;
    });
  }, [search, categoryFilter, statusFilter]);

  const totalSpent = MOCK_TRANSACTIONS.filter((t) => t.status === "approved").reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const budgetRemaining = ECFA_SPENDING_LIMIT - totalSpent;
  const totalTransactions = MOCK_TRANSACTIONS.length;
  const pendingApprovals = MOCK_TRANSACTIONS.filter((t) => t.status === "pending").length;

  /* Spending per category (approved only) */
  const spendingByCategory = useMemo(() => {
    const map: Partial<Record<ECFACategory, number>> = {};
    MOCK_TRANSACTIONS.filter((t) => t.status === "approved").forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return ECFA_CATEGORIES.map((cat) => ({
      category: cat,
      spent: map[cat] || 0,
      budget: CATEGORY_BUDGETS[cat],
    }));
  }, []);

  /* ---- Form handlers ---- */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production this would call the Supabase insert + validate via Zod
    setModalOpen(false);
    resetForm();
  }

  function resetForm() {
    setFormDescription("");
    setFormAmount("");
    setFormCategory("");
    setFormDate("");
    setFormNotes("");
  }

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-lg font-bold text-navy">
            Campaign Finance &mdash; Expenditure Ledger
          </h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            ECFA compliant spending limit: {formatKES(ECFA_SPENDING_LIMIT)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/finance/transactions"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue hover:text-blue-light transition-colors"
          >
            View all transactions
            <ArrowRight size={14} />
          </Link>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-green text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            Record Transaction
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Spent"
          value={formatKES(totalSpent)}
          sub={`${percentage(totalSpent, ECFA_SPENDING_LIMIT)}% of limit used`}
          variant="blue"
        />
        <StatCard
          label="Budget Remaining"
          value={formatKES(budgetRemaining)}
          sub={`${percentage(budgetRemaining, ECFA_SPENDING_LIMIT)}% available`}
          variant="green"
        />
        <StatCard
          label="Transactions"
          value={totalTransactions.toString()}
          sub="All categories combined"
          variant="navy"
        />
        <StatCard
          label="Pending Approvals"
          value={pendingApprovals.toString()}
          sub={pendingApprovals > 0 ? "Requires review" : "All clear"}
          variant={pendingApprovals > 0 ? "orange" : "green"}
        />
      </div>

      {/* Spending by category + filters/table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Category spending bars */}
        <div className="bg-white rounded-xl p-4 border border-surface-border">
          <h2 className="text-sm font-bold text-navy mb-4">Spending by ECFA Category</h2>
          {spendingByCategory.map((item) => (
            <ProgressBar
              key={item.category}
              value={item.spent / 1_000_000}
              max={item.budget / 1_000_000}
              label={`${item.category} \u2014 ${formatKES(item.spent)}`}
            />
          ))}
          <p className="text-[9px] text-text-tertiary mt-2">
            Bars show approved spend vs. category sub-limit (millions KES).
          </p>
        </div>

        {/* Transactions table */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-surface-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold text-navy">Recent Transactions</h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[180px]">
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-surface-border bg-surface-bg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue/30"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-surface-border bg-surface-bg text-text-secondary focus:outline-none focus:ring-2 focus:ring-blue/30"
            >
              <option value="">All Categories</option>
              {ECFA_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-surface-border bg-surface-bg text-text-secondary focus:outline-none focus:ring-2 focus:ring-blue/30"
            >
              <option value="">All Statuses</option>
              {TRANSACTION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-surface-border text-left">
                  <th className="pb-2 pr-3 font-semibold text-text-tertiary">Date</th>
                  <th className="pb-2 pr-3 font-semibold text-text-tertiary">Description</th>
                  <th className="pb-2 pr-3 font-semibold text-text-tertiary">Category</th>
                  <th className="pb-2 pr-3 font-semibold text-text-tertiary text-right">Amount (KES)</th>
                  <th className="pb-2 pr-3 font-semibold text-text-tertiary text-center">Receipt</th>
                  <th className="pb-2 font-semibold text-text-tertiary">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-text-tertiary">
                      No transactions match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => {
                    const badge = statusBadge(t.status);
                    return (
                      <tr
                        key={t.id}
                        className="border-b border-surface-border-light hover:bg-surface-bg/50 transition-colors"
                      >
                        <td className="py-2.5 pr-3 whitespace-nowrap text-text-secondary">
                          {formatDateShort(t.date)}
                        </td>
                        <td className="py-2.5 pr-3 font-medium text-text-primary max-w-[260px] truncate">
                          {t.description}
                        </td>
                        <td className="py-2.5 pr-3 text-text-secondary">{t.category}</td>
                        <td className="py-2.5 pr-3 text-right font-bold text-navy tabular-nums">
                          {formatKES(t.amount)}
                        </td>
                        <td className="py-2.5 pr-3 text-center">
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
                        <td className="py-2.5">
                          <div className="flex items-center gap-1">
                            {statusIcon(t.status)}
                            <Badge text={badge.label} variant={badge.variant} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/*  Record Transaction Modal                                       */}
      {/* ---------------------------------------------------------------- */}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
              <h3 className="text-sm font-bold text-navy">Record Transaction</h3>
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="p-1 rounded-md hover:bg-surface-bg transition-colors"
                aria-label="Close"
              >
                <X size={16} className="text-text-tertiary" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Description */}
              <div>
                <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={200}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Rally venue hire - Uhuru Gardens"
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-surface-border bg-surface-bg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue/30"
                />
              </div>

              {/* Amount + Category row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                    Amount (KES)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-tertiary font-semibold">
                      KES
                    </span>
                    <input
                      type="number"
                      required
                      min={1}
                      max={ECFA_SPENDING_LIMIT}
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="0"
                      className="w-full text-xs pl-11 pr-3 py-2.5 rounded-lg border border-surface-border bg-surface-bg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue/30 tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                    Category
                  </label>
                  <select
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-surface-border bg-surface-bg text-text-secondary focus:outline-none focus:ring-2 focus:ring-blue/30"
                  >
                    <option value="">Select category</option>
                    {ECFA_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                  Transaction Date
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-surface-border bg-surface-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-blue/30"
                />
              </div>

              {/* Receipt upload placeholder */}
              <div>
                <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                  Receipt / Evidence
                </label>
                <div className="border-2 border-dashed border-surface-border rounded-lg p-4 text-center hover:border-blue/40 transition-colors cursor-pointer">
                  <Upload size={20} className="mx-auto text-text-tertiary mb-1" />
                  <p className="text-[10px] text-text-tertiary">
                    Click or drag to upload receipt (PDF, JPG, PNG &mdash; max 10 MB)
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wide mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Additional details for audit trail..."
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-surface-border bg-surface-bg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue/30 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                  className="text-xs font-semibold text-text-secondary px-4 py-2 rounded-lg hover:bg-surface-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-green text-white text-xs font-bold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus size={14} />
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
