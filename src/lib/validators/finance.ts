import { z } from "zod";

/**
 * ECFA spending categories as defined by the Election Campaign Financing Act.
 * These are the six statutory categories that campaigns must report against.
 */
export const ECFA_CATEGORIES = [
  "Advertising",
  "Publicity",
  "Venue Hire",
  "Transport",
  "Personnel",
  "Admin & Other",
] as const;

export type ECFACategory = (typeof ECFA_CATEGORIES)[number];

/** Transaction approval status */
export const TRANSACTION_STATUSES = [
  "approved",
  "pending",
  "rejected",
] as const;

export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

/** ECFA statutory spending limit for presidential campaigns */
export const ECFA_SPENDING_LIMIT = 35_000_000;

/**
 * Schema for creating / editing a campaign transaction.
 * Validates against ECFA rules: positive amount, capped at the statutory limit,
 * one of the six recognised spending categories, and a reasonably-sized
 * description for audit trail purposes.
 */
export const transactionSchema = z.object({
  description: z
    .string()
    .min(3, "Description must be at least 3 characters")
    .max(200, "Description must be 200 characters or fewer"),
  amount: z
    .number({ error: "Amount is required" })
    .positive("Amount must be a positive number")
    .max(ECFA_SPENDING_LIMIT, `Amount cannot exceed KES ${ECFA_SPENDING_LIMIT.toLocaleString()}`),
  category: z.enum(ECFA_CATEGORIES, {
    error: "Select a valid ECFA category",
  }),
  date: z
    .string()
    .min(1, "Date is required")
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Please enter a valid date"
    ),
  receipt_url: z
    .string()
    .url("Please enter a valid URL for the receipt")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(500, "Notes must be 500 characters or fewer")
    .optional()
    .or(z.literal("")),
  status: z.enum(TRANSACTION_STATUSES).default("pending"),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

/**
 * Schema for filtering / searching transactions.
 */
export const transactionFilterSchema = z.object({
  search: z.string().optional(),
  category: z.enum(ECFA_CATEGORIES).optional().or(z.literal("")),
  status: z.enum(TRANSACTION_STATUSES).optional().or(z.literal("")),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type TransactionFilterValues = z.infer<typeof transactionFilterSchema>;
