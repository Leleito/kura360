/** Demo mode is controlled by NEXT_PUBLIC_DEMO_MODE env var */
export const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

/** Pre-seeded demo campaign ID (matches seed.sql) */
export const DEMO_CAMPAIGN_ID = 'demo-campaign-nakuru-2026';

/** Pre-seeded demo user ID */
export const DEMO_USER_ID = 'demo-user-jane-wanjiku';

/** Demo campaign details */
export const DEMO_CAMPAIGN = {
  id: DEMO_CAMPAIGN_ID,
  candidate_name: 'Jane Wanjiku',
  campaign_name: 'Jane Wanjiku for Governor, Nakuru',
  position: 'Governor',
  county: 'Nakuru',
  party: 'UDA',
  spending_limit_kes: 433_000_000,
};
