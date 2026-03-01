'use server';

import { createClient } from '@/lib/supabase/server';
import { getFinanceSummary } from '@/lib/actions/transactions';
import { getDonationStats } from '@/lib/actions/donations';
import { getComplianceStatus } from '@/lib/actions/compliance';
import { getAgentStats } from '@/lib/actions/agents';
import {
  ECFA_SPENDING_LIMIT,
  ECFA_CATEGORIES,
} from '@/lib/validators/finance';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IEBCReport {
  reportId: string;
  campaignId: string;
  generatedAt: string;
  period: { start: string; end: string };

  /** Section 1: Campaign Information */
  campaignInfo: {
    name: string;
    type: string;
    registrationDate: string;
  };

  /** Section 2: Financial Summary */
  financialSummary: {
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    spendingLimit: number;
    utilizationPercentage: number;
    categoryBreakdown: Array<{
      category: string;
      allocated: number;
      spent: number;
      remaining: number;
    }>;
  };

  /** Section 3: Donation Summary */
  donationSummary: {
    totalDonations: number;
    donorCount: number;
    anonymousDonations: number;
    anonymousTotal: number;
    methodBreakdown: {
      mpesa: number;
      bank: number;
      cash: number;
      other: number;
    };
    complianceFlags: string[];
  };

  /** Section 4: Agent Summary */
  agentSummary: {
    totalAgents: number;
    deployedCount: number;
    activeCount: number;
    pendingCount: number;
  };

  /** Section 5: Compliance Status */
  complianceStatus: {
    overallScore: number;
    categories: Array<{
      name: string;
      score: number;
      status: 'pass' | 'warning' | 'fail';
    }>;
    alerts: string[];
  };
}

// ---------------------------------------------------------------------------
// Category allocation percentages (matches compliance.ts)
// ---------------------------------------------------------------------------

