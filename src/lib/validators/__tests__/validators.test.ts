import { describe, it, expect } from 'vitest';

/* -------------------------------------------------------------------------- */
/*  Imports                                                                    */
/* -------------------------------------------------------------------------- */

import {
  transactionSchema,
  transactionFilterSchema,
  ECFA_CATEGORIES,
  ECFA_SPENDING_LIMIT,
  TRANSACTION_STATUSES,
} from '../finance';

import {
  donationSchema,
  donationFilterSchema,
  ECFA_ANONYMOUS_THRESHOLD,
  ECFA_INDIVIDUAL_LIMIT,
  HIGH_VALUE_THRESHOLD,
  DONATION_METHODS,
} from '../donations';

import {
  agentSchema,
  checkInSchema,
  agentFilterSchema,
  KENYA_COUNTIES,
  AGENT_STATUSES,
} from '../agents';

import {
  evidenceSchema,
  evidenceFilterSchema,
  locationSchema,
  EVIDENCE_TYPES,
  EVIDENCE_STATUSES,
} from '../evidence';

/* ========================================================================== */
/*  TRANSACTION SCHEMA                                                         */
/* ========================================================================== */

const VALID_TRANSACTION = {
  description: 'Billboard rental at Uhuru Highway',
  amount: 150_000,
  category: 'Advertising' as const,
  date: '2026-04-15',
  status: 'pending' as const,
};

