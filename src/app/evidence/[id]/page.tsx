"use client";

import { use } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, formatDateShort } from "@/lib/utils";
import {
  ArrowLeft,
  Camera,
  Video,
  FileText,
  Mic,
  MapPin,
  Calendar,
  User,
  Hash,
  Shield,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  ExternalLink,
  Copy,
  Eye,
  Link2,
} from "lucide-react";
import type { EvidenceType, EvidenceStatus } from "@/lib/validators/evidence";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface EvidenceItem {
  id: string;
  title: string;
  type: EvidenceType;
  county: string;
  description: string;
  file_url: string;
  captured_by: string;
  sha256_hash: string;
  status: EvidenceStatus;
  created_at: string;
  thumbnail_color: string;
  file_size: string;
  location?: { lat: number; lng: number };
}

interface CustodyEvent {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  detail: string;
}

interface RelatedItem {
  id: string;
  title: string;
  type: EvidenceType;
  thumbnail_color: string;
}

/* -------------------------------------------------------------------------- */
/*  Mock Data                                                                 */
/* -------------------------------------------------------------------------- */

const MOCK_EVIDENCE: Record<string, EvidenceItem> = {
  "ev-001": {
    id: "ev-001",
    title: "Uhuru Park Rally — Crowd Aerial View",
    type: "photo",
    county: "Nairobi",
    description:
      "Aerial drone photograph of campaign rally at Uhuru Park showing crowd turnout estimated at 15,000 supporters. Image captured at approximately 14:30 EAT from an altitude of 120 metres using a DJI Mavic 3 drone operated by licensed pilot. The photograph provides a comprehensive view of the rally grounds, stage setup, and attendee distribution for crowd size verification.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-001.jpg",
    captured_by: "James Mwangi",
    sha256_hash: "a3f2b8c4e5d6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0d91c",
    status: "verified",
    created_at: "2026-02-15T09:30:00Z",
    thumbnail_color: "bg-blue",
    file_size: "4.2 MB",
    location: { lat: -1.2870, lng: 36.8172 },
  },
  "ev-002": {
    id: "ev-002",
    title: "Ballot Counting — Langata Constituency",
    type: "video",
    county: "Nairobi",
    description:
      "Continuous video recording of ballot counting process at Langata Primary School polling station from 5:00 PM to 9:45 PM. Uninterrupted footage capturing the full counting process, with presiding officer, agents from all candidates, and IEBC officials visible throughout.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-002.mp4",
    captured_by: "Sarah Wanjiku",
    sha256_hash: "b7e4d2f1a8c3e6b9d5f0a2c4e7b1d3f6a9c2e5b8d0f3a6c9e1b4d7f0a3c6e9b2",
    status: "verified",
    created_at: "2026-02-20T17:15:00Z",
    thumbnail_color: "bg-purple",
    file_size: "1.8 GB",
    location: { lat: -1.3048, lng: 36.7627 },
  },
  "ev-003": {
    id: "ev-003",
    title: "Campaign T-Shirts Distribution Record",
    type: "document",
    county: "Nakuru",
    description:
      "Signed delivery note for 5,000 campaign T-shirts distributed to ward coordinators in Nakuru Town East. Includes serial numbers, recipient signatures, and National ID numbers of all 12 ward coordinators.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-003.pdf",
    captured_by: "Peter Ochieng",
    sha256_hash: "c1d8e5f2a9b6c3d0e7f4a1b8c5d2e9f6a3b0c7d4e1f8a5b2c9d6e3f0a7b4c1d8",
    status: "pending",
    created_at: "2026-02-22T11:00:00Z",
    thumbnail_color: "bg-orange",
    file_size: "892 KB",
  },
  "ev-004": {
    id: "ev-004",
    title: "Voter Intimidation Incident — Kisumu Central",
    type: "photo",
    county: "Kisumu",
    description:
      "Photographic evidence of unauthorized persons attempting to obstruct voters at Kisumu Central polling station entrance. Three unidentified individuals are visible blocking the gate. IEBC observer and police unit were notified immediately after capture.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-004.jpg",
    captured_by: "Agnes Atieno",
    sha256_hash: "d4e1f8a5b2c9d6e3f0a7b4c1d8e5f2a9b6c3d0e7f4a1b8c5d2e9f6a3b0c7d4e1",
    status: "flagged",
    created_at: "2026-02-18T14:45:00Z",
    thumbnail_color: "bg-red",
    file_size: "3.1 MB",
    location: { lat: -0.0917, lng: 34.7680 },
  },
  "ev-005": {
    id: "ev-005",
    title: "Campaign Billboard Permit — Mombasa",
    type: "document",
    county: "Mombasa",
    description:
      "County government approval permit for campaign billboards along Moi Avenue and Nyali Bridge, valid through election day.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-005.pdf",
    captured_by: "Hassan Omar",
    sha256_hash: "e7f4a1b8c5d2e9f6a3b0c7d4e1f8a5b2c9d6e3f0a7b4c1d8e5f2a9b6c3d0e7f4",
    status: "verified",
    created_at: "2026-02-10T08:20:00Z",
    thumbnail_color: "bg-green",
    file_size: "1.4 MB",
  },
  "ev-006": {
    id: "ev-006",
    title: "Town Hall Meeting Audio — Eldoret",
    type: "audio",
    county: "Uasin Gishu",
    description:
      "Full audio recording of candidate town hall meeting in Eldoret covering education policy, land reform, and healthcare access.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-006.mp3",
    captured_by: "Kipchoge Rono",
    sha256_hash: "f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1f4a7c0e3b6d9f2a5c8e1b4d7f0a3",
    status: "verified",
    created_at: "2026-02-12T16:30:00Z",
    thumbnail_color: "bg-navy",
    file_size: "78 MB",
    location: { lat: 0.5143, lng: 35.2698 },
  },
  "ev-007": {
    id: "ev-007",
    title: "Agent Deployment — Kiambu County Roster",
    type: "document",
    county: "Kiambu",
    description:
      "Signed deployment roster for 342 polling station agents across Kiambu County with national ID verification stamps.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-007.pdf",
    captured_by: "Grace Njeri",
    sha256_hash: "a1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1f4a7c0e3b6d9f2a5c8e1b4",
    status: "pending",
    created_at: "2026-02-24T10:00:00Z",
    thumbnail_color: "bg-blue",
    file_size: "2.3 MB",
  },
  "ev-008": {
    id: "ev-008",
    title: "Rally Stage Setup — Garissa Town",
    type: "photo",
    county: "Garissa",
    description:
      "Pre-event photograph documenting stage setup and branding compliance at Garissa Town rally grounds.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-008.jpg",
    captured_by: "Abdi Mohamed",
    sha256_hash: "b8d1f4a7c0e3b6d9f2a5c8e1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1",
    status: "verified",
    created_at: "2026-02-19T07:45:00Z",
    thumbnail_color: "bg-green",
    file_size: "5.6 MB",
    location: { lat: -0.4533, lng: 39.6461 },
  },
  "ev-009": {
    id: "ev-009",
    title: "Suspicious Campaign Expenditure Receipt",
    type: "document",
    county: "Narok",
    description:
      "Flagged receipt from Narok vendor showing possible inflated costs for campaign materials — KES 450,000 for 200 posters.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-009.pdf",
    captured_by: "David ole Sankale",
    sha256_hash: "c0e3b6d9f2a5c8e1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1f4a7c0e3",
    status: "flagged",
    created_at: "2026-02-23T13:20:00Z",
    thumbnail_color: "bg-red",
    file_size: "456 KB",
  },
  "ev-010": {
    id: "ev-010",
    title: "M-Pesa Donation Campaign — Feedback Video",
    type: "video",
    county: "Machakos",
    description:
      "Supporter testimonial video recorded during M-Pesa micro-donation campaign launch at Machakos People's Park.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-010.mp4",
    captured_by: "Mercy Mutua",
    sha256_hash: "d3f6a9c2e5b8d1f4a7c0e3b6d9f2a5c8e1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6",
    status: "pending",
    created_at: "2026-02-25T15:10:00Z",
    thumbnail_color: "bg-purple",
    file_size: "245 MB",
    location: { lat: -1.5177, lng: 37.2634 },
  },
};