const CATEGORY_ALLOCATION_PERCENTAGES: Record<string, number> = {
  Advertising: 0.15,
  Publicity: 0.25,
  'Venue Hire': 0.15,
  Transport: 0.10,
  Personnel: 0.10,
  'Admin & Other': 0.25,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a deterministic report ID from campaign + timestamp */
function generateReportId(campaignId: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `IEBC-${campaignId.substring(0, 8).toUpperCase()}-${ts}-${rand}`;
}

/** Format KES amount with commas */
function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Pad a string to a fixed width for text alignment */
function padRight(str: string, width: number): string {
  return str.length >= width ? str : str + ' '.repeat(width - str.length);
}

// ---------------------------------------------------------------------------
// Report generator
// ---------------------------------------------------------------------------

/**
 * Generate a full IEBC compliance report for a given campaign.
 *
 * Fetches finance summary, donation stats, agent stats, compliance status,
 * and campaign metadata, then assembles a structured `IEBCReport` object.
 */
export async function generateIEBCReport(
  campaignId: string,
  period?: { start: string; end: string }
): Promise<IEBCReport> {
  // Default period: start of year to today
  const now = new Date();
  const resolvedPeriod = period ?? {
    start: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
    end: now.toISOString().split('T')[0],
  };

  // Fetch all data in parallel
  const [financeSummary, donationStats, agentStats, compliance, campaignData] =
    await Promise.all([
      getFinanceSummary(campaignId),
      getDonationStats(campaignId),
      getAgentStats(campaignId),
      getComplianceStatus(campaignId),
      fetchCampaignInfo(campaignId),
    ]);

  // --- Section 1: Campaign Information ---
  const campaignInfo = {
    name: campaignData?.candidate_name ?? 'Unknown Campaign',
    type: campaignData?.position ?? 'Unknown',
    registrationDate: campaignData?.created_at?.split('T')[0] ?? 'N/A',
  };

  // --- Section 2: Financial Summary ---
  const spendingLimit =
    financeSummary.spendingLimit ?? ECFA_SPENDING_LIMIT;

  // Build category breakdown using the six ECFA categories
  const spentByCategory = new Map<string, number>();
  for (const entry of financeSummary.byCategory) {
    spentByCategory.set(entry.category, entry.total);
  }

  const categoryBreakdown = ECFA_CATEGORIES.map((category) => {
    const allocationPct = CATEGORY_ALLOCATION_PERCENTAGES[category] ?? 0.1;
    const allocated = spendingLimit * allocationPct;
    const spent = spentByCategory.get(category) ?? 0;
    return {
      category,
      allocated,
      spent,
      remaining: allocated - spent,
    };
  });

  const totalBudget = financeSummary.totalDonations;
  const totalSpent = financeSummary.totalSpent;

  const financialSummary = {
    totalBudget,
    totalSpent,
    remainingBudget: totalBudget - totalSpent,
    spendingLimit,
    utilizationPercentage:
      spendingLimit > 0
        ? Math.round((totalSpent / spendingLimit) * 10000) / 100
        : 0,
    categoryBreakdown,
  };

  // --- Section 3: Donation Summary ---
  // Map the byMethod array into the expected breakdown
  const methodMap = new Map<string, number>();
  for (const entry of donationStats.byMethod) {
    methodMap.set(entry.method.toLowerCase(), entry.amount);
  }

  const complianceFlags: string[] = [];
  if (donationStats.flaggedCount > 0) {
    complianceFlags.push(
      `${donationStats.flaggedCount} donation(s) flagged for compliance review`
    );
  }
  if (donationStats.anonymousCount > 0) {
    complianceFlags.push(
      `${donationStats.anonymousCount} anonymous donation(s) totalling ${formatKES(donationStats.anonymousTotal)}`
    );
  }
  if (compliance.donationCompliance.anonymousOverThreshold > 0) {
    complianceFlags.push(
      `${compliance.donationCompliance.anonymousOverThreshold} anonymous donation(s) exceed ECFA threshold`
    );
  }
  if (compliance.donationCompliance.singleSourceViolations > 0) {
    complianceFlags.push(
      `${compliance.donationCompliance.singleSourceViolations} donor(s) exceed 20% single-source cap`
    );
  }

  const donationSummary = {
    totalDonations: donationStats.totalAmount,
    donorCount: compliance.donationCompliance.totalDonors,
    anonymousDonations: donationStats.anonymousCount,
    anonymousTotal: donationStats.anonymousTotal,
    methodBreakdown: {
      mpesa: methodMap.get('m-pesa') ?? 0,
      bank: methodMap.get('bank') ?? 0,
      cash: methodMap.get('cash') ?? 0,
      other: methodMap.get('other') ?? 0,
    },
    complianceFlags,
  };

  // --- Section 4: Agent Summary ---
  const agentSummary = {
    totalAgents: agentStats.total,
    deployedCount: agentStats.deployed,
    activeCount: agentStats.active,
    pendingCount: agentStats.pending,
  };

  // --- Section 5: Compliance Status ---
  // Map category spending into scored categories
  const complianceCategories = compliance.categorySpending.map((cs) => {
    let status: 'pass' | 'warning' | 'fail';
    if (cs.percentage > 100) {
      status = 'fail';
    } else if (cs.percentage > 80) {
      status = 'warning';
    } else {
      status = 'pass';
    }
    return {
      name: cs.category,
      score: Math.max(0, Math.round(100 - cs.percentage)),
      status,
    };
  });

  const complianceStatus = {
    overallScore: compliance.score,
    categories: complianceCategories,
    alerts: compliance.alerts
      .filter((a) => !a.resolved)
      .map((a) => `[${a.level.toUpperCase()}] ${a.message}`),
  };

  return {
    reportId: generateReportId(campaignId),
    campaignId,
    generatedAt: now.toISOString(),
    period: resolvedPeriod,
    campaignInfo,
    financialSummary,
    donationSummary,
    agentSummary,
    complianceStatus,
  };
}

// ---------------------------------------------------------------------------
// Campaign info fetcher (internal helper)
// ---------------------------------------------------------------------------

async function fetchCampaignInfo(campaignId: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('campaigns')
      .select(
        'candidate_name, position, county, constituency, ward, party, created_at'
      )
      .eq('id', campaignId)
      .single();
    return data;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Text formatter
// ---------------------------------------------------------------------------

const SEPARATOR = '='.repeat(72);
const SUB_SEPARATOR = '-'.repeat(72);

/**
 * Format an `IEBCReport` as a readable plain-text document suitable for
 * printing or saving as a `.txt` file.
 */
export function formatIEBCReportAsText(report: IEBCReport): string {
  const lines: string[] = [];

  // --- Header ---
  lines.push(SEPARATOR);
  lines.push(
    '  INDEPENDENT ELECTORAL AND BOUNDARIES COMMISSION (IEBC)'
  );
  lines.push(
    '  ELECTION CAMPAIGN FINANCING ACT - COMPLIANCE REPORT'
  );
  lines.push(SEPARATOR);
  lines.push('');
  lines.push(`  Report ID:      ${report.reportId}`);
  lines.push(`  Generated:      ${new Date(report.generatedAt).toLocaleString('en-KE')}`);
  lines.push(
    `  Reporting Period: ${report.period.start} to ${report.period.end}`
  );
  lines.push('');

  // --- Section 1: Campaign Information ---
  lines.push(SEPARATOR);
  lines.push('  SECTION 1: CAMPAIGN INFORMATION');
  lines.push(SEPARATOR);
  lines.push('');
  lines.push(`  Campaign / Candidate:  ${report.campaignInfo.name}`);
  lines.push(`  Position / Type:       ${report.campaignInfo.type}`);
  lines.push(`  Registration Date:     ${report.campaignInfo.registrationDate}`);
  lines.push('');

  // --- Section 2: Financial Summary ---
  lines.push(SEPARATOR);
  lines.push('  SECTION 2: FINANCIAL SUMMARY');
  lines.push(SEPARATOR);
  lines.push('');
  lines.push(`  ECFA Spending Limit:   ${formatKES(report.financialSummary.spendingLimit)}`);
  lines.push(`  Total Budget (Income): ${formatKES(report.financialSummary.totalBudget)}`);
  lines.push(`  Total Spent:           ${formatKES(report.financialSummary.totalSpent)}`);
  lines.push(`  Remaining Budget:      ${formatKES(report.financialSummary.remainingBudget)}`);
  lines.push(`  Utilization:           ${report.financialSummary.utilizationPercentage}% of ECFA limit`);
  lines.push('');

  lines.push('  Category Breakdown:');
  lines.push(SUB_SEPARATOR);
  lines.push(
    `  ${padRight('Category', 18)} ${padRight('Allocated', 18)} ${padRight('Spent', 18)} Remaining`
  );
  lines.push(SUB_SEPARATOR);
  for (const cat of report.financialSummary.categoryBreakdown) {
    lines.push(
      `  ${padRight(cat.category, 18)} ${padRight(formatKES(cat.allocated), 18)} ${padRight(formatKES(cat.spent), 18)} ${formatKES(cat.remaining)}`
    );
  }
  lines.push(SUB_SEPARATOR);
  lines.push('');

  // --- Section 3: Donation Summary ---
  lines.push(SEPARATOR);
  lines.push('  SECTION 3: DONATION SUMMARY');
  lines.push(SEPARATOR);
  lines.push('');
  lines.push(`  Total Donations:       ${formatKES(report.donationSummary.totalDonations)}`);
  lines.push(`  Total Donors:          ${report.donationSummary.donorCount}`);
  lines.push(`  Anonymous Donations:   ${report.donationSummary.anonymousDonations}`);
  lines.push(`  Anonymous Total:       ${formatKES(report.donationSummary.anonymousTotal)}`);
  lines.push('');

  lines.push('  Donation Method Breakdown:');
  lines.push(SUB_SEPARATOR);
  lines.push(`  M-Pesa:   ${formatKES(report.donationSummary.methodBreakdown.mpesa)}`);
  lines.push(`  Bank:     ${formatKES(report.donationSummary.methodBreakdown.bank)}`);
  lines.push(`  Cash:     ${formatKES(report.donationSummary.methodBreakdown.cash)}`);
  lines.push(`  Other:    ${formatKES(report.donationSummary.methodBreakdown.other)}`);
  lines.push(SUB_SEPARATOR);
  lines.push('');

  if (report.donationSummary.complianceFlags.length > 0) {
    lines.push('  Compliance Flags:');
    for (const flag of report.donationSummary.complianceFlags) {
      lines.push(`    * ${flag}`);
    }
    lines.push('');
  }

  // --- Section 4: Agent Summary ---
  lines.push(SEPARATOR);
  lines.push('  SECTION 4: AGENT SUMMARY');
  lines.push(SEPARATOR);
  lines.push('');
  lines.push(`  Total Agents:      ${report.agentSummary.totalAgents}`);
  lines.push(`  Deployed:          ${report.agentSummary.deployedCount}`);
  lines.push(`  Active:            ${report.agentSummary.activeCount}`);
  lines.push(`  Pending:           ${report.agentSummary.pendingCount}`);
  lines.push('');

  // --- Section 5: Compliance Status ---
  lines.push(SEPARATOR);
  lines.push('  SECTION 5: COMPLIANCE STATUS');
  lines.push(SEPARATOR);
  lines.push('');
  lines.push(`  Overall Compliance Score: ${report.complianceStatus.overallScore}%`);
  lines.push('');

  if (report.complianceStatus.categories.length > 0) {
    lines.push('  Category Scores:');
    lines.push(SUB_SEPARATOR);
    lines.push(
      `  ${padRight('Category', 18)} ${padRight('Score', 10)} Status`
    );
    lines.push(SUB_SEPARATOR);
    for (const cat of report.complianceStatus.categories) {
      const statusLabel =
        cat.status === 'pass'
          ? 'PASS'
          : cat.status === 'warning'
            ? 'WARNING'
            : 'FAIL';
      lines.push(
        `  ${padRight(cat.name, 18)} ${padRight(`${cat.score}%`, 10)} ${statusLabel}`
      );
    }
    lines.push(SUB_SEPARATOR);
    lines.push('');
  }

  if (report.complianceStatus.alerts.length > 0) {
    lines.push('  Active Alerts:');
    for (const alert of report.complianceStatus.alerts) {
      lines.push(`    * ${alert}`);
    }
    lines.push('');
  }

  // --- Footer ---
  lines.push(SEPARATOR);
  lines.push(
    '  This report was generated by KURA360 for IEBC compliance'
  );
  lines.push(
    '  under the Election Campaign Financing Act (ECFA).'
  );
  lines.push(
    '  All figures are in Kenya Shillings (KES).'
  );
  lines.push(SEPARATOR);
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Download trigger (client-side helper -- exported but runs on client)
// ---------------------------------------------------------------------------

/**
 * Trigger a download of the IEBC report as a plain-text file.
 *
 * NOTE: Despite the `'use server'` directive at module level, this function
 * is intended to be called on the client side after obtaining the report
 * object from `generateIEBCReport`. It uses browser APIs (`Blob`,
 * `URL.createObjectURL`, DOM manipulation) that are only available in the
 * browser. Import it directly in client components.
 */
export function downloadIEBCReport(report: IEBCReport): void {
  const text = formatIEBCReportAsText(report);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `IEBC-Report-${report.reportId}.txt`;
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
