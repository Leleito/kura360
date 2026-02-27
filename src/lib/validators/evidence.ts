import { z } from "zod";

/**
 * Evidence types supported by the KURA360 Evidence Vault.
 * Aligned with IEBC documentation requirements for campaign compliance.
 */
export const EVIDENCE_TYPES = [
  "photo",
  "video",
  "document",
  "audio",
] as const;

export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

/** Evidence verification statuses */
export const EVIDENCE_STATUSES = [
  "verified",
  "pending",
  "flagged",
] as const;

export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];

/**
 * Kenya's 47 counties — used for county-level evidence tagging.
 */
export const KENYA_COUNTIES = [
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Elgeyo-Marakwet",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kajiado",
  "Kakamega",
  "Kericho",
  "Kiambu",
  "Kilifi",
  "Kirinyaga",
  "Kisii",
  "Kisumu",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Machakos",
  "Makueni",
  "Mandera",
  "Marsabit",
  "Meru",
  "Migori",
  "Mombasa",
  "Murang'a",
  "Nairobi",
  "Nakuru",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Nyeri",
  "Samburu",
  "Siaya",
  "Taita-Taveta",
  "Tana River",
  "Tharaka-Nithi",
  "Trans-Nzoia",
  "Turkana",
  "Uasin Gishu",
  "Vihiga",
  "Wajir",
  "West Pokot",
] as const;

export type KenyaCounty = (typeof KENYA_COUNTIES)[number];

/**
 * GPS location schema for geo-tagged evidence.
 */
export const locationSchema = z.object({
  lat: z
    .number()
    .min(-4.7, "Latitude must be within Kenya's bounds")
    .max(5.1, "Latitude must be within Kenya's bounds"),
  lng: z
    .number()
    .min(33.9, "Longitude must be within Kenya's bounds")
    .max(41.9, "Longitude must be within Kenya's bounds"),
});

export type EvidenceLocation = z.infer<typeof locationSchema>;

/**
 * Schema for creating / uploading an evidence item to the vault.
 * Validates title length, type, county assignment, SHA-256 integrity hash,
 * and optional GPS coordinates.
 */
export const evidenceSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be 200 characters or fewer"),
  type: z.enum(EVIDENCE_TYPES, {
    error: "Select a valid evidence type",
  }),
  county: z.enum(KENYA_COUNTIES, {
    error: "Select a valid Kenyan county",
  }),
  description: z
    .string()
    .max(1000, "Description must be 1,000 characters or fewer")
    .optional()
    .or(z.literal("")),
  file_url: z
    .string()
    .url("Please enter a valid file URL"),
  captured_by: z
    .string()
    .min(2, "Captured by must be at least 2 characters")
    .max(100, "Captured by must be 100 characters or fewer"),
  sha256_hash: z
    .string()
    .length(64, "SHA-256 hash must be exactly 64 hex characters")
    .regex(
      /^[a-f0-9]{64}$/,
      "SHA-256 hash must contain only lowercase hex characters (0-9, a-f)"
    ),
  status: z.enum(EVIDENCE_STATUSES).default("pending"),
  location: locationSchema.optional(),
});

export type EvidenceFormValues = z.infer<typeof evidenceSchema>;

/**
 * Schema for filtering / searching evidence items.
 */
export const evidenceFilterSchema = z.object({
  search: z.string().optional(),
  type: z.enum(EVIDENCE_TYPES).optional().or(z.literal("")),
  status: z.enum(EVIDENCE_STATUSES).optional().or(z.literal("")),
  county: z.enum(KENYA_COUNTIES).optional().or(z.literal("")),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type EvidenceFilterValues = z.infer<typeof evidenceFilterSchema>;
