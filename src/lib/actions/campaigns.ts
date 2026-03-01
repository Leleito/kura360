'use server';

import { createClient } from '@/lib/supabase/server';
import type { Tables, TablesInsert } from '@/types/database';

type Campaign = Tables<'campaigns'>;
type CampaignInsert = TablesInsert<'campaigns'>;

/** Get campaigns for the authenticated user */
export async function getUserCampaigns(): Promise<{
  data: Campaign[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { data: [], error: 'Not authenticated' };

    // Get owned campaigns
    const { data: owned } = await supabase
      .from('campaigns')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    // Get member campaigns
    const { data: memberships } = await supabase
      .from('campaign_members')
      .select('campaign_id')
      .eq('user_id', user.id);

    const ownedIds = new Set((owned ?? []).map((c) => c.id));
    const memberIds = (memberships ?? [])
      .map((m) => m.campaign_id)
      .filter((id) => !ownedIds.has(id));

    let memberCampaigns: Campaign[] = [];
    if (memberIds.length > 0) {
      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .in('id', memberIds);
      memberCampaigns = data ?? [];
    }

    return { data: [...(owned ?? []), ...memberCampaigns] };
  } catch (err) {
    return { data: [], error: String(err) };
  }
}

/** Create a new campaign */
export async function createCampaign(
  input: Omit<CampaignInsert, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: Campaign | null; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('campaigns')
      .insert(input)
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    // Also add owner as a campaign member with 'owner' role
    await supabase.from('campaign_members').insert({
      campaign_id: data.id,
      user_id: input.owner_id,
      role: 'owner',
    });

    return { data };
  } catch (err) {
    return { data: null, error: String(err) };
  }
}

/** Update campaign settings */
export async function updateCampaign(
  id: string,
  updates: Partial<CampaignInsert>
): Promise<{ data: Campaign | null; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('campaigns')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data };
  } catch (err) {
    return { data: null, error: String(err) };
  }
}
