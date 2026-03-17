'use server';

import { createClient } from '@/lib/supabase/server';
import { authorize } from '@/lib/rbac/authorize';
import type { Json, Tables, TablesInsert } from '@/types/database';

type Transaction = Tables<'transactions'>;
type TransactionInsert = TablesInsert<'transactions'>;

export interface TransactionFilters {
  search?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface TransactionResult {
  data: Transaction[];
  count: number;
  error?: string;
}

export interface FinanceSummary {
  totalSpent: number;
  totalDonations: number;
  balance: number;
  spendingLimit: number;
  byCategory: { category: string; total: number }[];
  recentTransactions: Transaction[];
  error?: string;
}

/** Fetch paginated & filtered transactions */
export async function getTransactions(
  campaignId: string,
  filters: TransactionFilters = {}
): Promise<TransactionResult> {
  try {
    const supabase = await createClient();
    const {
      search,
      category,
      status,
      dateFrom,
      dateTo,
      page = 1,
      pageSize = 25,
      sortBy = 'transaction_date',
      sortDir = 'desc',
    } = filters;

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('campaign_id', campaignId);

    if (search) {
      query = query.or(
        `description.ilike.%${search}%,vendor_name.ilike.%${search}%,reference.ilike.%${search}%`
      );
    }
    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    if (dateFrom) query = query.gte('transaction_date', dateFrom);
    if (dateTo) query = query.lte('transaction_date', dateTo);

    query = query.order(sortBy, { ascending: sortDir === 'asc' });

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

/** Create a new transaction */
export async function createTransaction(
  input: Omit<TransactionInsert, 'id' | 'created_at'>
): Promise<{ data: Transaction | null; error?: string }> {
  try {
    const auth = await authorize(input.campaign_id, 'transactions:create');
    if (!auth.ok) return { data: null, error: auth.error };

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('transactions')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    // Log to audit trail
    await supabase.from('audit_log').insert({
      campaign_id: input.campaign_id,
      user_id: input.recorded_by,
      action: 'INSERT',
      table_name: 'transactions',
      record_id: data.id,
      new_values: data as unknown as Json,
    });

    return { data };
  } catch (err) {
    return { data: null, error: String(err) };
  }
}

/** Update an existing transaction */
export async function updateTransaction(
  id: string,
  campaignId: string,
  userId: string,
  updates: Partial<TransactionInsert>
): Promise<{ data: Transaction | null; error?: string }> {
  try {
    const auth = await authorize(campaignId, 'transactions:approve');
    if (!auth.ok) return { data: null, error: auth.error };

    const supabase = await createClient();

    // Get old values for audit
    const { data: oldData } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('transactions')
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
      table_name: 'transactions',
      record_id: id,
      old_values: oldData as unknown as Json,
      new_values: data as unknown as Json,
    });

    return { data };
  } catch (err) {
    return { data: null, error: String(err) };
  }
}

/** Delete a transaction */
export async function deleteTransaction(
  id: string,
  campaignId: string,
  userId: string
): Promise<{ error?: string }> {
  try {
    const auth = await authorize(campaignId, 'transactions:delete');
    if (!auth.ok) return { error: auth.error };

    const supabase = await createClient();

    const { data: oldData } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('campaign_id', campaignId);

    if (error) return { error: error.message };

    await supabase.from('audit_log').insert({
      campaign_id: campaignId,
      user_id: userId,
      action: 'DELETE',
      table_name: 'transactions',
      record_id: id,
      old_values: oldData as unknown as Json,
    });

    return {};
  } catch (err) {
    return { error: String(err) };
  }
}

/** Get 7-day spending trend for the dashboard chart */
export async function getSpendingTrend(
  campaignId: string,
  days: number = 7
): Promise<{ data: { day: string; amount: number; donations: number }[]; error?: string }> {
  try {
    const supabase = await createClient();
    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: { day: string; amount: number; donations: number }[] = [];

    // Build date range for the past N days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      result.push({ day: dayNames[date.getDay()], amount: 0, donations: 0 });

      // This is filled below; store dateStr for lookup
      (result[result.length - 1] as { day: string; amount: number; donations: number; _date?: string })._date = dateStr;
    }

    // Fetch expenses for the date range
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (days - 1));
    const startStr = startDate.toISOString().split('T')[0];

    const { data: transactions } = await supabase
      .from('transactions')
      .select('transaction_date, amount_kes, type')
      .eq('campaign_id', campaignId)
      .gte('transaction_date', startStr)
      .order('transaction_date', { ascending: true });

    // Fetch donations for the same range
    const { data: donations } = await supabase
      .from('donations')
      .select('created_at, amount_kes')
      .eq('campaign_id', campaignId)
      .gte('created_at', startStr + 'T00:00:00');

    // Aggregate transactions by day
    for (const t of transactions ?? []) {
      const entry = result.find((r) => (r as { _date?: string })._date === t.transaction_date);
      if (entry && t.type === 'expense') {
        entry.amount += t.amount_kes;
      }
    }

    // Aggregate donations by day
    for (const d of donations ?? []) {
      const dateStr = d.created_at?.split('T')[0];
      const entry = result.find((r) => (r as { _date?: string })._date === dateStr);
      if (entry) {
        entry.donations += d.amount_kes;
      }
    }

    // Clean up internal _date field
    const cleaned = result.map(({ day, amount, donations }) => ({ day, amount, donations }));

    return { data: cleaned };
  } catch (err) {
    return { data: [], error: String(err) };
  }
}

/** Get finance summary with aggregated data */
export async function getFinanceSummary(
  campaignId: string
): Promise<FinanceSummary> {
  try {
    const supabase = await createClient();

    // Get campaign spending limit
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('spending_limit_kes')
      .eq('id', campaignId)
      .single();

    const spendingLimit = campaign?.spending_limit_kes ?? 35_000_000;

    // Get all transactions for aggregation
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('transaction_date', { ascending: false });

    const allTxn = transactions ?? [];

    // Calculate totals
    const totalSpent = allTxn
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount_kes, 0);

    // Get donations total
    const { data: donations } = await supabase
      .from('donations')
      .select('amount_kes')
      .eq('campaign_id', campaignId);

    const totalDonations = (donations ?? []).reduce(
      (sum, d) => sum + d.amount_kes,
      0
    );

    // Group by category
    const categoryMap = new Map<string, number>();
    for (const t of allTxn.filter((t) => t.type === 'expense')) {
      categoryMap.set(
        t.category,
        (categoryMap.get(t.category) ?? 0) + t.amount_kes
      );
    }
    const byCategory = Array.from(categoryMap.entries()).map(
      ([category, total]) => ({ category, total })
    );

    return {
      totalSpent,
      totalDonations,
      balance: totalDonations - totalSpent,
      spendingLimit,
      byCategory,
      recentTransactions: allTxn.slice(0, 5),
    };
  } catch (err) {
    return {
      totalSpent: 0,
      totalDonations: 0,
      balance: 0,
      spendingLimit: 35_000_000,
      byCategory: [],
      recentTransactions: [],
      error: String(err),
    };
  }
}
