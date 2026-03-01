'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useCampaign } from '@/lib/campaign-context';

/**
 * Hook for fetching campaign-scoped data from server actions.
 * Automatically refetches when the active campaign changes.
 */
export function useCampaignData<T>(
  fetcher: (campaignId: string) => Promise<{ data: T | null; error?: string }>,
  defaultValue: T
) {
  const { campaign } = useCampaign();
  const activeCampaignId = campaign?.id ?? null;
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!activeCampaignId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher(activeCampaignId);
      if (result.error) {
        setError(result.error);
      } else if (result.data !== null) {
        setData(result.data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [activeCampaignId, fetcher]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

/**
 * Hook for executing server action mutations with loading state.
 */
export function useMutation<TInput, TResult>(
  action: (input: TInput) => Promise<{ data: TResult | null; error?: string }>
) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    (input: TInput): Promise<{ data: TResult | null; error?: string }> => {
      return new Promise((resolve) => {
        startTransition(async () => {
          setError(null);
          try {
            const result = await action(input);
            if (result.error) {
              setError(result.error);
            }
            resolve(result);
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Operation failed';
            setError(msg);
            resolve({ data: null, error: msg });
          }
        });
      });
    },
    [action]
  );

  return { execute, isPending, error };
}
