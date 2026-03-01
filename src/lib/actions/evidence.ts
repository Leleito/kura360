'use server';

import { createClient } from '@/lib/supabase/server';
import type { Json, Tables, TablesInsert } from '@/types/database';

type EvidenceItem = Tables<'evidence_items'>;
type EvidenceInsert = TablesInsert<'evidence_items'>;

export interface EvidenceFilters {
  search?: string;
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface EvidenceResult {
  data: EvidenceItem[];
  count: number;
  error?: string;
}

/** Fetch paginated & filtered evidence items */
export async function getEvidenceItems(
  campaignId: string,
  filters: EvidenceFilters = {}
): Promise<EvidenceResult> {
  try {
    const supabase = await createClient();
    const {
      search,
      type,
      status,
      dateFrom,
      dateTo,
      page = 1,
      pageSize = 25,
    } = filters;

    let query = supabase
      .from('evidence_items')
      .select('*', { count: 'exact' })
      .eq('campaign_id', campaignId);

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }
    if (type) query = query.eq('type', type);
    if (status) query = query.eq('verification_status', status);
    if (dateFrom) query = query.gte('captured_at', dateFrom);
    if (dateTo) query = query.lte('captured_at', dateTo);

    query = query.order('captured_at', { ascending: false });

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

/** Get a single evidence item by ID */
export async function getEvidenceById(
  id: string
): Promise<{ data: EvidenceItem | null; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('evidence_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return { data: null, error: error.message };
    return { data };
  } catch (err) {
    return { data: null, error: String(err) };
  }
}

/** Create a new evidence item */
export async function createEvidenceItem(
  input: Omit<EvidenceInsert, 'id' | 'created_at'>,
  userId: string
): Promise<{ data: EvidenceItem | null; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('evidence_items')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    await supabase.from('audit_log').insert({
      campaign_id: input.campaign_id,
      user_id: userId,
      action: 'INSERT',
      table_name: 'evidence_items',
      record_id: data.id,
      new_values: data as unknown as Json,
    });

    return { data };
  } catch (err) {
    return { data: null, error: String(err) };
  }
}

/** Update an evidence item */
export async function updateEvidenceItem(
  id: string,
  campaignId: string,
  userId: string,
  updates: Partial<EvidenceInsert>
): Promise<{ data: EvidenceItem | null; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: oldData } = await supabase
      .from('evidence_items')
      .select('*')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('evidence_items')
      .update(updates)
      .eq('id', id)
      .eq('campaign_id', campaignId)
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    await supabase.from('audit_log').insert({
      campaign_id: campaignId,
      user_id: userId,
      action: 'UPDATE',
      table_name: 'evidence_items',
      record_id: id,
      old_values: oldData as unknown as Json,
      new_values: data as unknown as Json,
    });

    return { data };
  } catch (err) {
    return { data: null, error: String(err) };
  }
}

/** Get evidence stats for a campaign */
export async function getEvidenceStats(campaignId: string) {
  try {
    const supabase = await createClient();

    const { data } = await supabase
      .from('evidence_items')
      .select('type, verification_status')
      .eq('campaign_id', campaignId);

    const all = data ?? [];
    const total = all.length;
    const verified = all.filter((e) => e.verification_status === 'verified').length;
    const pending = all.filter((e) => e.verification_status === 'pending').length;
    const flagged = all.filter((e) => e.verification_status === 'flagged').length;

    const byType = {
      photo: all.filter((e) => e.type === 'photo').length,
      video: all.filter((e) => e.type === 'video').length,
      document: all.filter((e) => e.type === 'document').length,
      audio: all.filter((e) => e.type === 'audio').length,
    };

    return { total, verified, pending, flagged, byType };
  } catch (err) {
    return {
      total: 0,
      verified: 0,
      pending: 0,
      flagged: 0,
      byType: { photo: 0, video: 0, document: 0, audio: 0 },
      error: String(err),
    };
  }
}
