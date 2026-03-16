import { describe, it, expect } from 'vitest';
import {
  donationSchema,
  donationFilterSchema,
  ECFA_ANONYMOUS_THRESHOLD,
  ECFA_INDIVIDUAL_LIMIT,
  HIGH_VALUE_THRESHOLD,
  DONATION_METHODS,
  KYC_STATUSES,
  COMPLIANCE_STATUSES,
} from '@/lib/validators/donations';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

describe('ECFA constants', () => {
  it('anonymous threshold is 5,000 KES', () => {
    expect(ECFA_ANONYMOUS_THRESHOLD).toBe(5_000);
  });

  it('individual limit is 500,000 KES', () => {
    expect(ECFA_INDIVIDUAL_LIMIT).toBe(500_000);
  });

  it('high-value threshold is 1,000,000 KES', () => {
    expect(HIGH_VALUE_THRESHOLD).toBe(1_000_000);
  });

  it('has 4 donation methods', () => {
    expect(DONATION_METHODS).toEqual(['mpesa', 'bank', 'cash', 'cheque']);
  });

  it('has 3 KYC statuses', () => {
    expect(KYC_STATUSES).toEqual(['verified', 'pending', 'failed']);
  });

  it('has 3 compliance statuses', () => {
    expect(COMPLIANCE_STATUSES).toEqual(['compliant', 'flagged', 'violation']);
  });
});

/* -------------------------------------------------------------------------- */
/*  donationSchema — valid inputs                                              */
/* -------------------------------------------------------------------------- */

const VALID_DONATION = {
  donor_name: 'Grace Wanjiku',
  donor_phone: '+254712345678',
  amount: 10_000,
  method: 'mpesa' as const,
  national_id: '12345678',
  anonymous: false,
};

describe('donationSchema — valid inputs', () => {
  it('accepts a valid non-anonymous M-Pesa donation', () => {
    const result = donationSchema.safeParse(VALID_DONATION);
    expect(result.success).toBe(true);
  });

  it('accepts a valid bank transfer', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      method: 'bank',
      reference: 'REF12345',
    });
    expect(result.success).toBe(true);
  });

  it('accepts phone format 0712345678', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      donor_phone: '0712345678',
    });
    expect(result.success).toBe(true);
  });

  it('accepts phone format 254712345678', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      donor_phone: '254712345678',
    });
    expect(result.success).toBe(true);
  });

  it('accepts small anonymous donation under ECFA threshold', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      anonymous: true,
      amount: 4_999,
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional empty notes and reference', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      notes: '',
      reference: '',
    });
    expect(result.success).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  donationSchema — ECFA violations                                           */
/* -------------------------------------------------------------------------- */

describe('donationSchema — ECFA violations', () => {
  it('REJECTS anonymous donation over KES 5,000', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      anonymous: true,
      amount: 5_001,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.map((i) => i.message).join('; ');
      expect(msg).toContain('ECFA Violation');
      expect(msg).toContain('Anonymous');
    }
  });

  it('REJECTS individual donation over KES 500,000', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      amount: 500_001,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.map((i) => i.message).join('; ');
      expect(msg).toContain('ECFA Violation');
      expect(msg).toContain('500,000');
    }
  });

  it('ACCEPTS exactly KES 500,000 (boundary)', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      amount: 500_000,
    });
    expect(result.success).toBe(true);
  });

  it('ACCEPTS exactly KES 5,000 anonymous (boundary)', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      anonymous: true,
      amount: 5_000,
    });
    expect(result.success).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  donationSchema — field validation                                          */
/* -------------------------------------------------------------------------- */

describe('donationSchema — field validation', () => {
  it('rejects empty donor name', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      donor_name: 'A', // too short
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid phone format', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      donor_phone: '123456',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      amount: -100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero amount', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      amount: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid payment method', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      method: 'bitcoin',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid national ID (not 8 digits)', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      national_id: '1234',
    });
    expect(result.success).toBe(false);
  });

  it('rejects reference over 20 chars', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      reference: 'A'.repeat(21),
    });
    expect(result.success).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*  donationFilterSchema                                                       */
/* -------------------------------------------------------------------------- */

describe('donationFilterSchema', () => {
  it('accepts empty filter', () => {
    expect(donationFilterSchema.safeParse({}).success).toBe(true);
  });

  it('accepts valid filter with all fields', () => {
    const result = donationFilterSchema.safeParse({
      search: 'Grace',
      method: 'mpesa',
      kyc_status: 'verified',
      compliance: 'compliant',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty strings for filter resets', () => {
    const result = donationFilterSchema.safeParse({
      method: '',
      kyc_status: '',
      compliance: '',
    });
    expect(result.success).toBe(true);
  });
});
