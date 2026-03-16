/**
 * Server-side authorization for KURA360.
 *
 * Usage in server actions:
 *   const auth = await authorize(campaignId, 'transactions:create');
 *   if (!auth.ok) return { error: auth.error };
 *   // proceed — auth.userId and auth.role are available
 */

import { createClient } from '@/lib/supabase/server';
import {
  hasPermission,
  hasAllPermissions,
  isValidRole,
  type CampaignRole,
  type Permission,
} from './permissions';

export interface AuthResult {
  ok: true;
  userId: string;
  role: CampaignRole;
  campaignId: string;
}

export interface AuthError {
  ok: false;
  error: string;
  status: 401 | 403 | 404;
}

export type AuthCheck = AuthResult | AuthError;

/**
 * Authorize the current user for a specific permission on a campaign.
 *
 * @param campaignId - The campaign to check access for
 * @param permission - Single permission required (or array for ALL required)
 * @returns AuthResult on success, AuthError on failure
 */
export async function authorize(
  campaignId: string,
  permission: Permission | Permission[]
): Promise<AuthCheck> {
  const supabase = await createClient();

  // 1. Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'Authentication required', status: 401 };
  }

  // 2. Check if user is campaign owner (implicit full access)
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, owner_id')
    .eq('id', campaignId)
    .single();

  if (!campaign) {
    return { ok: false, error: 'Campaign not found', status: 404 };
  }

  if (campaign.owner_id === user.id) {
    return { ok: true, userId: user.id, role: 'campaign_owner', campaignId };
  }

  // 3. Look up membership role
  const { data: membership } = await supabase
    .from('campaign_members')
    .select('role')
    .eq('campaign_id', campaignId)
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    return { ok: false, error: 'Not a member of this campaign', status: 403 };
  }

  const role = membership.role;
  if (!isValidRole(role)) {
    return { ok: false, error: `Invalid role: ${role}`, status: 403 };
  }

  // 4. Check permission(s)
  const permissions = Array.isArray(permission) ? permission : [permission];
  const authorized = hasAllPermissions(role, permissions);

  if (!authorized) {
    return {
      ok: false,
      error: `Insufficient permissions. Role "${role}" lacks: ${permissions.filter((p) => !hasPermission(role, p)).join(', ')}`,
      status: 403,
    };
  }

  return { ok: true, userId: user.id, role, campaignId };
}

/**
 * Light-weight check: just get the current user's role for a campaign.
 * Returns null if not authenticated or not a member.
 */
export async function getUserRole(campaignId: string): Promise<{
  userId: string;
  role: CampaignRole;
} | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Check ownership first
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('owner_id')
    .eq('id', campaignId)
    .single();

  if (campaign?.owner_id === user.id) {
    return { userId: user.id, role: 'campaign_owner' };
  }

  // Check membership
  const { data: membership } = await supabase
    .from('campaign_members')
    .select('role')
    .eq('campaign_id', campaignId)
    .eq('user_id', user.id)
    .single();

  if (!membership || !isValidRole(membership.role)) return null;

  return { userId: user.id, role: membership.role };
}
