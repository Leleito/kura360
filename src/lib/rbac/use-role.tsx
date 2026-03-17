'use client';

/**
 * Client-side RBAC hooks and components.
 *
 * Usage:
 *   const { role, can } = useRole();
 *   if (can('transactions:create')) { ... }
 *
 *   <RoleGate permission="transactions:create">
 *     <Button>Record Transaction</Button>
 *   </RoleGate>
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCampaign } from '@/lib/campaign-context';
import { IS_DEMO } from '@/lib/demo';
import {
  hasPermission,
  hasAnyPermission,
  isValidRole,
  type CampaignRole,
  type Permission,
} from './permissions';

/* -------------------------------------------------------------------------- */
/*  Context                                                                    */
/* -------------------------------------------------------------------------- */

interface RoleContextValue {
  /** Current user's role in the active campaign */
  role: CampaignRole | null;
  /** Whether role data is still loading */
  loading: boolean;
  /** Check if the user has a specific permission */
  can: (permission: Permission) => boolean;
  /** Check if the user has ANY of the listed permissions */
  canAny: (permissions: Permission[]) => boolean;
}

const RoleContext = createContext<RoleContextValue>({
  role: null,
  loading: true,
  can: () => false,
  canAny: () => false,
});

/* -------------------------------------------------------------------------- */
/*  Provider                                                                   */
/* -------------------------------------------------------------------------- */

export function RoleProvider({ children }: { children: ReactNode }) {
  const { campaign } = useCampaign();
  const [role, setRole] = useState<CampaignRole | null>(IS_DEMO ? 'campaign_owner' : null);
  const [loading, setLoading] = useState(!IS_DEMO);

  useEffect(() => {
    // In demo mode, always use campaign_owner role so all features are visible
    if (IS_DEMO) {
      setRole('campaign_owner');
      setLoading(false);
      return;
    }

    async function fetchRole() {
      setLoading(true);

      if (!campaign) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setRole(null);
          setLoading(false);
          return;
        }

        // Check if user is campaign owner
        if (campaign.owner_id === user.id) {
          setRole('campaign_owner');
          setLoading(false);
          return;
        }

        // Look up membership
        const { data: membership } = await supabase
          .from('campaign_members')
          .select('role')
          .eq('campaign_id', campaign.id)
          .eq('user_id', user.id)
          .single();

        if (membership && isValidRole(membership.role)) {
          setRole(membership.role);
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error('[RoleProvider] Error fetching role:', err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [campaign]);

  const can = (permission: Permission): boolean => {
    if (!role) return false;
    return hasPermission(role, permission);
  };

  const canAny = (permissions: Permission[]): boolean => {
    if (!role) return false;
    return hasAnyPermission(role, permissions);
  };

  return (
    <RoleContext.Provider value={{ role, loading, can, canAny }}>
      {children}
    </RoleContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hook                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Access the current user's role and permission helpers.
 */
export function useRole() {
  return useContext(RoleContext);
}

/* -------------------------------------------------------------------------- */
/*  Gate Component                                                             */
/* -------------------------------------------------------------------------- */

interface RoleGateProps {
  /** Permission required to render children */
  permission?: Permission;
  /** Alternative: require ANY of these permissions */
  anyOf?: Permission[];
  /** Fallback UI when permission denied (default: null) */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Conditionally render children based on RBAC permissions.
 *
 * <RoleGate permission="transactions:create">
 *   <Button>Record Transaction</Button>
 * </RoleGate>
 */
export function RoleGate({ permission, anyOf, fallback = null, children }: RoleGateProps) {
  const { can, canAny, loading } = useRole();

  if (loading) return null;

  if (permission && !can(permission)) return <>{fallback}</>;
  if (anyOf && !canAny(anyOf)) return <>{fallback}</>;

  return <>{children}</>;
}
