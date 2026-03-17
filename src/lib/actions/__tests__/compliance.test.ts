import { describe, it, expect, vi, beforeEach } from 'vitest';

/* -------------------------------------------------------------------------- */
/*  Mock Supabase client                                                       */
/* -------------------------------------------------------------------------- */

// Build a chainable query builder mock that resolves on terminal calls
function createQueryMock(data: unknown = null) {
  const builder: Record<string, unknown> = {};
  const chainMethods = ['from', 'select', 'eq', 'is', 'in', 'single', 'order', 'limit'];

  for (const method of chainMethods) {
    if (method === 'single') {
      builder[method] = vi.fn().mockResolvedValue({ data, error: null });
    } else {
      builder[method] = vi.fn().mockReturnValue(builder);
    }
  }
  // Terminal: when no .single() is called, await resolves the builder itself
  (builder as { then: unknown }).then = vi.fn((resolve: (v: unknown) => void) =>
    resolve({ data, error: null })
  );
  return builder;
}

/** Per-table mock data */
let mockCampaign: unknown;
let mockTransactions: unknown[];
let mockDonations: unknown[];
let mockEvidence: unknown[];
let mockMissingReceipts: unknown[];

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => {
    // Return a mock supabase client where .from(table) routes to the right data
    return {
      from: vi.fn().mockImplementation((table: string) => {
        // Each .from() returns a fresh chainable query
        const make = (data: unknown) => {
          const q: Record<string, unknown> = {};
          q.select = vi.fn().mockReturnValue(q);
          q.eq = vi.fn().mockImplementation((_col: string, _val: unknown) => {
            // When filtering expenses with missing receipts
            return q;
          });
          q.is = vi.fn().mockImplementation((_col: string, _val: unknown) => {
            // After .is('receipt_url', null) return missing receipts data
            return {
              ...q,
              then: (resolve: (v: unknown) => void) =>
                resolve({ data: mockMissingReceipts, error: null }),
            };
          });
          q.single = vi.fn().mockResolvedValue({ data, error: null });
          // Default terminal
          (q as { then: unknown }).then = (resolve: (v: unknown) => void) =>
            resolve({ data, error: null });
          return q;
        };

        switch (table) {
          case 'campaigns':
            return make(mockCampaign);
          case 'transactions':
            return make(mockTransactions);
          case 'donations':
            return make(mockDonations);
          case 'evidence_items':
            return make(mockEvidence);
          default:
            return make(null);
        }
      }),
    };
  }),
}));

/* -------------------------------------------------------------------------- */
/*  Import after mocks are set up                                              */
/* -------------------------------------------------------------------------- */

import { getComplianceStatus } from '../compliance';

/* -------------------------------------------------------------------------- */
/*  ECFA Constants (must match validators)                                     */
/* -------------------------------------------------------------------------- */

const ECFA_ANONYMOUS_THRESHOLD = 5_000;
const ECFA_INDIVIDUAL_LIMIT = 500_000;
const DEFAULT_SPENDING_LIMIT = 35_000_000;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

beforeEach(() => {
  mockCampaign = { spending_limit_kes: DEFAULT_SPENDING_LIMIT };
  mockTransactions = [];
  mockDonations = [];
  mockEvidence = [];
  mockMissingReceipts = [];
});

/* ========================================================================== */
/*  Fully compliant campaign                                                   */
/* ========================================================================== */

describe('getComplianceStatus — fully compliant campaign', () => {
  it('returns 100% score with no alerts when everything is clean', async () => {
    const result = await getComplianceStatus('campaign-1');
    expect(result.score).toBe(100);
    expect(result.alerts).toHaveLength(0);
    expect(result.passedChecks).toBe(result.totalChecks);
    expect(result.error).toBeUndefined();
  });

  it('returns correct donationCompliance shape', async () => {
    const result = await getComplianceStatus('campaign-1');
    expect(result.donationCompliance).toEqual({
      anonymousOverThreshold: 0,
      singleSourceViolations: 0,
      totalDonors: 0,
      kycPending: 0,
    });
  });
});

/* ========================================================================== */
/*  Anonymous donation violations                                              */
/* ========================================================================== */

