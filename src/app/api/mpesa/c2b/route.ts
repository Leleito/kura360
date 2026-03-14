/**
 * M-Pesa C2B (Customer to Business) Callback Endpoint
 *
 * Option A: Auto-records donations when someone sends money to
 * the campaign's Paybill/Till number via M-Pesa.
 *
 * Safaricom sends a POST with transaction details including:
 * - MSISDN (phone number)
 * - TransAmount
 * - TransID (M-Pesa receipt)
 * - FirstName, MiddleName, LastName
 *
 * The endpoint:
 * 1. Validates the payload
 * 2. Creates a donation record in Supabase
 * 3. Attempts to match the phone to an existing donor for KYC
 * 4. Runs ECFA compliance checks
 * 5. Returns acknowledgment to Safaricom
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { C2BValidationPayload } from '@/lib/mpesa/daraja';
import { normalizePhone } from '@/lib/mpesa/daraja';

// Safaricom requires a specific response format
const ACCEPT = { ResultCode: 0, ResultDesc: 'Accepted' };
const REJECT = { ResultCode: 1, ResultDesc: 'Rejected' };

export async function POST(request: NextRequest) {
  try {
    const payload: C2BValidationPayload = await request.json();

    // Basic validation
    if (!payload.TransID || !payload.MSISDN || !payload.TransAmount) {
      console.error('[M-Pesa C2B] Invalid payload:', payload);
      return NextResponse.json(REJECT, { status: 200 }); // Safaricom expects 200
    }

    const amount = parseFloat(payload.TransAmount);
    const phone = normalizePhone(payload.MSISDN);
    const donorName = [payload.FirstName, payload.MiddleName, payload.LastName]
      .filter(Boolean)
      .join(' ')
      .trim() || 'M-Pesa Donor';

    console.log(
      `[M-Pesa C2B] Received: ${payload.TransID} — KES ${amount} from ${phone} (${donorName})`
    );

    const supabase = await createClient();

    // Find the active campaign (for now, use the first active campaign)
    // In production, BillRefNumber could encode the campaign ID
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id, spending_limit_kes')
      .limit(1)
      .single();

    if (!campaign) {
      console.error('[M-Pesa C2B] No active campaign found');
      return NextResponse.json(ACCEPT, { status: 200 });
    }

    // Check for duplicate transaction
    const { data: existing } = await supabase
      .from('donations')
      .select('id')
      .eq('mpesa_ref', payload.TransID)
      .maybeSingle();

    if (existing) {
      console.warn(`[M-Pesa C2B] Duplicate transaction: ${payload.TransID}`);
      return NextResponse.json(ACCEPT, { status: 200 });
    }

    // Try to match phone to existing donor for KYC auto-fill
    const { data: existingDonor } = await supabase
      .from('donations')
      .select('donor_name, donor_phone, kyc_status')
      .eq('donor_phone', `+${phone}`)
      .eq('campaign_id', campaign.id)
      .order('donated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Determine KYC status
    const kycStatus = existingDonor?.kyc_status === 'verified' ? 'verified' : 'pending';

    // ECFA compliance checks
    let complianceStatus: 'compliant' | 'flagged' | 'violation' = 'compliant';
    let flaggedReason: string | null = null;

    // Check anonymous threshold (C2B donations have a phone, so not truly anonymous)
    // But if we can't verify identity, flag it
    if (kycStatus !== 'verified' && amount > 5_000) {
      complianceStatus = 'flagged';
      flaggedReason = 'KYC pending — donor identity not yet verified for donation over KES 5,000';
    }

    // Individual limit check
    if (amount > 500_000) {
      complianceStatus = 'violation';
      flaggedReason = `ECFA violation: Single donation of KES ${amount.toLocaleString()} exceeds KES 500,000 individual limit`;
    }

    // Single-source 20% cap check
    const spendingLimit = campaign.spending_limit_kes ?? 35_000_000;
    const twentyPercentCap = spendingLimit * 0.2;

    const { data: priorDonations } = await supabase
      .from('donations')
      .select('amount_kes')
      .eq('campaign_id', campaign.id)
      .eq('donor_phone', `+${phone}`);

    const priorTotal = (priorDonations ?? []).reduce((sum, d) => sum + d.amount_kes, 0);
    if (priorTotal + amount > twentyPercentCap && complianceStatus === 'compliant') {
      complianceStatus = 'flagged';
      flaggedReason = `Single-source 20% cap: cumulative total KES ${(priorTotal + amount).toLocaleString()} exceeds cap of KES ${twentyPercentCap.toLocaleString()}`;
    }

    // Insert donation
    const { data: donation, error } = await supabase
      .from('donations')
      .insert({
        campaign_id: campaign.id,
        donor_name: existingDonor?.donor_name ?? donorName,
        donor_phone: `+${phone}`,
        amount_kes: amount,
        mpesa_ref: payload.TransID,
        is_anonymous: false,
        kyc_status: kycStatus,
        compliance_status: complianceStatus,
        flagged_reason: flaggedReason,
        donated_at: parseTransTime(payload.TransTime),
        source: 'mpesa_c2b',
      })
      .select()
      .single();

    if (error) {
      console.error('[M-Pesa C2B] Insert error:', error.message);
      return NextResponse.json(ACCEPT, { status: 200 }); // Still accept to Safaricom
    }

    // Audit log
    await supabase.from('audit_log').insert({
      campaign_id: campaign.id,
      user_id: 'system-mpesa-c2b',
      action: 'INSERT',
      table_name: 'donations',
      record_id: donation.id,
      new_values: {
        source: 'mpesa_c2b',
        trans_id: payload.TransID,
        amount,
        phone,
        donor_name: donorName,
        compliance_status: complianceStatus,
      },
    });

    console.log(
      `[M-Pesa C2B] Donation recorded: ${donation.id} — KES ${amount} from ${donorName} (${complianceStatus})`
    );

    return NextResponse.json(ACCEPT, { status: 200 });
  } catch (err) {
    console.error('[M-Pesa C2B] Error:', err);
    // Always return 200 to Safaricom to acknowledge receipt
    return NextResponse.json(ACCEPT, { status: 200 });
  }
}

/** Parse Safaricom TransTime (YYYYMMDDHHmmss) to ISO string */
function parseTransTime(transTime: string): string {
  if (!transTime || transTime.length < 14) return new Date().toISOString();
  const year = transTime.slice(0, 4);
  const month = transTime.slice(4, 6);
  const day = transTime.slice(6, 8);
  const hour = transTime.slice(8, 10);
  const min = transTime.slice(10, 12);
  const sec = transTime.slice(12, 14);
  return new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}+03:00`).toISOString();
}
