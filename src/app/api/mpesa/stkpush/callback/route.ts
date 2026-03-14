/**
 * STK Push Callback — receives payment result from Safaricom
 * after donor confirms (or rejects) the payment prompt.
 *
 * On success: creates a donation record automatically.
 * On failure: logs the failed attempt.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseSTKCallback, type STKCallbackPayload } from '@/lib/mpesa/daraja';

export async function POST(request: NextRequest) {
  try {
    const payload: STKCallbackPayload = await request.json();
    const result = parseSTKCallback(payload);

    console.log(
      `[STK Callback] ${result.success ? 'SUCCESS' : 'FAILED'}: ${result.mpesaReceiptNumber ?? result.checkoutRequestId} — ${result.resultDesc}`
    );

    if (!result.success) {
      // Payment was cancelled or failed — just acknowledge
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Acknowledged' });
    }

    const { amount, mpesaReceiptNumber, phoneNumber } = result;

    if (!amount || !mpesaReceiptNumber || !phoneNumber) {
      console.error('[STK Callback] Missing metadata in successful callback');
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Acknowledged' });
    }

    const supabase = await createClient();

    // Find active campaign
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id, spending_limit_kes')
      .limit(1)
      .single();

    if (!campaign) {
      console.error('[STK Callback] No active campaign');
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Acknowledged' });
    }

    // Duplicate check
    const { data: existing } = await supabase
      .from('donations')
      .select('id')
      .eq('mpesa_ref', mpesaReceiptNumber)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Acknowledged' });
    }

    // Look up existing donor by phone
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    const { data: existingDonor } = await supabase
      .from('donations')
      .select('donor_name, kyc_status')
      .eq('donor_phone', formattedPhone)
      .eq('campaign_id', campaign.id)
      .order('donated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const kycStatus = existingDonor?.kyc_status === 'verified' ? 'verified' : 'pending';

    // Insert donation
    const { error } = await supabase.from('donations').insert({
      campaign_id: campaign.id,
      donor_name: existingDonor?.donor_name ?? 'M-Pesa Donor',
      donor_phone: formattedPhone,
      amount_kes: amount,
      mpesa_ref: mpesaReceiptNumber,
      is_anonymous: false,
      kyc_status: kycStatus,
      compliance_status: amount > 500_000 ? 'violation' : 'compliant',
      flagged_reason: amount > 500_000 ? 'Exceeds ECFA individual limit' : null,
      donated_at: new Date().toISOString(),
      source: 'stk_push',
    });

    if (error) {
      console.error('[STK Callback] Insert error:', error.message);
    } else {
      console.log(`[STK Callback] Donation recorded: KES ${amount} from ${formattedPhone}`);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Acknowledged' });
  } catch (err) {
    console.error('[STK Callback] Error:', err);
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Acknowledged' });
  }
}