describe('getComplianceStatus — anonymous donation threshold', () => {
  it('flags anonymous donations over KES 5,000', async () => {
    mockDonations = [
      { is_anonymous: true, amount_kes: 5_001, donor_phone: null, kyc_status: 'verified' },
    ];

    const result = await getComplianceStatus('campaign-1');
    expect(result.donationCompliance.anonymousOverThreshold).toBe(1);
    const alert = result.alerts.find((a) => a.id === 'anon-threshold');
    expect(alert).toBeDefined();
    expect(alert!.level).toBe('critical');
    expect(alert!.message).toContain('anonymous');
  });

  it('does NOT flag anonymous donation at exactly KES 5,000', async () => {
    mockDonations = [
      { is_anonymous: true, amount_kes: ECFA_ANONYMOUS_THRESHOLD, donor_phone: null, kyc_status: 'verified' },
    ];

    const result = await getComplianceStatus('campaign-1');
    expect(result.donationCompliance.anonymousOverThreshold).toBe(0);
    expect(result.alerts.find((a) => a.id === 'anon-threshold')).toBeUndefined();
  });

  it('counts multiple anonymous violations', async () => {
    mockDonations = [
      { is_anonymous: true, amount_kes: 10_000, donor_phone: null, kyc_status: 'verified' },
      { is_anonymous: true, amount_kes: 50_000, donor_phone: null, kyc_status: 'verified' },
      { is_anonymous: false, amount_kes: 100_000, donor_phone: '+254700000001', kyc_status: 'verified' },
    ];

    const result = await getComplianceStatus('campaign-1');
    expect(result.donationCompliance.anonymousOverThreshold).toBe(2);
  });
});

/* ========================================================================== */
/*  Single-source 20% cap violations                                           */
/* ========================================================================== */

describe('getComplianceStatus — single-source 20% cap', () => {
  it('flags donors who exceed 20% of the spending limit', async () => {
    const twentyPercentCap = DEFAULT_SPENDING_LIMIT * 0.2; // 7,000,000
    mockDonations = [
      { donor_phone: '+254700000001', amount_kes: twentyPercentCap + 1, is_anonymous: false, kyc_status: 'verified' },
    ];

    const result = await getComplianceStatus('campaign-1');
    expect(result.donationCompliance.singleSourceViolations).toBe(1);
    const alert = result.alerts.find((a) => a.id === 'single-source');
    expect(alert).toBeDefined();
    expect(alert!.level).toBe('critical');
    expect(alert!.message).toContain('20%');
  });

  it('aggregates multiple donations from the same donor', async () => {
    // Each donation is under the cap individually, but together they exceed
    const halfCap = (DEFAULT_SPENDING_LIMIT * 0.2) / 2 + 1;
    mockDonations = [
      { donor_phone: '+254700000001', amount_kes: halfCap, is_anonymous: false, kyc_status: 'verified' },
      { donor_phone: '+254700000001', amount_kes: halfCap, is_anonymous: false, kyc_status: 'verified' },
    ];

    const result = await getComplianceStatus('campaign-1');
    expect(result.donationCompliance.singleSourceViolations).toBe(1);
  });

  it('does NOT flag donors at exactly 20% of spending limit', async () => {
    const twentyPercentCap = DEFAULT_SPENDING_LIMIT * 0.2;
    mockDonations = [
      { donor_phone: '+254700000001', amount_kes: twentyPercentCap, is_anonymous: false, kyc_status: 'verified' },
    ];

    const result = await getComplianceStatus('campaign-1');
    expect(result.donationCompliance.singleSourceViolations).toBe(0);
  });

  it('counts distinct violating donors separately', async () => {
    const overCap = DEFAULT_SPENDING_LIMIT * 0.2 + 1;
    mockDonations = [
      { donor_phone: '+254700000001', amount_kes: overCap, is_anonymous: false, kyc_status: 'verified' },
      { donor_phone: '+254700000002', amount_kes: overCap, is_anonymous: false, kyc_status: 'verified' },
    ];

    const result = await getComplianceStatus('campaign-1');
    expect(result.donationCompliance.singleSourceViolations).toBe(2);
  });
});

/* ========================================================================== */
/*  Individual limit                                                           */
/* ========================================================================== */

