'use server';

import { createClient } from '@/lib/supabase/server';
import { ECFA_CATEGORIES } from '@/lib/validators/finance';
import {
  ECFA_ANONYMOUS_THRESHOLD,
  ECFA_INDIVIDUAL_LIMIT,
} from '@/lib/validators/donations';

export interface ComplianceAlert {
  id: string;
  level: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface ComplianceStatus {
  score: number;
  totalChecks: number;
  passedChecks: number;
  alerts: ComplianceAlert[];
  categorySpending: {
    category: string;
    spent: number;
    limit: number;
    percentage: number;
  }[];
  donationCompliance: {
    anonymousOverThreshold: number;
    singleSourceViolations: number;
    totalDonors: number;
    kycPending: number;
  };
  error?: string;
}

/** Default category limits as percentages of total spending limit */
const CATEGORY_LIMIT_PERCENTAGES: Record<string, number> = {
  Advertising: 0.15,
  Publicity: 0.25,
  'Venue Hire': 0.15,
  Transport: 0.10,
  Personnel: 0.10,
  'Admin & Other': 0.25,
};

/** Get comprehensive compliance status */
export async function getComplianceStatus(
  campaignId: string
): Promise<ComplianceStatus> {
  try {
    const supabase = await createClient();
    const alerts: ComplianceAlert[] = [];
    let totalChecks = 0;
    let passedChecks = 0;

    // Get campaign spending limit
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('spending_limit_kes')
      .eq('id', campaignId)
      .single();

    const spendingLimit = campaign?.spending_limit_kes ?? 35_000_000;

    // 1. Check category spending
    const { data: transactions } = await supabase
      .from('transactions')
      .select('category, amount_kes, type')
      .eq('campaign_id', campaignId);

    const allTxn = transactions ?? [];
    const expenses = allTxn.filter((t) => t.type === 'expense');

    const categorySpending = ECFA_CATEGORIES.map((category) => {
      const spent = expenses
        .filter((t) => t.category === category)
        .reduce((sum, t) => sum + t.amount_kes, 0);
      const limitPct = CATEGORY_LIMIT_PERCENTAGES[category] ?? 0.10;
      const limit = spendingLimit * limitPct;
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;

      totalChecks++;
      if (percentage <= 80) {
        passedChecks++;
      } else if (percentage > 100) {
        alerts.push({
          id: `cat-${category}`,
          level: 'critical',
          category: 'Spending',
          message: `${category} spending exceeds ECFA category limit (${percentage.toFixed(0)}%)`,
          timestamp: new Date().toISOString(),
          resolved: false,
        });
      } else {
        alerts.push({
          id: `cat-warn-${category}`,
          level: 'warning',
          category: 'Spending',
          message: `${category} spending at ${percentage.toFixed(0)}% of category limit`,
          timestamp: new Date().toISOString(),
          resolved: false,
        });
      }

      return { category, spent, limit, percentage };
    });

    // 2. Total spending vs limit
    const totalSpent = expenses.reduce((sum, t) => sum + t.amount_kes, 0);
    totalChecks++;
    if (totalSpent <= spendingLimit * 0.9) {
      passedChecks++;
    } else if (totalSpent > spendingLimit) {
      alerts.push({
        id: 'total-spending',
        level: 'critical',
        category: 'Spending',
        message: `Total spending exceeds campaign limit of KES ${spendingLimit.toLocaleString()}`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    } else {
      alerts.push({
        id: 'total-spending-warn',
        level: 'warning',
        category: 'Spending',
        message: `Total spending at ${((totalSpent / spendingLimit) * 100).toFixed(0)}% of campaign limit`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    // 3. Check donation compliance
    const { data: donations } = await supabase
      .from('donations')
      .select('*')
      .eq('campaign_id', campaignId);

    const allDonations = donations ?? [];

    // Anonymous over threshold
    const anonymousOverThreshold = allDonations.filter(
      (d) => d.is_anonymous && d.amount_kes > ECFA_ANONYMOUS_THRESHOLD
    ).length;

    totalChecks++;
    if (anonymousOverThreshold === 0) {
      passedChecks++;
    } else {
      alerts.push({
        id: 'anon-threshold',
        level: 'critical',
        category: 'Donations',
        message: `${anonymousOverThreshold} anonymous donation(s) exceed KES ${ECFA_ANONYMOUS_THRESHOLD.toLocaleString()} ECFA threshold`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    // Single-source violations (20% cap)
    const twentyPercentCap = spendingLimit * 0.2;
    const donorTotals = new Map<string, number>();
    for (const d of allDonations.filter((d) => d.donor_phone)) {
      const phone = d.donor_phone!;
      donorTotals.set(phone, (donorTotals.get(phone) ?? 0) + d.amount_kes);
    }
    const singleSourceViolations = Array.from(donorTotals.values()).filter(
      (total) => total > twentyPercentCap
    ).length;

    totalChecks++;
    if (singleSourceViolations === 0) {
      passedChecks++;
    } else {
      alerts.push({
        id: 'single-source',
        level: 'critical',
        category: 'Donations',
        message: `${singleSourceViolations} donor(s) exceed 20% single-source cap (KES ${twentyPercentCap.toLocaleString()})`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    // Individual limit check
    const overIndividualLimit = Array.from(donorTotals.values()).filter(
      (total) => total > ECFA_INDIVIDUAL_LIMIT
    ).length;

    totalChecks++;
    if (overIndividualLimit === 0) {
      passedChecks++;
    } else {
      alerts.push({
        id: 'individual-limit',
        level: 'critical',
        category: 'Donations',
        message: `${overIndividualLimit} donor(s) exceed KES ${ECFA_INDIVIDUAL_LIMIT.toLocaleString()} individual limit`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    // KYC pending
    const kycPending = allDonations.filter(
      (d) => d.kyc_status === 'pending'
    ).length;

    totalChecks++;
    if (kycPending === 0) {
      passedChecks++;
    } else {
      alerts.push({
        id: 'kyc-pending',
        level: 'warning',
        category: 'KYC',
        message: `${kycPending} donation(s) pending KYC verification`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    // 4. Evidence verification
    const { data: evidence } = await supabase
      .from('evidence_items')
      .select('verification_status')
      .eq('campaign_id', campaignId);

    const allEvidence = evidence ?? [];
    const unverifiedEvidence = allEvidence.filter(
      (e) => e.verification_status === 'pending'
    ).length;
    const flaggedEvidence = allEvidence.filter(
      (e) => e.verification_status === 'flagged'
    ).length;

    totalChecks++;
    if (flaggedEvidence === 0 && unverifiedEvidence === 0) {
      passedChecks++;
    } else if (flaggedEvidence > 0) {
      alerts.push({
        id: 'evidence-flagged',
        level: 'warning',
        category: 'Evidence',
        message: `${flaggedEvidence} evidence item(s) flagged for review`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    // 5. Receipt compliance (transactions without receipts)
    const noReceipt = expenses.filter(
      (t) =>
        !allTxn.find(
          (at) => at === t
        )
    );
    // Actually check for receipt_url in the full transaction data
    const { data: fullTransactions } = await supabase
      .from('transactions')
      .select('receipt_url')
      .eq('campaign_id', campaignId)
      .eq('type', 'expense')
      .is('receipt_url', null);

    const missingReceipts = fullTransactions?.length ?? 0;
    void noReceipt; // suppress unused

    totalChecks++;
    if (missingReceipts === 0) {
      passedChecks++;
    } else {
      alerts.push({
        id: 'missing-receipts',
        level: 'warning',
        category: 'Documentation',
        message: `${missingReceipts} expense(s) missing receipt uploads`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    const score = totalChecks > 0
      ? Math.round((passedChecks / totalChecks) * 100)
      : 100;

    // Sort alerts: critical first, then warning, then info
    const alertOrder = { critical: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => alertOrder[a.level] - alertOrder[b.level]);

    return {
      score,
      totalChecks,
      passedChecks,
      alerts,
      categorySpending,
      donationCompliance: {
        anonymousOverThreshold,
        singleSourceViolations,
        totalDonors: donorTotals.size,
        kycPending,
      },
    };
  } catch (err) {
    return {
      score: 0,
      totalChecks: 0,
      passedChecks: 0,
      alerts: [],
      categorySpending: [],
      donationCompliance: {
        anonymousOverThreshold: 0,
        singleSourceViolations: 0,
        totalDonors: 0,
        kycPending: 0,
      },
      error: String(err),
    };
  }
}
