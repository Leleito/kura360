'use server';

import { createClient } from '@/lib/supabase/server';
import type { Json, Tables, TablesInsert } from '@/types/database';

type Agent = Tables<'agents'>;
type AgentInsert = TablesInsert<'agents'>;

export interface AgentFilters {
  search?: string;
  county?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface AgentResult {
  data: Agent[];
  count: number;
  error?: string;
}

export interface AgentStats {
  total: number;
  deployed: number;
  active: number;
  checkedIn: number;
  inactive: number;
  pending: number;
  byCounty: { county: string; count: number; deployed: number }[];
  error?: string;
}

/** Fetch paginated & filtered agents */
export async function getAgents(
  campaignId: string,
  filters: AgentFilters = {}
): Promise<AgentResult> {
  try {
    const supabase = await createClient();
    const { search, county, status, page = 1, pageSize = 25 } = filters;

    let query = supabase
      .from('agents')
      .select('*', { count: 'exact' })
      .eq('campaign_id', campaignId);

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,phone.ilike.%${search}%,national_id.ilike.%${search}%`
      );
    }
    if (county) query = query.eq('county', county);
    if (status) query = query.eq('status', status);

    query = query.order('created_at', { ascending: false });

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

/** Get a single agent by ID */
export async function getAgentById(
  id: string
): Promise<{ data: Agent | null; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return { data: null, error: error.message };
    return { data };
  } catch (err) {
    return { data: null, error: String(err) };
  }
}

/** Create a new agent */
export async function createAgent(
  input: Omit<AgentInsert, 'id' | 'created_at'>,
  userId: string
): Promise<{ data: Agent | null; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('agents')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    await supabase.from('audit_log').insert({
      campaign_id: input.campaign_id,
      user_id: userId,
      action: 'INSERT',
      table_name: 'agents',
      record_id: data.id,
      new_values: data as unknown as Json,
    });

    return { data };
  } catch (err) {
    return { data: null, error: String(err) };
  }
}

/** Update an agent */
export async function updateAgent(
  id: string,
  campaignId: string,
  userId: string,
  updates: Partial<AgentInsert>
): Promise<{ data: Agent | null; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: oldData } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('agents')
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
      table_name: 'agents',
      record_id: id,
      old_values: oldData as unknown as Json,
      new_values: data as unknown as Json,
    });

    return { data };
  } catch (err) {
    return { data: null, error: String(err) };
  }
}

/** Get agent stats for a campaign */
export async function getAgentStats(
  campaignId: string
): Promise<AgentStats> {
  try {
    const supabase = await createClient();

    const { data: agents } = await supabase
      .from('agents')
      .select('status, county')
      .eq('campaign_id', campaignId);

    const all = agents ?? [];
    const total = all.length;
    const deployed = all.filter((a) => a.status === 'deployed').length;
    const active = all.filter((a) => a.status === 'active').length;
    const checkedIn = all.filter((a) => a.status === 'checked-in').length;
    const inactive = all.filter((a) => a.status === 'inactive').length;
    const pending = all.filter((a) => a.status === 'pending').length;

    // Group by county
    const countyMap = new Map<string, { count: number; deployed: number }>();
    for (const a of all) {
      const county = a.county ?? 'Unknown';
      const existing = countyMap.get(county) ?? { count: 0, deployed: 0 };
      existing.count += 1;
      if (a.status === 'deployed' || a.status === 'active' || a.status === 'checked-in') {
        existing.deployed += 1;
      }
      countyMap.set(county, existing);
    }

    const byCounty = Array.from(countyMap.entries())
      .map(([county, stats]) => ({ county, ...stats }))
      .sort((a, b) => b.count - a.count);

    return { total, deployed, active, checkedIn, inactive, pending, byCounty };
  } catch (err) {
    return {
      total: 0,
      deployed: 0,
      active: 0,
      checkedIn: 0,
      inactive: 0,
      pending: 0,
      byCounty: [],
      error: String(err),
    };
  }
}
