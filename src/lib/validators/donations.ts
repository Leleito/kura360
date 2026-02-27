import { z } from "zod";

/**
 * ECFA anonymous donation threshold.
 * Under the Election Campaign Financing Act, anonymous donations
 * exceeding KES 5,000 are illegal and must be reported to the IEBC.
 */
export const ECFA_ANONYMOUS_THRESHOLD = 5_000;

/**
 * ECFA individual donation limit (presidential race).
 * No single individual may contribute more than KES 500,000
 * to a single campaign per election cycle.
 */
export const ECFA_INDIVIDUAL_LIMIT = 500_000;

/**
 * High-value donation warning threshold.
 * Donations above KES 1,000,000 trigger additional scrutiny and logging.
 */
export const HIGH_VALUE_THRESHOLD = 1_000_000;

/** Accepted payment methods */
export const DONATION_METHODS = [
  "mpesa",
  "bank",
  "cash",
  "cheque",
] as const;

export type DonationMethod = (typeof DONATION_METHODS)[number];

/** Human-readable labels for payment methods */
export const DONATION_METHOD_LABELS: Record<DonationMethod, string> = {
  mpesa: "M-Pesa",
  bank: "Bank Transfer",
  cash: "Cash",
  cheque: "Cheque",
};

/** KYC verification statuses */
export const KYC_STATUSES = ["verified", "pending", "failed"] as const;
export type KYCStatus = (typeof KYC_STATUSES)[number];

/** Compliance statuses */
export const COMPLIANCE_STATUSES = ["compliant", "flagged", "violation"] as const;
export type ComplianceStatus = (typeof COMPLIANCE_STATUSES)[number];

/**
 * Kenya phone number regex.
 * Accepts formats: +254XXXXXXXXX, 254XXXXXXXXX, 0XXXXXXXXX
 */
const KENYA_PHONE_REGEX = /^(\+?254|0)[17]\d{8}$/;

/**
 * Kenya National ID regex: exactly 8 digits.
 */
const NATIONAL_ID_REGEX = /^\d{8}$/;

/**
 * Schema for creating / recording a donation.
 * Validates against ECFA donation rules including anonymous thresholds,
 * KYC requirements, and amount limits.
 */
export const donationSchema = z
  .object({
    donor_name: z
      .string()
      .min(2, "Donor name must be at least 2 characters")
      .max(100, "Donor name must be 100 characters or fewer"),
    donor_phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(KENYA_PHONE_REGEX, "Enter a valid Kenyan phone number (+254...)"),
    amount: z
      .number({ error: "Amount is required" })
      .positive("Amount must be a positive number"),
    method: z.enum(DONATION_METHODS, {
      error: "Select a valid payment method",
    }),
    reference: z
      .string()
      .max(20, "Reference must be 20 characters or fewer")
      .optional()
      .or(z.literal("")),
    national_id: z
      .string()
      .min(1, "National ID is required for KYC")
      .regex(NATIONAL_ID_REGEX, "National ID must be exactly 8 digits"),
    notes: z
      .string()
      .max(500, "Notes must be 500 characters or fewer")
      .optional()
      .or(z.literal("")),
    anonymous: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // High-value warning (non-blocking, logged server-side)
      if (data.amount > HIGH_VALUE_THRESHOLD) {
        console.warn(
          `[ECFA] High-value donation: KES ${data.amount.toLocaleString()} from ${data.donor_name}. Additional scrutiny required.`
        );
      }
      return true;
    },
    { message: "High-value donation logged for review" }
  )
  .refine(
    (data) => {
      // ECFA violation: anonymous donations over KES 5,000 are illegal
      if (data.anonymous && data.amount > ECFA_ANONYMOUS_THRESHOLD) {
        return false;
      }
      return true;
    },
    {
      message: `ECFA Violation: Anonymous donations exceeding KES ${ECFA_ANONYMOUS_THRESHOLD.toLocaleString()} are illegal under the Election Campaign Financing Act. Donor identity must be verified.`,
      path: ["anonymous"],
    }
  )
  .refine(
    (data) => {
      // ECFA individual limit check
      if (data.amount > ECFA_INDIVIDUAL_LIMIT) {
        return false;
      }
      return true;
    },
    {
      message: `ECFA Violation: Individual donations cannot exceed KES ${ECFA_INDIVIDUAL_LIMIT.toLocaleString()} per election cycle.`,
      path: ["amount"],
    }
  );

export type DonationFormValues = z.infer<typeof donationSchema>;

/**
 * Schema for filtering / searching donations.
 */
export const donationFilterSchema = z.object({
  search: z.string().optional(),
  method: z.enum(DONATION_METHODS).optional().or(z.literal("")),
  kyc_status: z.enum(KYC_STATUSES).optional().or(z.literal("")),
  compliance: z.enum(COMPLIANCE_STATUSES).optional().or(z.literal("")),
});

export type DonationFilterValues = z.infer<typeof donationFilterSchema>;
