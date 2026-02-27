import { z } from "zod";

/**
 * Kenya's 47 counties as defined in the Constitution of Kenya 2010, Schedule 1.
 * Used for agent deployment, geographic filtering, and IEBC compliance mapping.
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

/** Agent deployment / operational statuses */
export const AGENT_STATUSES = [
  "deployed",
  "active",
  "checked-in",
  "inactive",
  "pending",
] as const;

export type AgentStatus = (typeof AGENT_STATUSES)[number];

/**
 * Schema for registering or editing a campaign agent.
 *
 * Validates:
 * - Full name between 2 and 100 characters
 * - Phone in Kenya +254 format (12 digits total: 254 + 9 digits)
 * - National ID: exactly 8 digits (Kenya national ID format)
 * - County must be one of the 47 Kenyan counties
 * - Constituency and polling station are required text fields
 * - Status defaults to "pending"
 */
export const agentSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be 100 characters or fewer"),
  phone: z
    .string()
    .regex(
      /^\+254[17]\d{8}$/,
      "Phone must be in +254 format (e.g. +254712345678)"
    ),
  national_id: z
    .string()
    .regex(/^\d{8}$/, "National ID must be exactly 8 digits"),
  county: z.enum(KENYA_COUNTIES, {
    error: "Select a valid Kenyan county",
  }),
  constituency: z
    .string()
    .min(2, "Constituency is required")
    .max(100, "Constituency must be 100 characters or fewer"),
  polling_station: z
    .string()
    .min(2, "Polling station is required")
    .max(200, "Polling station must be 200 characters or fewer"),
  status: z.enum(AGENT_STATUSES).default("pending"),
});

export type AgentFormValues = z.infer<typeof agentSchema>;

/**
 * Schema for agent check-in events.
 *
 * Validates:
 * - Agent ID as a valid UUID
 * - Location with latitude (-4.7 to 5.5 covers all of Kenya) and longitude (33.9 to 41.9)
 * - ISO 8601 timestamp
 * - Optional notes field for the agent
 */
export const checkInSchema = z.object({
  agent_id: z.string().uuid("Agent ID must be a valid UUID"),
  location: z.object({
    lat: z
      .number()
      .min(-4.7, "Latitude must be within Kenya")
      .max(5.5, "Latitude must be within Kenya"),
    lng: z
      .number()
      .min(33.9, "Longitude must be within Kenya")
      .max(41.9, "Longitude must be within Kenya"),
  }),
  timestamp: z
    .string()
    .min(1, "Timestamp is required")
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Please enter a valid ISO 8601 timestamp"
    ),
  notes: z
    .string()
    .max(500, "Notes must be 500 characters or fewer")
    .optional()
    .or(z.literal("")),
});

export type CheckInFormValues = z.infer<typeof checkInSchema>;

/**
 * Schema for filtering / searching agents.
 */
export const agentFilterSchema = z.object({
  search: z.string().optional(),
  county: z.enum(KENYA_COUNTIES).optional().or(z.literal("")),
  status: z.enum(AGENT_STATUSES).optional().or(z.literal("")),
});

export type AgentFilterValues = z.infer<typeof agentFilterSchema>;
