'use server';

import { createClient } from '@/lib/supabase/server';
import type { Json, Tables } from '@/types/database';

type AuditLog = Tables<'audit_log'>;

export interface AuditFilters {
  tableName?: string;
  action?: string;
  userId?: string;
  recordId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditResult {
  data: AuditLog[];
  count: number;
  error?: string;
}

/** Fetch audit log entries for a campaign */
export async function getAuditLog(
  campaignId: string,
  filters: AuditFilters = {}
): Promise<AuditResult> {
  try {
    const supabase = await createClient();
    const {
      tableName,
      action,
      userId,
      recordId,
      dateFrom,
      dateTo,
      page = 1,
      pageSize = 50,
    } = filters;

    let query = supabase
      .from('audit_log')
      .select('*', { count: 'exact' })
      .eq('campaign_id', campaignId);

    if (tableName) query = query.eq('table_name', tableName);
    if (action) query = query.eq('action', action);
    if (userId) query = query.eq('user_id', userId);
    if (recordId) query = query.eq('record_id', recordId);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);

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

/** Log an audit action (called from other server actions) */
export async function logAuditAction(
  campaignId: string,
  userId: string,
  action: string,
  tableName: string,
  recordId: string | null,
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>
) {
  try {
    const supabase = await createClient();

    await supabase.from('audit_log').insert({
      campaign_id: campaignId,
      user_id: userId,
      action,
      table_name: tableName,
      record_id: recordId,
      old_values: (oldValues ?? null) as Json | null,
      new_values: (newValues ?? null) as Json | null,
    });
  } catch (err) {
    console.error('[Audit] Failed to log action:', err);
  }
}
