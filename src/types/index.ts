/** Position types per Kenyan election structure */
export type ElectionPosition =
  | "president"
  | "governor"
  | "senator"
  | "women_rep"
  | "mp"
  | "mca";

/** Campaign subscription tiers */
export type SubscriptionTier =
  | "aspirant"
  | "contender"
  | "governor"
  | "presidential";

/** User roles in a campaign */
export type CampaignRole =
  | "campaign_owner"
  | "finance_officer"
  | "agent_coordinator"
  | "agent"
  | "viewer";

/** Transaction types */
export type TransactionType = "income" | "expense";

/** Expenditure categories per the Act */
export type ExpenditureCategory =
  | "venue_hire"
  | "publicity_materials"
  | "advertising"
  | "transport"
  | "personnel"
  | "administration"
  | "other";

/** Compliance alert severity */
export type AlertLevel = "critical" | "warning" | "info";

/** Evidence item types */
export type EvidenceType = "photo" | "video" | "document";

/** Evidence verification status */
export type VerificationStatus = "verified" | "pending" | "flagged";

/** Agent deployment status */
export type AgentStatus = "deployed" | "en_route" | "pending" | "gap";

/** Donation compliance status */
export type DonationStatus = "verified" | "pending_kyc" | "flagged" | "blocked";

/** Offline sync states for the agent app */
export type SyncState =
  | "synced"
  | "syncing"
  | "offline_queued"
  | "storage_full"
  | "sync_error";

/** KES currency formatter */
export function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

/** Phone number formatter */
export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.startsWith("254")) {
    return `+${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
  }
  if (clean.startsWith("0")) {
    return `+254 ${clean.slice(1, 4)} ${clean.slice(4)}`;
  }
  return phone;
}
