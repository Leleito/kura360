/**
 * Safaricom Daraja API client for M-Pesa integration.
 *
 * Supports:
 * - OAuth token generation
 * - C2B URL registration (for paybill/till callbacks)
 * - STK Push (Lipa Na M-Pesa Online)
 * - Transaction status queries
 *
 * Environment variables required:
 *   MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, MPESA_SHORTCODE
 *   MPESA_ENV ("sandbox" | "production")  — defaults to "sandbox"
 *   NEXT_PUBLIC_APP_URL — base URL for callback endpoints
 */

// ── Configuration ──────────────────────────────────────────────────────────

const MPESA_ENV = process.env.MPESA_ENV ?? 'sandbox';

const BASE_URL =
  MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY ?? '';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET ?? '';
const PASSKEY = process.env.MPESA_PASSKEY ?? '';
const SHORTCODE = process.env.MPESA_SHORTCODE ?? '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// ── Types ──────────────────────────────────────────────────────────────────

export interface MpesaTokenResponse {
  access_token: string;
  expires_in: string;
}

export interface C2BValidationPayload {
  TransactionType: string;
  TransID: string;
  TransTime: string;
  TransAmount: string;
  BusinessShortCode: string;
  BillRefNumber: string;
  InvoiceNumber: string;
  OrgAccountBalance: string;
  ThirdPartyTransID: string;
  MSISDN: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
}

export interface STKPushRequest {
  phone: string; // Format: 254XXXXXXXXX
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface STKCallbackPayload {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value?: string | number;
        }>;
      };
    };
  };
}

// ── Token Cache ────────────────────────────────────────────────────────────

let tokenCache: { token: string; expiresAt: number } | null = null;

/**
 * Get OAuth access token from Daraja API.
 * Tokens are cached in memory until expiry.
 */
export async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error('M-Pesa credentials not configured. Set MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET.');
  }

  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!res.ok) {
    throw new Error(`M-Pesa OAuth failed: ${res.status} ${await res.text()}`);
  }

  const data: MpesaTokenResponse = await res.json();
  const expiresInMs = parseInt(data.expires_in, 10) * 1000;

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + expiresInMs - 60_000, // Refresh 1 min early
  };

  return data.access_token;
}

// ── C2B Registration ───────────────────────────────────────────────────────

/**
 * Register C2B validation and confirmation URLs with Safaricom.
 * Call this once during setup (e.g., from a setup script or admin action).
 */
export async function registerC2BUrls(): Promise<{ success: boolean; message: string }> {
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/mpesa/c2b/v1/registerurl`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ShortCode: SHORTCODE,
      ResponseType: 'Completed', // or "Cancelled" to reject by default
      ConfirmationURL: `${APP_URL}/api/mpesa/c2b`,
      ValidationURL: `${APP_URL}/api/mpesa/c2b`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { success: false, message: `C2B registration failed: ${res.status} ${body}` };
  }

  return { success: true, message: 'C2B URLs registered successfully' };
}

// ── STK Push ───────────────────────────────────────────────────────────────

/**
 * Initiate an STK Push (Lipa Na M-Pesa Online) to the donor's phone.
 * The donor receives a payment prompt on their phone.
 */
export async function initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
  const token = await getAccessToken();
  const timestamp = formatTimestamp(new Date());
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

  // Normalize phone: ensure 254 prefix
  const phone = normalizePhone(request.phone);

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(request.amount),
      PartyA: phone,
      PartyB: SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: `${APP_URL}/api/mpesa/stkpush/callback`,
      AccountReference: request.accountReference,
      TransactionDesc: request.transactionDesc,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`STK Push failed: ${res.status} ${body}`);
  }

  return res.json();
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Format date as YYYYMMDDHHmmss for Daraja API */
function formatTimestamp(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

/** Normalize Kenyan phone to 254XXXXXXXXX format */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s+\-()]/g, '');
  if (cleaned.startsWith('0')) return `254${cleaned.slice(1)}`;
  if (cleaned.startsWith('254')) return cleaned;
  if (cleaned.startsWith('+254')) return cleaned.slice(1);
  return `254${cleaned}`;
}

/**
 * Parse the STK callback metadata into a flat object.
 */
export function parseSTKCallback(callback: STKCallbackPayload): {
  success: boolean;
  resultCode: number;
  resultDesc: string;
  merchantRequestId: string;
  checkoutRequestId: string;
  amount?: number;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumber?: string;
} {
  const stk = callback.Body.stkCallback;
  const meta = stk.CallbackMetadata?.Item ?? [];

  const getValue = (name: string) => meta.find((m) => m.Name === name)?.Value;

  return {
    success: stk.ResultCode === 0,
    resultCode: stk.ResultCode,
    resultDesc: stk.ResultDesc,
    merchantRequestId: stk.MerchantRequestID,
    checkoutRequestId: stk.CheckoutRequestID,
    amount: getValue('Amount') as number | undefined,
    mpesaReceiptNumber: getValue('MpesaReceiptNumber') as string | undefined,
    transactionDate: getValue('TransactionDate')?.toString(),
    phoneNumber: getValue('PhoneNumber')?.toString(),
  };
}