describe('getComplianceStatus — ECFA individual limit', () => {
  it('flags donors who exceed KES 500,000 individual limit', async () => {
    mockDonations = [
      { donor_phone: '+254700000001', amount_kes: ECFA_INDIVIDUAL_LIMIT + 1, is_anonymous: false, kyc_status: 'verified' },
    ];

    const result = await getComplianceStatus('campaign-1');
    const alert = result.alerts.find((a) => a.id === 'individual-limit');
    expect(alert).toBeDefined();
    expect(alert!.level).toBe('critical');
    expect(alert!.message).toContain('500,000');
  });

  it('does NOT flag donor at exactly KES 500,000', async () => {
    mockDonations = [
      { donor_phone: '+254700000001', amount_kes: ECFA_INDIVIDUAL_LIMIT, is_anonymous: false, kyc_status: 'verified' },
    ];

    const result = await getComplianceStatus('campaign-1');
    const alert = result.alerts.find((a) => a.id === 'individual-limit');
    expect(alert).toBeUndefined();
  });
});

/* ========================================================================== */
/*  Category spending                                                          */
/* ========================================================================== */

describe('getComplianceStatus — category spending', () => {
  it('reports category spending with percentages', async () => {
    mockTransactions = [
      { category: 'Advertising', amount_kes: 1_000_000, type: 'expense' },
      { category: 'Transport', amount_kes: 500_000, type: 'expense' },
    ];

    const result = await getComplianceStatus('campaign-1');
    expect(result.categorySpending.length).toBeGreaterThan(0);

    const adSpending = result.categorySpending.find((c) => c.category === 'Advertising');
    expect(adSpending).toBeDefined();
    expect(adSpending!.spent).toBe(1_000_000);
    expect(adSpending!.limit).toBe(DEFAULT_SPENDING_LIMIT * 0.15);
    expect(adSpending!.percentage).toBeGreaterThan(0);
  });

  it('creates warning alert when category spending is between 80-100%', async () => {
    // Advertising limit is 15% of 35M = 5,250,000
    // 85% of that = 4,462,500
    mockTransactions = [
      { category: 'Advertising', amount_kes: 4_462_500, type: 'expense' },
    ];

    const result = await getComplianceStatus('campaign-1');
    const alert = result.alerts.find((a) => a.id === 'cat-warn-Advertising');
    expect(alert).toBeDefined();
    expect(alert!.level).toBe('warning');
  });

  it('creates critical alert when category spending exceeds 100%', async () => {
    // Advertising limit is 5,250,000 - exceed it
    mockTransactions = [
      { category: 'Advertising', amount_kes: 5_500_000, type: 'expense' },
    ];

    const result = await getComplianceStatus('campaign-1');
    const alert = result.alerts.find((a) => a.id === 'cat-Advertising');
    expect(alert).toBeDefined();
    expect(alert!.level).toBe('critical');
  });

  it('ignores income transactions for expense category checks', async () => {
    mockTransactions = [
      { category: 'Advertising', amount_kes: 10_000_000, type: 'income' },
    ];

    const result = await getComplianceStatus('campaign-1');
    const adSpending = result.categorySpending.find((c) => c.category === 'Advertising');
    expect(adSpending!.spent).toBe(0);
  });
});

/* ========================================================================== */
/*  Total spending                                                             */
/* ========================================================================== */

describe('getComplianceStatus — total spending', () => {
  it('creates critical alert when total spending exceeds limit', async () => {
    mockTransactions = [
      { category: 'Advertising', amount_kes: 36_000_000, type: 'expense' },
    ];

    const result = await getComplianceStatus('campaign-1');
    const alert = result.alerts.find((a) => a.id === 'total-spending');
    expect(alert).toBeDefined();
    expect(alert!.level).toBe('critical');
  });

  it('creates warning when total spending is between 90-100% of limit', async () => {
    // 92% of 35M = 32,200,000
    mockTransactions = [
      { category: 'Advertising', amount_kes: 32_200_000, type: 'expense' },
    ];

    const result = await getComplianceStatus('campaign-1');
    const alert = result.alerts.find((a) => a.id === 'total-spending-warn');
    expect(alert).toBeDefined();
    expect(alert!.level).toBe('warning');
  });
});

/* ========================================================================== */
/*  KYC pending                                                                */
/* ========================================================================== */