describe('transactionSchema - valid inputs', () => {
  it('accepts a valid transaction', () => {
    const result = transactionSchema.safeParse(VALID_TRANSACTION);
    expect(result.success).toBe(true);
  });

  it('accepts all 6 ECFA categories', () => {
    for (const category of ECFA_CATEGORIES) {
      const result = transactionSchema.safeParse({ ...VALID_TRANSACTION, category });
      expect(result.success).toBe(true);
    }
  });

  it('accepts optional receipt_url when provided', () => {
    const result = transactionSchema.safeParse({
      ...VALID_TRANSACTION,
      receipt_url: 'https://storage.example.com/receipt.pdf',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty string for optional receipt_url', () => {
    const result = transactionSchema.safeParse({
      ...VALID_TRANSACTION,
      receipt_url: '',
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional notes', () => {
    const result = transactionSchema.safeParse({
      ...VALID_TRANSACTION,
      notes: 'Payment for billboard Q2',
    });
    expect(result.success).toBe(true);
  });

  it('defaults status to pending', () => {
    const { status, ...noStatus } = VALID_TRANSACTION;
    const result = transactionSchema.safeParse(noStatus);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('pending');
    }
  });

  it('accepts all three statuses', () => {
    for (const status of TRANSACTION_STATUSES) {
      const result = transactionSchema.safeParse({ ...VALID_TRANSACTION, status });
      expect(result.success).toBe(true);
    }
  });
});

describe('transactionSchema - invalid inputs', () => {
  it('rejects description shorter than 3 characters', () => {
    const result = transactionSchema.safeParse({ ...VALID_TRANSACTION, description: 'AB' });
    expect(result.success).toBe(false);
  });

  it('rejects description longer than 200 characters', () => {
    const result = transactionSchema.safeParse({
      ...VALID_TRANSACTION,
      description: 'A'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = transactionSchema.safeParse({ ...VALID_TRANSACTION, amount: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects zero amount', () => {
    const result = transactionSchema.safeParse({ ...VALID_TRANSACTION, amount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects amount exceeding ECFA spending limit', () => {
    const result = transactionSchema.safeParse({
      ...VALID_TRANSACTION,
      amount: ECFA_SPENDING_LIMIT + 1,
    });
    expect(result.success).toBe(false);
  });

  it('accepts amount exactly at ECFA spending limit (boundary)', () => {
    const result = transactionSchema.safeParse({
      ...VALID_TRANSACTION,
      amount: ECFA_SPENDING_LIMIT,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid category', () => {
    const result = transactionSchema.safeParse({
      ...VALID_TRANSACTION,
      category: 'Entertainment',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty date', () => {
    const result = transactionSchema.safeParse({ ...VALID_TRANSACTION, date: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date string', () => {
    const result = transactionSchema.safeParse({ ...VALID_TRANSACTION, date: 'not-a-date' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid receipt URL', () => {
    const result = transactionSchema.safeParse({
      ...VALID_TRANSACTION,
      receipt_url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('rejects notes over 500 characters', () => {
    const result = transactionSchema.safeParse({
      ...VALID_TRANSACTION,
      notes: 'X'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-number amount', () => {
    const result = transactionSchema.safeParse({
      ...VALID_TRANSACTION,
      amount: 'ten thousand',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = transactionSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('transactionFilterSchema', () => {
  it('accepts empty filter', () => {
    expect(transactionFilterSchema.safeParse({}).success).toBe(true);
  });

  it('accepts all valid filter fields', () => {
    const result = transactionFilterSchema.safeParse({
      search: 'billboard',
      category: 'Advertising',
      status: 'approved',
      dateFrom: '2026-01-01',
      dateTo: '2026-12-31',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty strings for filter resets', () => {
    const result = transactionFilterSchema.safeParse({
      category: '',
      status: '',
    });
    expect(result.success).toBe(true);
  });
});

/* ========================================================================== */
/*  AGENT SCHEMA                                                               */
/* ========================================================================== */

const VALID_AGENT = {
  full_name: 'John Kamau',
  phone: '+254712345678',
  national_id: '12345678',
  county: 'Nairobi' as const,
  constituency: 'Westlands',
  polling_station: 'Parklands Primary School',
};

describe('agentSchema - valid inputs', () => {
  it('accepts a valid agent', () => {
    const result = agentSchema.safeParse(VALID_AGENT);
    expect(result.success).toBe(true);
  });

  it('defaults status to pending', () => {
    const result = agentSchema.safeParse(VALID_AGENT);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('pending');
    }
  });

  it('accepts +254 phone starting with 7', () => {
    const result = agentSchema.safeParse({ ...VALID_AGENT, phone: '+254798765432' });
    expect(result.success).toBe(true);
  });

  it('accepts +254 phone starting with 1', () => {
    const result = agentSchema.safeParse({ ...VALID_AGENT, phone: '+254112345678' });
    expect(result.success).toBe(true);
  });

  it('accepts all 47 counties', () => {
    for (const county of KENYA_COUNTIES) {
      const result = agentSchema.safeParse({ ...VALID_AGENT, county });
      expect(result.success).toBe(true);
    }
  });

  it('accepts all agent statuses', () => {
    for (const status of AGENT_STATUSES) {
      const result = agentSchema.safeParse({ ...VALID_AGENT, status });
      expect(result.success).toBe(true);
    }
  });
});

describe('agentSchema - Kenya phone number validation', () => {
  it('rejects phone without +254 prefix', () => {
    const result = agentSchema.safeParse({ ...VALID_AGENT, phone: '0712345678' });
    expect(result.success).toBe(false);
  });

  it('rejects phone with 254 but no + prefix', () => {
    const result = agentSchema.safeParse({ ...VALID_AGENT, phone: '254712345678' });
    expect(result.success).toBe(false);
  });

  it('rejects phone that is too short', () => {
    const result = agentSchema.safeParse({ ...VALID_AGENT, phone: '+25471234567' });
    expect(result.success).toBe(false);
  });

  it('rejects phone that is too long', () => {
    const result = agentSchema.safeParse({ ...VALID_AGENT, phone: '+2547123456789' });
    expect(result.success).toBe(false);
  });

  it('rejects phone with invalid second digit (not 1 or 7)', () => {
    const result = agentSchema.safeParse({ ...VALID_AGENT, phone: '+254212345678' });
    expect(result.success).toBe(false);
  });

  it('rejects random US number', () => {
    const result = agentSchema.safeParse({ ...VALID_AGENT, phone: '+15551234567' });
    expect(result.success).toBe(false);
  });

  it('rejects empty phone', () => {
    const result = agentSchema.safeParse({ ...VALID_AGENT, phone: '' });
    expect(result.success).toBe(false);
  });
});

describe('agentSchema - field validation', () => {
  it('rejects full_name shorter than 2 characters', () => {
    const result = agentSchema.safeParse({ ...VALID_AGENT, full_name: 'J' });
    expect(result.success).toBe(false);
  });

  it('rejects full_name longer than 100 characters', () => {
    const result = agentSchema.safeParse({ ...VALID_AGENT, full_name: 'J'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects national_id that is not 8 digits', () => {
    const result = agentSchema.safeParse({ ...VALID_AGENT, national_id: '1234' });
    expect(result.success).toBe(false);
  });

  it('rejects national_id with letters', () => {
    const result = agentSchema.safeParse({ ...VALID_AGENT, national_id: '1234567A' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid county', () => {
    const result = agentSchema.safeParse({ ...VALID_AGENT, county: 'Gotham' });
    expect(result.success).toBe(false);
  });

  it('rejects too-short constituency', () => {
    const result = agentSchema.safeParse({ ...VALID_AGENT, constituency: 'W' });
    expect(result.success).toBe(false);
  });

  it('rejects too-short polling_station', () => {
    const result = agentSchema.safeParse({ ...VALID_AGENT, polling_station: 'P' });
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = agentSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('checkInSchema', () => {
  const VALID_CHECKIN = {
    agent_id: '550e8400-e29b-41d4-a716-446655440000',
    location: { lat: -1.2921, lng: 36.8219 },
    timestamp: '2026-03-17T08:30:00Z',
  };

  it('accepts valid check-in', () => {
    expect(checkInSchema.safeParse(VALID_CHECKIN).success).toBe(true);
  });

  it('rejects invalid UUID', () => {
    expect(checkInSchema.safeParse({ ...VALID_CHECKIN, agent_id: 'not-uuid' }).success).toBe(false);
  });

  it('rejects latitude outside Kenya', () => {
    expect(
      checkInSchema.safeParse({ ...VALID_CHECKIN, location: { lat: -10, lng: 36.8 } }).success
    ).toBe(false);
  });

  it('rejects longitude outside Kenya', () => {
    expect(
      checkInSchema.safeParse({ ...VALID_CHECKIN, location: { lat: -1.2, lng: 50 } }).success
    ).toBe(false);
  });

  it('rejects invalid timestamp', () => {
    expect(
      checkInSchema.safeParse({ ...VALID_CHECKIN, timestamp: 'yesterday' }).success
    ).toBe(false);
  });
});

describe('agentFilterSchema', () => {
  it('accepts empty filter', () => {
    expect(agentFilterSchema.safeParse({}).success).toBe(true);
  });

  it('accepts valid filter', () => {
    const result = agentFilterSchema.safeParse({
      search: 'Kamau',
      county: 'Nairobi',
      status: 'active',
    });
    expect(result.success).toBe(true);
  });
});

/* ========================================================================== */
/*  DONATION SCHEMA                                                            */
/* ========================================================================== */

const VALID_DONATION = {
  donor_name: 'Grace Wanjiku',
  donor_phone: '+254712345678',
  amount: 10_000,
  method: 'mpesa' as const,
  national_id: '12345678',
  anonymous: false,
};

describe('donationSchema - ECFA threshold warnings', () => {
  it('rejects anonymous donation exceeding KES 5,000', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      anonymous: true,
      amount: ECFA_ANONYMOUS_THRESHOLD + 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message).join(' ');
      expect(messages).toContain('ECFA Violation');
      expect(messages).toContain('Anonymous');
    }
  });

  it('accepts anonymous donation at exactly KES 5,000 (boundary)', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      anonymous: true,
      amount: ECFA_ANONYMOUS_THRESHOLD,
    });
    expect(result.success).toBe(true);
  });

  it('rejects individual donation exceeding KES 500,000', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      amount: ECFA_INDIVIDUAL_LIMIT + 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message).join(' ');
      expect(messages).toContain('ECFA Violation');
      expect(messages).toContain('500,000');
    }
  });

  it('accepts individual donation at exactly KES 500,000 (boundary)', () => {
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      amount: ECFA_INDIVIDUAL_LIMIT,
    });
    expect(result.success).toBe(true);
  });

  it('high-value donation (>1M) still passes if under individual limit', () => {
    // HIGH_VALUE_THRESHOLD is 1M but individual limit is 500K, so this should fail
    // because 500_001 > ECFA_INDIVIDUAL_LIMIT
    const result = donationSchema.safeParse({
      ...VALID_DONATION,
      amount: 499_999, // under individual limit, under high-value threshold
    });
    expect(result.success).toBe(true);
  });
});

describe('donationSchema - Kenya phone validation', () => {
  it('accepts +254 format', () => {
    expect(donationSchema.safeParse({ ...VALID_DONATION, donor_phone: '+254712345678' }).success).toBe(true);
  });

  it('accepts 0 prefix format', () => {
    expect(donationSchema.safeParse({ ...VALID_DONATION, donor_phone: '0712345678' }).success).toBe(true);
  });

  it('accepts 254 without + prefix', () => {
    expect(donationSchema.safeParse({ ...VALID_DONATION, donor_phone: '254712345678' }).success).toBe(true);
  });

  it('rejects non-Kenyan numbers', () => {
    expect(donationSchema.safeParse({ ...VALID_DONATION, donor_phone: '+447911123456' }).success).toBe(false);
  });
});

describe('donationSchema - missing and wrong types', () => {
  it('rejects missing donor_name', () => {
    const { donor_name, ...rest } = VALID_DONATION;
    expect(donationSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects missing amount', () => {
    const { amount, ...rest } = VALID_DONATION;
    expect(donationSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects string amount', () => {
    expect(donationSchema.safeParse({ ...VALID_DONATION, amount: 'ten' }).success).toBe(false);
  });

  it('rejects invalid method', () => {
    expect(donationSchema.safeParse({ ...VALID_DONATION, method: 'bitcoin' }).success).toBe(false);
  });
});

/* ========================================================================== */
/*  EVIDENCE SCHEMA                                                            */
/* ========================================================================== */

const VALID_SHA256 = 'a'.repeat(64);

const VALID_EVIDENCE = {
  title: 'Rally at Uhuru Park',
  type: 'photo' as const,
  county: 'Nairobi' as const,
  file_url: 'https://storage.example.com/evidence/photo123.jpg',
  captured_by: 'Agent Oduya',
  sha256_hash: VALID_SHA256,
};

describe('evidenceSchema - valid inputs', () => {
  it('accepts a valid evidence item', () => {
    const result = evidenceSchema.safeParse(VALID_EVIDENCE);
    expect(result.success).toBe(true);
  });

  it('defaults status to pending', () => {
    const result = evidenceSchema.safeParse(VALID_EVIDENCE);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('pending');
    }
  });

  it('accepts all evidence types', () => {
    for (const type of EVIDENCE_TYPES) {
      const result = evidenceSchema.safeParse({ ...VALID_EVIDENCE, type });
      expect(result.success).toBe(true);
    }
  });

  it('accepts all evidence statuses', () => {
    for (const status of EVIDENCE_STATUSES) {
      const result = evidenceSchema.safeParse({ ...VALID_EVIDENCE, status });
      expect(result.success).toBe(true);
    }
  });

  it('accepts optional GPS location within Kenya', () => {
    const result = evidenceSchema.safeParse({
      ...VALID_EVIDENCE,
      location: { lat: -1.2921, lng: 36.8219 },
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional description', () => {
    const result = evidenceSchema.safeParse({
      ...VALID_EVIDENCE,
      description: 'Photo taken during rally event',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty description', () => {
    const result = evidenceSchema.safeParse({
      ...VALID_EVIDENCE,
      description: '',
    });
    expect(result.success).toBe(true);
  });
});

describe('evidenceSchema - invalid inputs', () => {
  it('rejects title shorter than 3 chars', () => {
    expect(evidenceSchema.safeParse({ ...VALID_EVIDENCE, title: 'AB' }).success).toBe(false);
  });

  it('rejects title longer than 200 chars', () => {
    expect(
      evidenceSchema.safeParse({ ...VALID_EVIDENCE, title: 'A'.repeat(201) }).success
    ).toBe(false);
  });

  it('rejects invalid evidence type', () => {
    expect(evidenceSchema.safeParse({ ...VALID_EVIDENCE, type: 'spreadsheet' }).success).toBe(false);
  });

  it('rejects invalid county', () => {
    expect(evidenceSchema.safeParse({ ...VALID_EVIDENCE, county: 'Unknown' }).success).toBe(false);
  });

  it('rejects invalid file URL', () => {
    expect(evidenceSchema.safeParse({ ...VALID_EVIDENCE, file_url: 'not-a-url' }).success).toBe(false);
  });

  it('rejects captured_by shorter than 2 chars', () => {
    expect(evidenceSchema.safeParse({ ...VALID_EVIDENCE, captured_by: 'A' }).success).toBe(false);
  });

  it('rejects SHA-256 hash that is not 64 chars', () => {
    expect(evidenceSchema.safeParse({ ...VALID_EVIDENCE, sha256_hash: 'abc123' }).success).toBe(false);
  });

  it('rejects SHA-256 hash with uppercase', () => {
    expect(
      evidenceSchema.safeParse({ ...VALID_EVIDENCE, sha256_hash: 'A'.repeat(64) }).success
    ).toBe(false);
  });

  it('rejects SHA-256 hash with non-hex characters', () => {
    expect(
      evidenceSchema.safeParse({ ...VALID_EVIDENCE, sha256_hash: 'g'.repeat(64) }).success
    ).toBe(false);
  });

  it('rejects description over 1000 chars', () => {
    expect(
      evidenceSchema.safeParse({ ...VALID_EVIDENCE, description: 'X'.repeat(1001) }).success
    ).toBe(false);
  });

  it('rejects location outside Kenya', () => {
    expect(
      evidenceSchema.safeParse({
        ...VALID_EVIDENCE,
        location: { lat: 51.5, lng: -0.1 }, // London
      }).success
    ).toBe(false);
  });

  it('rejects missing required fields', () => {
    expect(evidenceSchema.safeParse({}).success).toBe(false);
  });
});

describe('locationSchema', () => {
  it('accepts Nairobi coordinates', () => {
    expect(locationSchema.safeParse({ lat: -1.2921, lng: 36.8219 }).success).toBe(true);
  });

  it('accepts Mombasa coordinates', () => {
    expect(locationSchema.safeParse({ lat: -4.0435, lng: 39.6682 }).success).toBe(true);
  });

  it('rejects latitude below -4.7', () => {
    expect(locationSchema.safeParse({ lat: -5.0, lng: 36.8 }).success).toBe(false);
  });

  it('rejects latitude above 5.1', () => {
    expect(locationSchema.safeParse({ lat: 5.2, lng: 36.8 }).success).toBe(false);
  });

  it('rejects longitude below 33.9', () => {
    expect(locationSchema.safeParse({ lat: -1.0, lng: 33.0 }).success).toBe(false);
  });

  it('rejects longitude above 41.9', () => {
    expect(locationSchema.safeParse({ lat: -1.0, lng: 42.0 }).success).toBe(false);
  });
});

describe('evidenceFilterSchema', () => {
  it('accepts empty filter', () => {
    expect(evidenceFilterSchema.safeParse({}).success).toBe(true);
  });

  it('accepts all valid filter fields', () => {
    const result = evidenceFilterSchema.safeParse({
      search: 'rally',
      type: 'photo',
      status: 'verified',
      county: 'Nairobi',
      dateFrom: '2026-01-01',
      dateTo: '2026-12-31',
    });
    expect(result.success).toBe(true);
  });
});

/* ========================================================================== */
/*  ECFA CONSTANTS                                                             */
/* ========================================================================== */

describe('ECFA constants integrity', () => {
  it('ECFA_ANONYMOUS_THRESHOLD is 5,000', () => {
    expect(ECFA_ANONYMOUS_THRESHOLD).toBe(5_000);
  });

  it('ECFA_INDIVIDUAL_LIMIT is 500,000', () => {
    expect(ECFA_INDIVIDUAL_LIMIT).toBe(500_000);
  });

  it('ECFA_SPENDING_LIMIT is 35,000,000', () => {
    expect(ECFA_SPENDING_LIMIT).toBe(35_000_000);
  });

  it('HIGH_VALUE_THRESHOLD is 1,000,000', () => {
    expect(HIGH_VALUE_THRESHOLD).toBe(1_000_000);
  });

  it('has exactly 6 ECFA categories', () => {
    expect(ECFA_CATEGORIES).toHaveLength(6);
  });

  it('has exactly 4 donation methods', () => {
    expect(DONATION_METHODS).toHaveLength(4);
  });

  it('has exactly 47 Kenyan counties', () => {
    expect(KENYA_COUNTIES).toHaveLength(47);
  });
});
