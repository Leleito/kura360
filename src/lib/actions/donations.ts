'use server';

import { createClient } from '@/lib/supabase/server';
import type { Json, Tables, TablesInsert } from '@/types/database';

type Donation = Tables<'donations'>;
type DonationInsert = TablesInsert<'donations'>;

export interface DonationFilters {
  search?: string;
  method?: string;
  kycStatus?: string;
  complianceStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface DonationResult {
  data: Donation[];
  count: number;
  error?: string;
}

export interface DonationStats {
  totalAmount: number;
  totalCount: number;
  byMethod: { method: string; amount: number; count: number }[];
  anonymousTotal: number;
  anonymousCount: number;
  flaggedCount: number;
  averageDonation: number;
  error?: string;
}

/** Fetch paginated & filtered donations */
export async function getDonations(
  campaignId: string,
  filters: DonationFilters = {}
): Promise<DonationResult> {
  try {
    const supabase = await createClient();
    const {
      search,
      method,
      kycStatus,
      complianceStatus,
      dateFrom,
      dateTo,
      page = 1,
      pageSize = 25,
    } = filters;

    let query = supabase
      .from('donations')
      .select('*', { count: 'exact' })
      .eq('campaign_id', campaignId);

    if (search) {
      query = query.or(
        `donor_name.ilike.%${search}%,donor_phone.ilike.%${search}%,mpesa_ref.ilike.%${search}%`
      );
    }
    if (method) {
      // Method is not a direct column; we'll filter via mpesa_ref presence for M-Pesa
      // For now, skip this filter as the schema doesn't have a method column
    }
    if (kycStatus) query = query.eq('kyc_status', kycStatus);
    if (complianceStatus) query = query.eq('compliance_status', complianceStatus);
    if (dateFrom) query = query.gte('donated_at', dateFrom);
    if (dateTo) query = query.lte('donated_at', dateTo);

    // Suppress unused variable warnings
    void method;

    query = query.order('donated_at', { ascending: false });

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) return { data: [], count: 0, error: error.message };
    return { data: data ?? [], count: count ?? 0 };
  } catch (err) {
    return { data: [], count: 0, error: String(err) };
  }
}

/** Create a new donation */
export async function createDonation(
  input: Omit<DonationInsert, 'id' | 'created_at'>,
  userId: string
): Promise<{ data: Donation | null; error?: string }> {
  try {
    const supabase = await createClient();

    // ECFA compliance checks
    if (input.is_anonymous && input.amount_kes > 5_000) {
      return {
        data: null,
        error: 'ECFA Violation: Anonymous donations exceeding KES 5,000 are illegal.',
      };
    }

    if (input.amount_kes > 500_000) {
      return {
        data: null,
        error: 'ECFA Violation: Individual donations cannot exceed KES 500,000 per election cycle.',
      };
    }

    // Check single-source 20% cap
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('spending_limit_kes')
      .eq('id', input.campaign_id)
      .single();

    const spendingLimit = campaign?.spending_limit_kes ?? 35_000_000;
    const twentyPercentCap = spendingLimit * 0.2;

    if (!input.is_anonymous && input.donor_phone) {
      const { data: existingDonations } = await supabase
        .from('donations')
        .select('amount_kes')
        .eq('campaign_id', input.campaign_id)
        .eq('donor_phone', input.donor_phone);

      const existingTotal = (existingDonations ?? []).reduce(
        (sum, d) => sum + d.amount_kes,
        0
      );

      if (existingTotal + input.amount_kes > twentyPercentCap) {
        // Flag but don't block
        input.compliance_status = 'flagged';
        input.flagged_reason = `Single-source cap: donor total would be KES ${(existingTotal + input.amount_kes).toLocaleString()} (20% cap: KES ${twentyPercentCap.toLocaleString()})`;
      }
    }

    const { data, error } = await supabase
      .from('donations')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    await supabase.from('audit_log').insert({
      campaign_id: input.campaign_id,
      user_id: userId,
      action: 'INSERT',
      table_name: 'donations',
      record_id: data.id,
      new_values: data as unknown as Json,
    });

    return { data };
  } catch (err) {
    return { data: null, error: String(err) };
  }
}

/** Get donation stats for a campaign */
export async function getDonationStats(
  campaignId: string
): Promise<DonationStats> {
  try {
    const supabase = await createClient();

    const { data } = await supabase
      .from('donations')
      .select('*')
      .eq('campaign_id', campaignId);

    const all = data ?? [];
    const totalAmount = all.reduce((sum, d) => sum + d.amount_kes, 0);
    const totalCount = all.length;
    const anonymousDonations = all.filter((d) => d.is_anonymous);
    const anonymousTotal = anonymousDonations.reduce(
      (sum, d) => sum + d.amount_kes,
      0
    );
    const flaggedCount = all.filter(
      (d) => d.compliance_status === 'flagged' || d.compliance_status === 'violation'
    ).length;

    // Group by method (infer from mpesa_ref)
    const mpesa = all.filter((d) => d.mpesa_ref);
    const nonMpesa = all.filter((d) => !d.mpesa_ref);

    const byMethod = [
      {
        method: 'M-Pesa',
        amount: mpesa.reduce((sum, d) => sum + d.amount_kes, 0),
        count: mpesa.length,
      },
      {
        method: 'Other',
        amount: nonMpesa.reduce((sum, d) => sum + d.amount_kes, 0),
        count: nonMpesa.length,
      },
    ].filter((m) => m.count > 0);

    return {
      totalAmount,
      totalCount,
      byMethod,
      anonymousTotal,
      anonymousCount: anonymousDonations.length,
      flaggedCount,
      averageDonation: totalCount > 0 ? totalAmount / totalCount : 0,
    };
  } catch (err) {
    return {
      totalAmount: 0,
      totalCount: 0,
      byMethod: [],
      anonymousTotal: 0,
      anonymousCount: 0,
      flaggedCount: 0,
      averageDonation: 0,
      error: String(err),
    };
  }
}
