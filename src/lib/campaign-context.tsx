'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/types/database';

type Campaign = Tables<'campaigns'>;

interface CampaignContextValue {
  /** Currently selected campaign */
  campaign: Campaign | null;
  /** All campaigns the user has access to */
  campaigns: Campaign[];
  /** Loading state */
  loading: boolean;
  /** Switch to a different campaign */
  switchCampaign: (id: string) => void;
  /** Refresh campaigns from Supabase */
  refreshCampaigns: () => Promise<void>;
}

const CampaignContext = createContext<CampaignContextValue>({
  campaign: null,
  campaigns: [],
  loading: true,
  switchCampaign: () => {},
  refreshCampaigns: async () => {},
});

const STORAGE_KEY = 'kura360_active_campaign';

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCampaigns([]);
        setActiveCampaignId(null);
        setLoading(false);
        return;
      }

      // Get campaigns user owns
      const { data: ownedCampaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      // Get campaigns user is a member of
      const { data: memberships } = await supabase
        .from('campaign_members')
        .select('campaign_id')
        .eq('user_id', user.id);

      let memberCampaigns: Campaign[] = [];
      if (memberships && memberships.length > 0) {
        const memberIds = memberships
          .map((m) => m.campaign_id)
          .filter((id) => !ownedCampaigns?.some((c) => c.id === id));

        if (memberIds.length > 0) {
          const { data } = await supabase
            .from('campaigns')
            .select('*')
            .in('id', memberIds)
            .order('created_at', { ascending: false });
          memberCampaigns = data ?? [];
        }
      }

      const allCampaigns = [...(ownedCampaigns ?? []), ...memberCampaigns];
      setCampaigns(allCampaigns);

      // Restore active campaign from localStorage, or use first campaign
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && allCampaigns.some((c) => c.id === stored)) {
        setActiveCampaignId(stored);
      } else if (allCampaigns.length > 0) {
        setActiveCampaignId(allCampaigns[0].id);
        localStorage.setItem(STORAGE_KEY, allCampaigns[0].id);
      }
    } catch (err) {
      console.error('[CampaignProvider] Failed to fetch campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const switchCampaign = useCallback((id: string) => {
    setActiveCampaignId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const campaign = campaigns.find((c) => c.id === activeCampaignId) ?? null;

  return (
    <CampaignContext.Provider
      value={{
        campaign,
        campaigns,
        loading,
        switchCampaign,
        refreshCampaigns: fetchCampaigns,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const ctx = useContext(CampaignContext);
  if (!ctx) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return ctx;
}
