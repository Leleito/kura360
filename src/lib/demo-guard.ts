'use server';

import { IS_DEMO } from './demo';

/**
 * Wraps a server action to prevent mutations in demo mode.
 * Returns a friendly error message instead of executing the action.
 */
export function demoGuard<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  if (!IS_DEMO) return fn;

  return (async (..._args: any[]) => {
    return {
      data: null,
      error:
        'This action is disabled in demo mode. Sign up at app.kura360.co to use the full platform.',
    };
  }) as unknown as T;
}