describe('getComplianceStatus — KYC checks', () => {
  it('flags pending KYC donations', async () => {
    mockDonations = [
      { donor_phone: '+254700000001', amount_kes: 1_000, is_anonymous: false, kyc_status: 'pending' },
      { donor_phone: '+254700000002', amount_kes: 2_000, is_anonymous: false, kyc_status: 'pending' },
      { donor_phone: '+254700000003', amount_kes: 3_000, is_anonymous: false, kyc_status: 'verified' },
    ];

    const result = await getComplianceStatus('campaign-1');
    expect(result.donationCompliance.kycPending).toBe(2);
    const alert = result.alerts.find((a) => a.id === 'kyc-pending');
    expect(alert).toBeDefined();
    expect(alert!.level).toBe('warning');
  });
});

/* ========================================================================== */
/*  Evidence verification                                                      */
/* ========================================================================== */

describe('getComplianceStatus — evidence verification', () => {
  it('flags when evidence items are flagged', async () => {
    mockEvidence = [
      { verification_status: 'verified' },
      { verification_status: 'flagged' },
    ];

    const result = await getComplianceStatus('campaign-1');
    const alert = result.alerts.find((a) => a.id === 'evidence-flagged');
    expect(alert).toBeDefined();
    expect(alert!.level).toBe('warning');
  });

  it('passes when all evidence is verified', async () => {
    mockEvidence = [
      { verification_status: 'verified' },
      { verification_status: 'verified' },
    ];

    const result = await getComplianceStatus('campaign-1');
    const alert = result.alerts.find((a) => a.id === 'evidence-flagged');
    expect(alert).toBeUndefined();
  });
});

/* ========================================================================== */
/*  Missing receipts                                                           */
/* ========================================================================== */

describe('getComplianceStatus — receipt compliance', () => {
  it('flags expenses missing receipts', async () => {
    mockMissingReceipts = [{ receipt_url: null }, { receipt_url: null }];

    const result = await getComplianceStatus('campaign-1');
    const alert = result.alerts.find((a) => a.id === 'missing-receipts');
    expect(alert).toBeDefined();
    expect(alert!.level).toBe('warning');
    expect(alert!.message).toContain('2');
  });
});

/* ========================================================================== */
/*  Score calculation                                                          */
/* ========================================================================== */

describe('getComplianceStatus — score calculation', () => {
  it('score decreases as violations increase', async () => {
    // Add multiple violations
    mockDonations = [
      { is_anonymous: true, amount_kes: 10_000, donor_phone: null, kyc_status: 'pending' },
    ];
    mockMissingReceipts = [{ receipt_url: null }];

    const result = await getComplianceStatus('campaign-1');
    expect(result.score).toBeLessThan(100);
    expect(result.passedChecks).toBeLessThan(result.totalChecks);
  });

  it('alerts are sorted: critical first, then warning, then info', async () => {
    mockDonations = [
      { is_anonymous: true, amount_kes: 10_000, donor_phone: null, kyc_status: 'pending' },
    ];
    mockMissingReceipts = [{ receipt_url: null }];

    const result = await getComplianceStatus('campaign-1');
    if (result.alerts.length >= 2) {
      const levels = result.alerts.map((a) => a.level);
      const criticalIdx = levels.indexOf('critical');
      const warningIdx = levels.indexOf('warning');
      if (criticalIdx !== -1 && warningIdx !== -1) {
        expect(criticalIdx).toBeLessThan(warningIdx);
      }
    }
  });
});

/* ========================================================================== */
/*  Donor count                                                                */
/* ========================================================================== */

describe('getComplianceStatus — donor tracking', () => {
  it('counts unique donors by phone number', async () => {
    mockDonations = [
      { donor_phone: '+254700000001', amount_kes: 1_000, is_anonymous: false, kyc_status: 'verified' },
      { donor_phone: '+254700000001', amount_kes: 2_000, is_anonymous: false, kyc_status: 'verified' },
      { donor_phone: '+254700000002', amount_kes: 3_000, is_anonymous: false, kyc_status: 'verified' },
    ];

    const result = await getComplianceStatus('campaign-1');
    expect(result.donationCompliance.totalDonors).toBe(2);
  });

  it('excludes anonymous donors without phone from donor count', async () => {
    mockDonations = [
      { donor_phone: null, amount_kes: 1_000, is_anonymous: true, kyc_status: 'verified' },
      { donor_phone: '+254700000001', amount_kes: 2_000, is_anonymous: false, kyc_status: 'verified' },
    ];

    const result = await getComplianceStatus('campaign-1');
    expect(result.donationCompliance.totalDonors).toBe(1);
  });
});
