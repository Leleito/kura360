"use client";

import { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Download,
  ChevronRight,
  TrendingUp,
  Scale,
} from "lucide-react";
import { cn, formatKES } from "@/lib/utils";

/* ── Mock data ── */
const SPENDING_LIMIT = 35_000_000;
const TOTAL_SPENT = 18_750_000;
const TOTAL_DONATIONS = 22_400_000;

const complianceChecks = [
  {
    id: "spending-limit",
    label: "Spending within ECFA limit",
    description: `Campaign spending at ${Math.round((TOTAL_SPENT / SPENDING_LIMIT) * 100)}% of KES 35M limit`,
    status: "pass" as const,
    category: "Financial",
  },
  {
    id: "donation-limits",
    label: "All donations within legal limits",
    description: "No individual donation exceeds KES 5M threshold",
    status: "pass" as const,
    category: "Financial",
  },
  {
    id: "anonymous-cap",
    label: "Anonymous donations compliant",
    description: "2 anonymous donations total KES 35,000 (limit: KES 50,000)",
    status: "pass" as const,
    category: "Financial",
  },
  {
    id: "kyc-verification",
    label: "Donor KYC verification",
    description: "3 donors pending KYC verification for donations over KES 100,000",
    status: "warning" as const,
    category: "Donor",
  },
  {
    id: "receipt-compliance",
    label: "Receipt documentation",
    description: "94% of expenditures have receipts attached (target: 100%)",
    status: "warning" as const,
    category: "Documentation",
  },
  {
    id: "agent-payments",
    label: "Agent payment records",
    description: "All agent payments documented and within guidelines",
    status: "pass" as const,
    category: "Personnel",
  },
  {
    id: "prohibited-sources",
    label: "No prohibited funding sources",
    description: "All donation sources verified against prohibited list",
    status: "pass" as const,
    category: "Donor",
  },
  {
    id: "reporting-deadline",
    label: "Filing deadline compliance",
    description: "Next quarterly report due in 18 days",
    status: "warning" as const,
    category: "Reporting",
  },
  {
    id: "evidence-integrity",
    label: "Evidence vault integrity",
    description: "All 47 evidence items pass SHA-256 hash verification",
    status: "pass" as const,
    category: "Documentation",
  },
  {
    id: "foreign-donations",
    label: "No foreign donations detected",
    description: "All donors verified as Kenyan nationals or registered entities",
    status: "pass" as const,
    category: "Donor",
  },
];

const recentAlerts = [
  {
    id: "1",
    message: "Donation from Daniel Kiprotich (KES 450,000) requires KYC verification",
    severity: "warning" as const,
    time: "2 hours ago",
    resolved: false,
  },
  {
    id: "2",
    message: "Quarterly ECFA report due in 18 days - preparation recommended",
    severity: "info" as const,
    time: "1 day ago",
    resolved: false,
  },
  {
    id: "3",
    message: "Receipt missing for transport expense (KES 85,000) - Mombasa rally",
    severity: "warning" as const,
    time: "2 days ago",
    resolved: false,
  },
  {
    id: "4",
    message: "Agent allowance batch payment recorded and verified",
    severity: "success" as const,
    time: "3 days ago",
    resolved: true,
  },
  {
    id: "5",
    message: "Spending threshold reached: 50% of campaign limit utilized",
    severity: "info" as const,
    time: "5 days ago",
    resolved: true,
  },
];

const reports = [
  { id: "q1-2026", name: "Q1 2026 Quarterly Report", status: "draft" as const, dueDate: "2026-03-31" },
  { id: "initial", name: "Initial Campaign Filing", status: "submitted" as const, dueDate: "2026-03-01" },
  { id: "donation-register", name: "Donation Register", status: "current" as const, dueDate: "Ongoing" },
  { id: "expenditure-report", name: "Expenditure Summary", status: "current" as const, dueDate: "Ongoing" },
];

const statusIcon = { pass: CheckCircle2, warning: AlertTriangle, fail: XCircle };
const statusColor = { pass: "text-[#1D6B3F]", warning: "text-[#ED8936]", fail: "text-[#E53E3E]" };
const statusBg = { pass: "bg-green-50", warning: "bg-orange-50", fail: "bg-red-50" };