const MOCK_CUSTODY_EVENTS: Record<string, CustodyEvent[]> = {
  "ev-001": [
    {
      id: "cust-1",
      action: "Captured",
      actor: "James Mwangi",
      timestamp: "2026-02-15T09:30:00Z",
      detail: "Original photograph captured via DJI Mavic 3 drone at Uhuru Park, Nairobi",
    },
    {
      id: "cust-2",
      action: "Uploaded",
      actor: "James Mwangi",
      timestamp: "2026-02-15T10:05:00Z",
      detail: "File uploaded to KURA360 Evidence Vault and SHA-256 hash generated",
    },
    {
      id: "cust-3",
      action: "Hash Verified",
      actor: "System",
      timestamp: "2026-02-15T10:06:00Z",
      detail: "Automated integrity check passed — hash matches original file",
    },
    {
      id: "cust-4",
      action: "Reviewed",
      actor: "Campaign Manager",
      timestamp: "2026-02-15T14:20:00Z",
      detail: "Evidence reviewed and approved by campaign compliance officer",
    },
    {
      id: "cust-5",
      action: "Verified",
      actor: "Mary Wambui",
      timestamp: "2026-02-16T09:00:00Z",
      detail: "Cross-referenced with rally attendance logs — status set to Verified",
    },
  ],
};

