"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Upload,
  LayoutGrid,
  List,
  Search,
  CheckCircle,
  X,
  Camera,
  Video,
  FileText,
  Mic,
  MapPin,
  Calendar,
  User,
  Hash,
} from "lucide-react";
import { cn, formatDate, formatDateShort, truncate } from "@/lib/utils";
import type { EvidenceType, EvidenceStatus, KenyaCounty } from "@/lib/validators/evidence";
import { EVIDENCE_TYPES, EVIDENCE_STATUSES, KENYA_COUNTIES } from "@/lib/validators/evidence";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface EvidenceItem {
  id: string;
  title: string;
  type: EvidenceType;
  county: KenyaCounty;
  description: string;
  file_url: string;
  captured_by: string;
  sha256_hash: string;
  status: EvidenceStatus;
  created_at: string;
  thumbnail_color: string;
}

/* -------------------------------------------------------------------------- */
/*  Mock Data — 10 realistic Kenyan election evidence items                   */
/* -------------------------------------------------------------------------- */

const MOCK_EVIDENCE: EvidenceItem[] = [
  {
    id: "ev-001",
    title: "Uhuru Park Rally — Crowd Aerial View",
    type: "photo",
    county: "Nairobi",
    description: "Aerial drone photograph of campaign rally at Uhuru Park showing crowd turnout estimated at 15,000 supporters.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-001.jpg",
    captured_by: "James Mwangi",
    sha256_hash: "a3f2b8c4e5d6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0d91c",
    status: "verified",
    created_at: "2026-02-15T09:30:00Z",
    thumbnail_color: "bg-blue",
  },
  {
    id: "ev-002",
    title: "Ballot Counting — Langata Constituency",
    type: "video",
    county: "Nairobi",
    description: "Continuous video recording of ballot counting process at Langata Primary School polling station from 5:00 PM to 9:45 PM.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-002.mp4",
    captured_by: "Sarah Wanjiku",
    sha256_hash: "b7e4d2f1a8c3e6b9d5f0a2c4e7b1d3f6a9c2e5b8d0f3a6c9e1b4d7f0a3c6e9b2",
    status: "verified",
    created_at: "2026-02-20T17:15:00Z",
    thumbnail_color: "bg-purple",
  },
  {
    id: "ev-003",
    title: "Campaign T-Shirts Distribution Record",
    type: "document",
    county: "Nakuru",
    description: "Signed delivery note for 5,000 campaign T-shirts distributed to ward coordinators in Nakuru Town East.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-003.pdf",
    captured_by: "Peter Ochieng",
    sha256_hash: "c1d8e5f2a9b6c3d0e7f4a1b8c5d2e9f6a3b0c7d4e1f8a5b2c9d6e3f0a7b4c1d8",
    status: "pending",
    created_at: "2026-02-22T11:00:00Z",
    thumbnail_color: "bg-orange",
  },
  {
    id: "ev-004",
    title: "Voter Intimidation Incident — Kisumu Central",
    type: "photo",
    county: "Kisumu",
    description: "Photographic evidence of unauthorized persons attempting to obstruct voters at Kisumu Central polling station entrance.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-004.jpg",
    captured_by: "Agnes Atieno",
    sha256_hash: "d4e1f8a5b2c9d6e3f0a7b4c1d8e5f2a9b6c3d0e7f4a1b8c5d2e9f6a3b0c7d4e1",
    status: "flagged",
    created_at: "2026-02-18T14:45:00Z",
    thumbnail_color: "bg-red",
  },
  {
    id: "ev-005",
    title: "Campaign Billboard Permit — Mombasa",
    type: "document",
    county: "Mombasa",
    description: "County government approval permit for campaign billboards along Moi Avenue and Nyali Bridge, valid through election day.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-005.pdf",
    captured_by: "Hassan Omar",
    sha256_hash: "e7f4a1b8c5d2e9f6a3b0c7d4e1f8a5b2c9d6e3f0a7b4c1d8e5f2a9b6c3d0e7f4",
    status: "verified",
    created_at: "2026-02-10T08:20:00Z",
    thumbnail_color: "bg-green",
  },
  {
    id: "ev-006",
    title: "Town Hall Meeting Audio — Eldoret",
    type: "audio",
    county: "Uasin Gishu",
    description: "Full audio recording of candidate town hall meeting in Eldoret covering education policy, land reform, and healthcare access.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-006.mp3",
    captured_by: "Kipchoge Rono",
    sha256_hash: "f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1f4a7c0e3b6d9f2a5c8e1b4d7f0a3",
    status: "verified",
    created_at: "2026-02-12T16:30:00Z",
    thumbnail_color: "bg-navy",
  },
  {
    id: "ev-007",
    title: "Agent Deployment — Kiambu County Roster",
    type: "document",
    county: "Kiambu",
    description: "Signed deployment roster for 342 polling station agents across Kiambu County with national ID verification stamps.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-007.pdf",
    captured_by: "Grace Njeri",
    sha256_hash: "a1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1f4a7c0e3b6d9f2a5c8e1b4",
    status: "pending",
    created_at: "2026-02-24T10:00:00Z",
    thumbnail_color: "bg-blue",
  },
  {
    id: "ev-008",
    title: "Rally Stage Setup — Garissa Town",
    type: "photo",
    county: "Garissa",
    description: "Pre-event photograph documenting stage setup and branding compliance at Garissa Town rally grounds.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-008.jpg",
    captured_by: "Abdi Mohamed",
    sha256_hash: "b8d1f4a7c0e3b6d9f2a5c8e1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1",
    status: "verified",
    created_at: "2026-02-19T07:45:00Z",
    thumbnail_color: "bg-green",
  },
  {
    id: "ev-009",
    title: "Suspicious Campaign Expenditure Receipt",
    type: "document",
    county: "Narok",
    description: "Flagged receipt from Narok vendor showing possible inflated costs for campaign materials — KES 450,000 for 200 posters.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-009.pdf",
    captured_by: "David ole Sankale",
    sha256_hash: "c0e3b6d9f2a5c8e1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1f4a7c0e3",
    status: "flagged",
    created_at: "2026-02-23T13:20:00Z",
    thumbnail_color: "bg-red",
  },
  {
    id: "ev-010",
    title: "M-Pesa Donation Campaign — Feedback Video",
    type: "video",
    county: "Machakos",
    description: "Supporter testimonial video recorded during M-Pesa micro-donation campaign launch at Machakos People's Park.",
    file_url: "https://storage.kura360.co.ke/evidence/ev-010.mp4",
    captured_by: "Mercy Mutua",
    sha256_hash: "d3f6a9c2e5b8d1f4a7c0e3b6d9f2a5c8e1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6",
    status: "pending",
    created_at: "2026-02-25T15:10:00Z",
    thumbnail_color: "bg-purple",
  },
];

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

