'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

/**
 * Generic hook that syncs filter state with URL search params.
 *
 * Usage:
 *   const { filters, setFilter, clearFilters } = useQueryFilters({
 *     search: '',
 *     status: '',
 *     category: '',
 *   });
 *
 * Reads initial values from URL, writes changes back to the URL.
 * Empty strings are omitted from the URL for cleanliness.
 */
export function useQueryFilters<T extends Record<string, string>>(defaults: T) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Derive current filters: URL params override defaults
  const filters = useMemo(() => {
    const result = { ...defaults };
    for (const key of Object.keys(defaults)) {
      const param = searchParams.get(key);
      if (param !== null) {
        (result as Record<string, string>)[key] = param;
      }
    }
    return result;
  }, [defaults, searchParams]);

  // Build URL string from filters
  const buildUrl = useCallback(
    (updated: Partial<T>) => {
      const params = new URLSearchParams();
      const merged = { ...filters, ...updated };
      for (const [key, value] of Object.entries(merged)) {
        if (value && value !== '') {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [filters, pathname]
  );

  // Set a single filter value
  const setFilter = useCallback(
    (key: keyof T, value: string) => {
      router.replace(buildUrl({ [key]: value } as Partial<T>), { scroll: false });
    },
    [router, buildUrl]
  );

  // Set multiple filters at once
  const setFilters = useCallback(
    (updates: Partial<T>) => {
      router.replace(buildUrl(updates), { scroll: false });
    },
    [router, buildUrl]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return { filters, setFilter, setFilters, clearFilters };
}