export default function CompliancePage() {
  const [filterCategory, setFilterCategory] = useState("all");

  const passCount = complianceChecks.filter((c) => c.status === "pass").length;
  const warnCount = complianceChecks.filter((c) => c.status === "warning").length;
  const failCount = complianceChecks.filter((c) => c.status === "fail").length;
  const overallScore = Math.round((passCount / complianceChecks.length) * 100);

  const categories = ["all", ...Array.from(new Set(complianceChecks.map((c) => c.category)))];
  const filtered =
    filterCategory === "all"
      ? complianceChecks
      : complianceChecks.filter((c) => c.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2A44] flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-[#1D6B3F]" />
            Compliance Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">ECFA compliance monitoring &amp; reporting</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F2A44] text-white rounded-lg text-sm font-medium hover:bg-[#0F2A44]/90 transition-colors">
          <FileText className="h-4 w-4" />
          Generate Report
        </button>
      </div>

      {/* Score + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Circular Score */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center">
          <div className="relative h-28 w-28 mb-3">
            <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={overallScore >= 80 ? "#1D6B3F" : overallScore >= 60 ? "#ED8936" : "#E53E3E"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${overallScore * 2.64} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-[#0F2A44]">{overallScore}%</span>
            </div>
          </div>
          <p className="text-sm font-medium text-[#0F2A44]">Compliance Score</p>
          <p className="text-xs text-gray-500 mt-1">
            {passCount} pass · {warnCount} warnings · {failCount} failures
          </p>
        </div>

        {/* 3 Summary Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Scale className="h-5 w-5 text-[#2E75B6]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Spending Limit</p>
                <p className="text-lg font-bold text-[#0F2A44]">{formatKES(SPENDING_LIMIT)}</p>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1D6B3F] rounded-full transition-all"
                style={{ width: `${(TOTAL_SPENT / SPENDING_LIMIT) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formatKES(TOTAL_SPENT)} spent ({Math.round((TOTAL_SPENT / SPENDING_LIMIT) * 100)}%)
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[#1D6B3F]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Donations</p>
                <p className="text-lg font-bold text-[#0F2A44]">{formatKES(TOTAL_DONATIONS)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle2 className="h-4 w-4 text-[#1D6B3F]" />
              <span className="text-xs text-gray-600">All within legal limits</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#ED8936]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Next Filing</p>
                <p className="text-lg font-bold text-[#0F2A44]">18 days</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">Q1 2026 Quarterly Report</p>
          </div>
        </div>
      </div>

      {/* Compliance Checks */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-[#0F2A44]">Compliance Checks</h2>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                  filterCategory === cat
                    ? "bg-[#0F2A44] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {cat === "all" ? "All Checks" : cat}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map((check) => {
            const Icon = statusIcon[check.status];
            return (
              <div key={check.id} className={cn("flex items-start gap-3 px-5 py-4", statusBg[check.status])}>
                <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", statusColor[check.status])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0F2A44]">{check.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{check.description}</p>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full shrink-0",
                    check.status === "pass" && "bg-green-100 text-[#1D6B3F]",
                    check.status === "warning" && "bg-orange-100 text-[#ED8936]",
                    check.status === "fail" && "bg-red-100 text-[#E53E3E]"
                  )}
                >
                  {check.status === "pass" ? "Pass" : check.status === "warning" ? "Attention" : "Fail"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts + Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#0F2A44]">Recent Alerts</h2>
            <span className="text-xs bg-orange-100 text-[#ED8936] px-2 py-0.5 rounded-full font-medium">
              {recentAlerts.filter((a) => !a.resolved).length} active
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="px-5 py-3 flex items-start gap-3">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full mt-1.5 shrink-0",
                    alert.severity === "warning" && "bg-[#ED8936]",
                    alert.severity === "success" && "bg-[#1D6B3F]",
                    alert.severity === "info" && "bg-[#2E75B6]"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", alert.resolved ? "text-gray-400" : "text-gray-700")}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{alert.time}</p>
                </div>
                {alert.resolved && <span className="text-xs text-gray-400 shrink-0">Resolved</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Reports */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-[#0F2A44]">Regulatory Reports</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {reports.map((report) => (
              <div key={report.id} className="px-5 py-3 flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0F2A44]">{report.name}</p>
                  <p className="text-xs text-gray-500">Due: {report.dueDate}</p>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full shrink-0",
                    report.status === "submitted" && "bg-green-100 text-[#1D6B3F]",
                    report.status === "draft" && "bg-yellow-100 text-[#ED8936]",
                    report.status === "current" && "bg-blue-100 text-[#2E75B6]"
                  )}
                >
                  {report.status}
                </span>
                <button className="text-gray-400 hover:text-[#0F2A44] transition-colors">
                  {report.status === "submitted" ? <Download className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
