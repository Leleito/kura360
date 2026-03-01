'use server';

import { createClient } from '@/lib/supabase/server';
import type { Json, Tables, TablesInsert } from '@/types/database';

type Incident = Tables<'incidents'>;
type IncidentInsert = TablesInsert<'incidents'>;

export interface IncidentFilters {
  search?: string;
  category?: string;
  status?: string;
  urgency?: string;
  page?: number;
  pageSize?: number;
}

export interface IncidentResult {
  data: Incident[];
  count: number;
  error?: string;
}

/** Fetch incidents for a campaign */
export async function getIncidents(
  campaignId: string,
  filters: IncidentFilters = {}
): Promise<IncidentResult> {
  try {
    const supabase = await createClient();
    const {
      search,
      category,
      status,
      urgency,
      page = 1,
      pageSize = 25,
    } = filters;

    let query = supabase
      .from('incidents')
      .select('*', { count: 'exact' })
      .eq('campaign_id', campaignId);

    if (search) {
      query = query.ilike('description', `%${search}%`);
    }
    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (urgency) query = query.eq('urgency', urgency);

    query = query.order('reported_at', { ascending: false });

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

/** Create a new incident */
export async function createIncident(
  input: Omit<IncidentInsert, 'id' | 'created_at'>,
  userId: string
): Promise<{ data: Incident | null; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('incidents')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    await supabase.from('audit_log').insert({
      campaign_id: input.campaign_id,
      user_id: userId,
      action: 'INSERT',
      table_name: 'incidents',
      record_id: data.id,
      new_values: data as unknown as Json,
    });

    return { data };
  } catch (err) {
    return { data: null, error: String(err) };
  }
}

/** Update an incident */
export async function updateIncident(
  id: string,
  campaignId: string,
  userId: string,
  updates: Partial<IncidentInsert>
): Promise<{ data: Incident | null; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: oldData } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('incidents')
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
      table_name: 'incidents',
      record_id: id,
      old_values: oldData as unknown as Json,
      new_values: data as unknown as Json,
    });

    return { data };
  } catch (err) {
    return { data: null, error: String(err) };
  }
}
