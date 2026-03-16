import { describe, it, expect } from 'vitest';
import { normalizePhone, parseSTKCallback, type STKCallbackPayload } from '@/lib/mpesa/daraja';

/* -------------------------------------------------------------------------- */
/*  Phone normalization                                                        */
/* -------------------------------------------------------------------------- */

describe('normalizePhone', () => {
  it('converts 07XX to 2547XX', () => {
    expect(normalizePhone('0712345678')).toBe('254712345678');
  });

  it('keeps 254XXXXXXXXX as-is', () => {
    expect(normalizePhone('254712345678')).toBe('254712345678');
  });

  it('strips + prefix from +254', () => {
    expect(normalizePhone('+254712345678')).toBe('254712345678');
  });

  it('strips spaces and dashes', () => {
    expect(normalizePhone('+254 712-345 678')).toBe('254712345678');
  });

  it('handles 01XX format (Safaricom)', () => {
    expect(normalizePhone('0112345678')).toBe('254112345678');
  });
});

/* -------------------------------------------------------------------------- */
/*  STK Callback parsing                                                       */
/* -------------------------------------------------------------------------- */

describe('parseSTKCallback', () => {
  it('parses a successful callback', () => {
    const payload: STKCallbackPayload = {
      Body: {
        stkCallback: {
          MerchantRequestID: 'MERCH-001',
          CheckoutRequestID: 'CHECK-001',
          ResultCode: 0,
          ResultDesc: 'The service request is processed successfully.',
          CallbackMetadata: {
            Item: [
              { Name: 'Amount', Value: 5000 },
              { Name: 'MpesaReceiptNumber', Value: 'QJH7T2KXMR' },
              { Name: 'TransactionDate', Value: '20260316120000' },
              { Name: 'PhoneNumber', Value: '254712345678' },
            ],
          },
        },
      },
    };

    const result = parseSTKCallback(payload);
    expect(result.success).toBe(true);
    expect(result.amount).toBe(5000);
    expect(result.mpesaReceiptNumber).toBe('QJH7T2KXMR');
    expect(result.phoneNumber).toBe('254712345678');
    expect(result.merchantRequestId).toBe('MERCH-001');
  });

  it('parses a failed/cancelled callback', () => {
    const payload: STKCallbackPayload = {
      Body: {
        stkCallback: {
          MerchantRequestID: 'MERCH-002',
          CheckoutRequestID: 'CHECK-002',
          ResultCode: 1032,
          ResultDesc: 'Request cancelled by user.',
        },
      },
    };

    const result = parseSTKCallback(payload);
    expect(result.success).toBe(false);
    expect(result.resultCode).toBe(1032);
    expect(result.amount).toBeUndefined();
    expect(result.mpesaReceiptNumber).toBeUndefined();
  });
});