const STATUS_BADGE: Record<EvidenceStatus, { label: string; variant: "success" | "warning" | "danger" }> = {
  verified: { label: "Verified", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  flagged: { label: "Flagged", variant: "danger" },
};

function truncateHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

/* -------------------------------------------------------------------------- */
/*  Upload Modal                                                              */
/* -------------------------------------------------------------------------- */

function UploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-surface-border">
          <h2 className="text-sm font-bold text-navy">Upload Evidence</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-surface-bg text-text-tertiary"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form className="p-4 space-y-4" onSubmit={(e) => e.preventDefault()}>
          {/* Title */}
          <div>
            <label htmlFor="upload-title" className="block text-xs font-semibold text-text-secondary mb-1">
              Title <span className="text-red">*</span>
            </label>
            <input
              id="upload-title"
              type="text"
              placeholder="e.g. Rally Photo — Uhuru Park"
              className="w-full px-3 py-2 text-sm border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue"
            />
          </div>

          {/* Type + County row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="upload-type" className="block text-xs font-semibold text-text-secondary mb-1">
                Type <span className="text-red">*</span>
              </label>
              <select
                id="upload-type"
                className="w-full px-3 py-2 text-sm border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue bg-white"
              >
                <option value="">Select type</option>
                {EVIDENCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="upload-county" className="block text-xs font-semibold text-text-secondary mb-1">
                County <span className="text-red">*</span>
              </label>
              <select
                id="upload-county"
                className="w-full px-3 py-2 text-sm border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue bg-white"
              >
                <option value="">Select county</option>
                {KENYA_COUNTIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="upload-description" className="block text-xs font-semibold text-text-secondary mb-1">
              Description
            </label>
            <textarea
              id="upload-description"
              rows={3}
              placeholder="Describe the evidence and the context in which it was captured..."
              className="w-full px-3 py-2 text-sm border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue resize-none"
            />
          </div>

          {/* File upload area */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              File <span className="text-red">*</span>
            </label>
            <div className="border-2 border-dashed border-surface-border rounded-lg p-6 text-center hover:border-blue/40 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
              <p className="text-xs text-text-secondary font-medium">
                Drag and drop or click to browse
              </p>
              <p className="text-[10px] text-text-tertiary mt-1">
                Photos, videos, documents, or audio files (max 50 MB)
              </p>
              <input type="file" className="hidden" accept="image/*,video/*,audio/*,.pdf,.doc,.docx" />
            </div>
          </div>

          {/* Captured by */}
          <div>
            <label htmlFor="upload-captured-by" className="block text-xs font-semibold text-text-secondary mb-1">
              Captured By <span className="text-red">*</span>
            </label>
            <input
              id="upload-captured-by"
              type="text"
              placeholder="e.g. James Mwangi"
              className="w-full px-3 py-2 text-sm border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-text-secondary rounded-lg hover:bg-surface-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-green rounded-lg hover:bg-green-light transition-colors"
            >
              Upload & Hash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Gallery Card                                                              */
/* -------------------------------------------------------------------------- */

function GalleryCard({ item }: { item: EvidenceItem }) {
  const TypeIcon = TYPE_ICONS[item.type];
  const statusInfo = STATUS_BADGE[item.status];

  return (
    <Link
      href={`/evidence/${item.id}`}
      className="bg-white rounded-xl border border-surface-border overflow-hidden hover:shadow-md transition-shadow group"
    >
      {/* Thumbnail placeholder */}
      <div className={cn("relative h-36 flex items-center justify-center", item.thumbnail_color)}>
        <TypeIcon className="w-10 h-10 text-white/80" />
        {item.status === "verified" && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green" />
          </div>
        )}
        {item.status === "flagged" && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red" />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-xs font-bold text-navy leading-snug group-hover:text-blue transition-colors line-clamp-2">
            {item.title}
          </h3>
          <Badge text={statusInfo.label} variant={statusInfo.variant} />
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary mb-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDateShort(item.created_at)}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary mb-1">
          <MapPin className="w-3 h-3" />
          <span>{item.county}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary font-mono">
          <Hash className="w-3 h-3" />
          <span>{truncateHash(item.sha256_hash)}</span>
        </div>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  List View Row (table-like)                                                */
/* -------------------------------------------------------------------------- */

function ListRow({ item }: { item: EvidenceItem }) {
  const TypeIcon = TYPE_ICONS[item.type];
  const statusInfo = STATUS_BADGE[item.status];

  return (
    <Link
      href={`/evidence/${item.id}`}
      className="grid grid-cols-[1fr_80px_90px_110px_90px_100px_80px] items-center gap-2 px-4 py-3 border-b border-surface-border hover:bg-surface-bg/50 transition-colors text-xs"
    >
      {/* Title */}
      <div className="flex items-center gap-2 min-w-0">
        <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0", item.thumbnail_color)}>
          <TypeIcon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-semibold text-navy truncate">{item.title}</span>
      </div>

      {/* Type */}
      <span className="text-text-secondary capitalize">{TYPE_LABELS[item.type]}</span>

      {/* County */}
      <span className="text-text-secondary truncate">{item.county}</span>

      {/* Captured By */}
      <span className="text-text-secondary truncate">{item.captured_by}</span>

      {/* Date */}
      <span className="text-text-tertiary">{formatDateShort(item.created_at)}</span>

      {/* Hash */}
      <span className="font-mono text-text-tertiary text-[10px]">{truncateHash(item.sha256_hash)}</span>

      {/* Status */}
      <Badge text={statusInfo.label} variant={statusInfo.variant} />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                 */
/* -------------------------------------------------------------------------- */

export default function EvidencePage() {
  const [viewMode, setViewMode] = useState<"gallery" | "list">("gallery");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [countyFilter, setCountyFilter] = useState<string>("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  /* Computed counts */
  const totalCount = MOCK_EVIDENCE.length;
  const verifiedCount = MOCK_EVIDENCE.filter((e) => e.status === "verified").length;
  const pendingCount = MOCK_EVIDENCE.filter((e) => e.status === "pending").length;
  const flaggedCount = MOCK_EVIDENCE.filter((e) => e.status === "flagged").length;

  /* Filter evidence */
  const filteredEvidence = useMemo(() => {
    return MOCK_EVIDENCE.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.captured_by.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sha256_hash.includes(searchQuery.toLowerCase());

      const matchesType = !typeFilter || item.type === typeFilter;
      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesCounty = !countyFilter || item.county === countyFilter;

      return matchesSearch && matchesType && matchesStatus && matchesCounty;
    });
  }, [searchQuery, typeFilter, statusFilter, countyFilter]);

  /* Unique counties from mock data for the filter dropdown */
  const availableCounties = useMemo(() => {
    const counties = new Set(MOCK_EVIDENCE.map((e) => e.county));
    return Array.from(counties).sort();
  }, []);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-navy">Evidence Vault</h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            Tamper-proof evidence with SHA-256 integrity verification
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-green text-white text-xs font-bold rounded-lg hover:bg-green-light transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Evidence
        </button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard
          label="Total Evidence"
          value={totalCount.toLocaleString()}
          sub="All items in vault"
          variant="navy"
        />
        <StatCard
          label="Verified"
          value={verifiedCount.toLocaleString()}
          sub={`${Math.round((verifiedCount / totalCount) * 100)}% of total`}
          variant="green"
        />
        <StatCard
          label="Pending Review"
          value={pendingCount.toLocaleString()}
          sub="Awaiting verification"
          variant="orange"
        />
        <StatCard
          label="Flagged"
          value={flaggedCount.toLocaleString()}
          sub="Requires investigation"
          variant="red"
        />
      </div>

      {/* Filters + View toggle */}
      <div className="bg-white rounded-xl border border-surface-border p-3 mb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, hash..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-surface-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue"
          >
            <option value="">All Types</option>
            {EVIDENCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-surface-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue"
          >
            <option value="">All Statuses</option>
            {EVIDENCE_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          {/* County filter */}
          <select
            value={countyFilter}
            onChange={(e) => setCountyFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-surface-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue"
          >
            <option value="">All Counties</option>
            {availableCounties.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* View mode toggle */}
          <div className="flex items-center border border-surface-border rounded-lg overflow-hidden shrink-0">
            <button
              onClick={() => setViewMode("gallery")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "gallery"
                  ? "bg-navy text-white"
                  : "text-text-tertiary hover:bg-surface-bg"
              )}
              aria-label="Gallery view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "list"
                  ? "bg-navy text-white"
                  : "text-text-tertiary hover:bg-surface-bg"
              )}
              aria-label="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-[10px] text-text-tertiary mb-3 font-medium">
        Showing {filteredEvidence.length} of {totalCount} evidence items
      </p>

      {/* Gallery View */}
      {viewMode === "gallery" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEvidence.map((item) => (
            <GalleryCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_80px_90px_110px_90px_100px_80px] gap-2 px-4 py-2.5 border-b border-surface-border bg-surface-bg/50 text-[10px] font-bold text-text-tertiary uppercase tracking-wide">
            <span>Title</span>
            <span>Type</span>
            <span>County</span>
            <span>Captured By</span>
            <span>Date</span>
            <span>Hash</span>
            <span>Status</span>
          </div>

          {/* Table rows */}
          {filteredEvidence.map((item) => (
            <ListRow key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredEvidence.length === 0 && (
        <div className="bg-white rounded-xl border border-surface-border p-12 text-center">
          <Shield className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
          <p className="text-sm font-semibold text-navy mb-1">No evidence found</p>
          <p className="text-xs text-text-tertiary">
            Try adjusting your filters or upload new evidence.
          </p>
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </div>
  );
}
