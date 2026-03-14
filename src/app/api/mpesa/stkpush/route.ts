/**
 * STK Push API endpoint (Option C)
 *
 * Campaign staff initiates a payment prompt on the donor's phone.
 * The donor enters their M-Pesa PIN to confirm.
 * Result comes via the callback endpoint.
 *
 * POST /api/mpesa/stkpush
 * Body: { phone, amount, campaignId, donorName? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { initiateSTKPush } from '@/lib/mpesa/daraja';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, amount, campaignId, donorName } = body;

    if (!phone || !amount || !campaignId) {
      return NextResponse.json(
        { error: 'Missing required fields: phone, amount, campaignId' },
        { status: 400 }
      );
    }

    if (amount <= 0 || amount > 500_000) {
      return NextResponse.json(
        { error: 'Amount must be between KES 1 and KES 500,000' },
        { status: 400 }
      );
    }

    const result = await initiateSTKPush({
      phone,
      amount,
      accountReference: `KURA360-${campaignId.slice(0, 8)}`,
      transactionDesc: `Campaign donation${donorName ? ` from ${donorName}` : ''}`,
    });

    if (result.ResponseCode !== '0') {
      return NextResponse.json(
        { error: result.ResponseDescription ?? 'STK Push failed' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutRequestId: result.CheckoutRequestID,
      merchantRequestId: result.MerchantRequestID,
      message: result.CustomerMessage,
    });
  } catch (err) {
    console.error('[STK Push] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'STK Push failed' },
      { status: 500 }
    );
  }
}