const MOCK_RELATED: Record<string, RelatedItem[]> = {
  "ev-001": [
    { id: "ev-002", title: "Ballot Counting — Langata Constituency", type: "video", thumbnail_color: "bg-purple" },
    { id: "ev-008", title: "Rally Stage Setup — Garissa Town", type: "photo", thumbnail_color: "bg-green" },
    { id: "ev-006", title: "Town Hall Meeting Audio — Eldoret", type: "audio", thumbnail_color: "bg-navy" },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const TYPE_ICONS: Record<EvidenceType, typeof Camera> = {
  photo: Camera,
  video: Video,
  document: FileText,
  audio: Mic,
};

const TYPE_LABELS: Record<EvidenceType, string> = {
  photo: "Photo",
  video: "Video",
  document: "Document",
  audio: "Audio",
};

const STATUS_CONFIG: Record<
  EvidenceStatus,
  { label: string; variant: "success" | "warning" | "danger"; Icon: typeof CheckCircle; color: string }
> = {
  verified: { label: "Verified", variant: "success", Icon: ShieldCheck, color: "text-green" },
  pending: { label: "Pending Review", variant: "warning", Icon: Clock, color: "text-orange" },
  flagged: { label: "Flagged", variant: "danger", Icon: AlertTriangle, color: "text-red" },
};

/* -------------------------------------------------------------------------- */
/*  Chain of Custody Timeline                                                 */
/* -------------------------------------------------------------------------- */

function CustodyTimeline({ events }: { events: CustodyEvent[] }) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-3 top-3 bottom-3 w-px bg-surface-border" />

      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={event.id} className="relative pl-8">
            {/* Dot */}
            <div
              className={cn(
                "absolute left-1.5 top-1 w-3 h-3 rounded-full border-2 border-white",
                index === events.length - 1 ? "bg-green" : "bg-blue"
              )}
            />

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-navy">{event.action}</span>
                <span className="text-[10px] text-text-tertiary">
                  {formatDate(event.timestamp)}
                </span>
              </div>
              <p className="text-[10px] text-text-secondary font-medium">{event.actor}</p>
              <p className="text-[10px] text-text-tertiary mt-0.5 leading-relaxed">
                {event.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Detail Page                                                               */
/* -------------------------------------------------------------------------- */

export default function EvidenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const item = MOCK_EVIDENCE[id];

  /* 404 fallback */
  if (!item) {
    return (
      <div className="text-center py-20">
        <Shield className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
        <h1 className="text-lg font-bold text-navy mb-2">Evidence Not Found</h1>
        <p className="text-sm text-text-secondary mb-4">
          The evidence item you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/evidence"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Evidence Vault
        </Link>
      </div>
    );
  }

  const TypeIcon = TYPE_ICONS[item.type];
  const statusConfig = STATUS_CONFIG[item.status];
  const StatusIcon = statusConfig.Icon;
  const custodyEvents = MOCK_CUSTODY_EVENTS[id] ?? [
    {
      id: "cust-default-1",
      action: "Uploaded",
      actor: item.captured_by,
      timestamp: item.created_at,
      detail: "File uploaded to KURA360 Evidence Vault and SHA-256 hash generated",
    },
    {
      id: "cust-default-2",
      action: "Hash Generated",
      actor: "System",
      timestamp: item.created_at,
      detail: "Automated SHA-256 integrity hash computed and stored",
    },
  ];
  const relatedItems = MOCK_RELATED[id] ?? [];

  return (
    <div>
      {/* Back link */}
      <Link
        href="/evidence"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue hover:underline mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Evidence Vault
      </Link>

      {/* Title + Status row */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-bold text-navy">{item.title}</h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            Evidence ID: {item.id}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge text={statusConfig.label} variant={statusConfig.variant} />
          <Badge text={TYPE_LABELS[item.type]} variant="neutral" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column: Preview + Description */}
        <div className="lg:col-span-2 space-y-4">
          {/* Preview area */}
          <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
            <div
              className={cn(
                "h-64 md:h-80 flex flex-col items-center justify-center",
                item.thumbnail_color
              )}
            >
              <TypeIcon className="w-16 h-16 text-white/70 mb-3" />
              <p className="text-white/80 text-sm font-semibold">
                {TYPE_LABELS[item.type]} Preview
              </p>
              <p className="text-white/50 text-xs mt-1">{item.file_size}</p>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-2 p-3 border-t border-surface-border">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue rounded-lg hover:bg-blue-light transition-colors">
                <Download className="w-3.5 h-3.5" />
                Download Original
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-secondary border border-surface-border rounded-lg hover:bg-surface-bg transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
                Export
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-secondary border border-surface-border rounded-lg hover:bg-surface-bg transition-colors">
                <Eye className="w-3.5 h-3.5" />
                Full Screen
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-surface-border p-4">
            <h2 className="text-sm font-bold text-navy mb-2">Description</h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Chain of Custody */}
          <div className="bg-white rounded-xl border border-surface-border p-4">
            <h2 className="text-sm font-bold text-navy mb-4">Chain of Custody</h2>
            <CustodyTimeline events={custodyEvents} />
          </div>
        </div>

        {/* Right column: Metadata + Verification + Related */}
        <div className="space-y-4">
          {/* Verification Status */}
          <div className="bg-white rounded-xl border border-surface-border p-4">
            <h2 className="text-sm font-bold text-navy mb-3">Verification Status</h2>
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                item.status === "verified" && "bg-green-pale",
                item.status === "pending" && "bg-orange-pale",
                item.status === "flagged" && "bg-red-pale"
              )}
            >
              <StatusIcon className={cn("w-6 h-6", statusConfig.color)} />
              <div>
                <p className={cn("text-xs font-bold", statusConfig.color)}>
                  {statusConfig.label}
                </p>
                <p className="text-[10px] text-text-tertiary mt-0.5">
                  {item.status === "verified" && "Integrity confirmed — hash matches original file"}
                  {item.status === "pending" && "Awaiting manual review by compliance officer"}
                  {item.status === "flagged" && "Flagged for investigation — potential integrity issue"}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-white rounded-xl border border-surface-border p-4">
            <h2 className="text-sm font-bold text-navy mb-3">Metadata</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-text-tertiary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
                    Type
                  </p>
                  <p className="text-xs text-text-primary font-medium capitalize">
                    {TYPE_LABELS[item.type]}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-text-tertiary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
                    County
                  </p>
                  <p className="text-xs text-text-primary font-medium">{item.county}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User className="w-3.5 h-3.5 text-text-tertiary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
                    Captured By
                  </p>
                  <p className="text-xs text-text-primary font-medium">{item.captured_by}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="w-3.5 h-3.5 text-text-tertiary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
                    Captured Date
                  </p>
                  <p className="text-xs text-text-primary font-medium">
                    {formatDate(item.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 text-text-tertiary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
                    File Size
                  </p>
                  <p className="text-xs text-text-primary font-medium">{item.file_size}</p>
                </div>
              </div>

              {item.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-text-tertiary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
                      GPS Coordinates
                    </p>
                    <p className="text-xs text-text-primary font-mono">
                      {item.location.lat.toFixed(4)}, {item.location.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SHA-256 Hash */}
          <div className="bg-white rounded-xl border border-surface-border p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-navy">SHA-256 Hash</h2>
              <button
                className="flex items-center gap-1 text-[10px] font-semibold text-blue hover:underline"
                title="Copy hash to clipboard"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            <div className="bg-surface-bg rounded-lg p-3">
              <p className="text-[10px] font-mono text-text-secondary break-all leading-relaxed">
                {item.sha256_hash}
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {item.status === "verified" ? (
                <>
                  <CheckCircle className="w-3 h-3 text-green" />
                  <span className="text-[10px] text-green font-semibold">
                    Integrity verified — hash matches original file
                  </span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-text-tertiary" />
                  <span className="text-[10px] text-text-tertiary font-semibold">
                    Verification pending
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Related Evidence */}
          {relatedItems.length > 0 && (
            <div className="bg-white rounded-xl border border-surface-border p-4">
              <h2 className="text-sm font-bold text-navy mb-3">Related Evidence</h2>
              <div className="space-y-2">
                {relatedItems.map((related) => {
                  const RelIcon = TYPE_ICONS[related.type];
                  return (
                    <Link
                      key={related.id}
                      href={`/evidence/${related.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-bg transition-colors"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                          related.thumbnail_color
                        )}
                      >
                        <RelIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-navy truncate">
                          {related.title}
                        </p>
                        <p className="text-[10px] text-text-tertiary capitalize">
                          {TYPE_LABELS[related.type]}
                        </p>
                      </div>
                      <Link2 className="w-3 h-3 text-text-tertiary ml-auto shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
