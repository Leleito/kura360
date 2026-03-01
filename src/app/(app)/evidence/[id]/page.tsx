'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Camera,
  Video,
  FileText,
  Mic,
  MapPin,
  Calendar,
  User,
  Shield,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Flag,
  Share2,
  Copy,
  Link2,
  HardDrive,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui';
import { FadeIn } from '@/components/premium';
import { cn, formatDate } from '@/lib/utils';
import { useCampaign } from '@/lib/campaign-context';
import { getEvidenceById } from '@/lib/actions/evidence';
import { getAuditLog } from '@/lib/actions/audit';
import type { Tables } from '@/types/database';
import type { EvidenceType, EvidenceStatus } from '@/lib/validators/evidence';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const TYPE_ICONS: Record<EvidenceType, typeof Camera> = {
  photo: Camera,
  video: Video,
  document: FileText,
  audio: Mic,
};

const TYPE_LABELS: Record<EvidenceType, string> = {
  photo: 'Photo',
  video: 'Video',
  document: 'Document',
  audio: 'Audio',
};

const TYPE_COLORS: Record<EvidenceType, string> = {
  photo: '#2E75B6',
  video: '#805AD5',
  document: '#1D6B3F',
  audio: '#ED8936',
};

const STATUS_CONFIG: Record<
  EvidenceStatus,
  { label: string; variant: 'success' | 'warning' | 'danger'; Icon: typeof CheckCircle; color: string; textColor: string; bgClass: string }
> = {
  verified: { label: 'Verified', variant: 'success', Icon: ShieldCheck, color: '#1D6B3F', textColor: 'text-[#1D6B3F]', bgClass: 'bg-[#1D6B3F]/10' },
  pending: { label: 'Pending Review', variant: 'warning', Icon: Clock, color: '#ED8936', textColor: 'text-[#ED8936]', bgClass: 'bg-[#ED8936]/10' },
  flagged: { label: 'Flagged', variant: 'danger', Icon: AlertTriangle, color: '#E53E3E', textColor: 'text-[#E53E3E]', bgClass: 'bg-[#E53E3E]/10' },
};

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_EVIDENCE: Record<string, EvidenceItem> = {
  'ev-001': {
    id: 'ev-001',
    title: 'Uhuru Park Rally -- Crowd Aerial View',
    type: 'photo',
    county: 'Nairobi',
    description:
      'Aerial drone photograph of campaign rally at Uhuru Park showing crowd turnout estimated at 15,000 supporters. Image captured at approximately 14:30 EAT from an altitude of 120 metres using a DJI Mavic 3 drone operated by licensed pilot. The photograph provides a comprehensive view of the rally grounds, stage setup, and attendee distribution for crowd size verification.',
    file_url: 'https://storage.kura360.co.ke/evidence/ev-001.jpg',
    captured_by: 'James Mwangi',
    sha256_hash: 'a3f2b8c4e5d6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0d91c',
    status: 'verified',
    created_at: '2026-02-15T09:30:00Z',
    thumbnail_color: 'bg-[#2E75B6]',
    file_size: '4.2 MB',
    location: { lat: -1.2870, lng: 36.8172 },
  },
  'ev-002': {
    id: 'ev-002',
    title: 'Ballot Counting -- Langata Constituency',
    type: 'video',
    county: 'Nairobi',
    description:
      'Continuous video recording of ballot counting process at Langata Primary School polling station from 5:00 PM to 9:45 PM.',
    file_url: 'https://storage.kura360.co.ke/evidence/ev-002.mp4',
    captured_by: 'Sarah Wanjiku',
    sha256_hash: 'b7e4d2f1a8c3e6b9d5f0a2c4e7b1d3f6a9c2e5b8d0f3a6c9e1b4d7f0a3c6e9b2',
    status: 'verified',
    created_at: '2026-02-20T17:15:00Z',
    thumbnail_color: 'bg-[#805AD5]',
    file_size: '1.8 GB',
    location: { lat: -1.3048, lng: 36.7627 },
  },
  'ev-003': {
    id: 'ev-003',
    title: 'Campaign T-Shirts Distribution Record',
    type: 'document',
    county: 'Nakuru',
    description: 'Signed delivery note for 5,000 campaign T-shirts distributed to ward coordinators in Nakuru Town East.',
    file_url: 'https://storage.kura360.co.ke/evidence/ev-003.pdf',
    captured_by: 'Peter Ochieng',
    sha256_hash: 'c1d8e5f2a9b6c3d0e7f4a1b8c5d2e9f6a3b0c7d4e1f8a5b2c9d6e3f0a7b4c1d8',
    status: 'pending',
    created_at: '2026-02-22T11:00:00Z',
    thumbnail_color: 'bg-[#1D6B3F]',
    file_size: '892 KB',
  },
  'ev-004': {
    id: 'ev-004',
    title: 'Voter Intimidation Incident -- Kisumu Central',
    type: 'photo',
    county: 'Kisumu',
    description: 'Photographic evidence of unauthorized persons attempting to obstruct voters at Kisumu Central polling station.',
    file_url: 'https://storage.kura360.co.ke/evidence/ev-004.jpg',
    captured_by: 'Agnes Atieno',
    sha256_hash: 'd4e1f8a5b2c9d6e3f0a7b4c1d8e5f2a9b6c3d0e7f4a1b8c5d2e9f6a3b0c7d4e1',
    status: 'flagged',
    created_at: '2026-02-18T14:45:00Z',
    thumbnail_color: 'bg-[#E53E3E]',
    file_size: '3.1 MB',
    location: { lat: -0.0917, lng: 34.7680 },
  },
  'ev-005': {
    id: 'ev-005',
    title: 'Campaign Billboard Permit -- Mombasa',
    type: 'document',
    county: 'Mombasa',
    description: 'County government approval permit for campaign billboards along Moi Avenue and Nyali Bridge.',
    file_url: 'https://storage.kura360.co.ke/evidence/ev-005.pdf',
    captured_by: 'Hassan Omar',
    sha256_hash: 'e7f4a1b8c5d2e9f6a3b0c7d4e1f8a5b2c9d6e3f0a7b4c1d8e5f2a9b6c3d0e7f4',
    status: 'verified',
    created_at: '2026-02-10T08:20:00Z',
    thumbnail_color: 'bg-[#1D6B3F]',
    file_size: '1.4 MB',
  },
  'ev-006': {
    id: 'ev-006',
    title: 'Town Hall Meeting Audio -- Eldoret',
    type: 'audio',
    county: 'Uasin Gishu',
    description: 'Full audio recording of candidate town hall meeting in Eldoret covering education policy.',
    file_url: 'https://storage.kura360.co.ke/evidence/ev-006.mp3',
    captured_by: 'Kipchoge Rono',
    sha256_hash: 'f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1f4a7c0e3b6d9f2a5c8e1b4d7f0a3',
    status: 'verified',
    created_at: '2026-02-12T16:30:00Z',
    thumbnail_color: 'bg-[#ED8936]',
    file_size: '78 MB',
    location: { lat: 0.5143, lng: 35.2698 },
  },
  'ev-007': {
    id: 'ev-007',
    title: 'Agent Deployment -- Kiambu County Roster',
    type: 'document',
    county: 'Kiambu',
    description: 'Signed deployment roster for 342 polling station agents across Kiambu County.',
    file_url: 'https://storage.kura360.co.ke/evidence/ev-007.pdf',
    captured_by: 'Grace Njeri',
    sha256_hash: 'a1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1f4a7c0e3b6d9f2a5c8e1b4',
    status: 'pending',
    created_at: '2026-02-24T10:00:00Z',
    thumbnail_color: 'bg-[#2E75B6]',
    file_size: '2.3 MB',
  },
  'ev-008': {
    id: 'ev-008',
    title: 'Rally Stage Setup -- Garissa Town',
    type: 'photo',
    county: 'Garissa',
    description: 'Pre-event photograph documenting stage setup and branding compliance at Garissa Town rally grounds.',
    file_url: 'https://storage.kura360.co.ke/evidence/ev-008.jpg',
    captured_by: 'Abdi Mohamed',
    sha256_hash: 'b8d1f4a7c0e3b6d9f2a5c8e1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1',
    status: 'verified',
    created_at: '2026-02-19T07:45:00Z',
    thumbnail_color: 'bg-[#2E75B6]',
    file_size: '5.6 MB',
    location: { lat: -0.4533, lng: 39.6461 },
  },
  'ev-009': {
    id: 'ev-009',
    title: 'Suspicious Campaign Expenditure Receipt',
    type: 'document',
    county: 'Narok',
    description: 'Flagged receipt showing possible inflated costs for campaign materials.',
    file_url: 'https://storage.kura360.co.ke/evidence/ev-009.pdf',
    captured_by: 'David ole Sankale',
    sha256_hash: 'c0e3b6d9f2a5c8e1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1f4a7c0e3',
    status: 'flagged',
    created_at: '2026-02-23T13:20:00Z',
    thumbnail_color: 'bg-[#E53E3E]',
    file_size: '456 KB',
  },
  'ev-010': {
    id: 'ev-010',
    title: 'M-Pesa Donation Campaign -- Feedback Video',
    type: 'video',
    county: 'Machakos',
    description: 'Supporter testimonial video recorded during M-Pesa micro-donation campaign launch at Machakos People\'s Park.',
    file_url: 'https://storage.kura360.co.ke/evidence/ev-010.mp4',
    captured_by: 'Mercy Mutua',
    sha256_hash: 'd3f6a9c2e5b8d1f4a7c0e3b6d9f2a5c8e1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6',
    status: 'pending',
    created_at: '2026-02-25T15:10:00Z',
    thumbnail_color: 'bg-[#805AD5]',
    file_size: '245 MB',
    location: { lat: -1.5177, lng: 37.2634 },
  },
};

const MOCK_CUSTODY_EVENTS: Record<string, CustodyEvent[]> = {
  'ev-001': [
    { id: 'cust-1', action: 'Captured', actor: 'James Mwangi', timestamp: '2026-02-15T09:30:00Z', detail: 'Original photograph captured via DJI Mavic 3 drone at Uhuru Park, Nairobi' },
    { id: 'cust-2', action: 'Uploaded', actor: 'James Mwangi', timestamp: '2026-02-15T10:05:00Z', detail: 'File uploaded to KURA360 Evidence Vault and SHA-256 hash generated' },
    { id: 'cust-3', action: 'Hash Verified', actor: 'System', timestamp: '2026-02-15T10:06:00Z', detail: 'Automated integrity check passed -- hash matches original file' },
    { id: 'cust-4', action: 'Reviewed', actor: 'Campaign Manager', timestamp: '2026-02-15T14:20:00Z', detail: 'Evidence reviewed and approved by campaign compliance officer' },
    { id: 'cust-5', action: 'Verified', actor: 'Mary Wambui', timestamp: '2026-02-16T09:00:00Z', detail: 'Cross-referenced with rally attendance logs -- status set to Verified' },
  ],
};

const MOCK_RELATED: Record<string, RelatedItem[]> = {
  'ev-001': [
    { id: 'ev-002', title: 'Ballot Counting -- Langata Constituency', type: 'video', thumbnail_color: 'bg-[#805AD5]' },
    { id: 'ev-008', title: 'Rally Stage Setup -- Garissa Town', type: 'photo', thumbnail_color: 'bg-[#2E75B6]' },
    { id: 'ev-006', title: 'Town Hall Meeting Audio -- Eldoret', type: 'audio', thumbnail_color: 'bg-[#ED8936]' },
  ],
};

// ---------------------------------------------------------------------------
// Helpers – map DB row to UI types
// ---------------------------------------------------------------------------

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return 'Unknown';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

const TYPE_THUMBNAIL_COLORS: Record<string, string> = {
  photo: 'bg-[#2E75B6]',
  video: 'bg-[#805AD5]',
  document: 'bg-[#1D6B3F]',
  audio: 'bg-[#ED8936]',
};

function mapDbToEvidenceItem(row: Tables<'evidence_items'>): EvidenceItem {
  return {
    id: row.id,
    title: row.title,
    type: row.type as EvidenceType,
    county: '', // not stored in DB – will show as empty
    description: row.description ?? '',
    file_url: row.file_url,
    captured_by: row.agent_id ?? '',
    sha256_hash: row.sha256_hash,
    status: row.verification_status as EvidenceStatus,
    created_at: row.captured_at ?? row.created_at,
    thumbnail_color: TYPE_THUMBNAIL_COLORS[row.type] ?? 'bg-[#2E75B6]',
    file_size: formatBytes(row.file_size_bytes),
    location:
      row.gps_lat != null && row.gps_lon != null
        ? { lat: row.gps_lat, lng: row.gps_lon }
        : undefined,
  };
}

function mapAuditToCustody(logs: Tables<'audit_log'>[]): CustodyEvent[] {
  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    actor: log.user_id,
    timestamp: log.created_at,
    detail: `${log.action} on ${log.table_name}${log.record_id ? ` (${log.record_id})` : ''}`,
  }));
}

// ---------------------------------------------------------------------------
// Chain of Custody Timeline
// ---------------------------------------------------------------------------

function CustodyTimeline({ events }: { events: CustodyEvent[] }) {
  return (
    <div className="relative">
      <div className="absolute left-3.5 top-3 bottom-3 w-px bg-surface-border" />
      <div className="space-y-5">
        {events.map((event, index) => (
          <div key={event.id} className="relative pl-10">
            {/* Dot */}
            <div
              className={cn(
                'absolute left-2 top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm',
                index === events.length - 1 ? 'bg-[#1D6B3F]' : 'bg-[#2E75B6]'
              )}
            />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-navy">{event.action}</span>
                <span className="text-[10px] text-text-tertiary">
                  {formatDate(event.timestamp)}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary font-medium">{event.actor}</p>
              <p className="text-[11px] text-text-tertiary mt-0.5 leading-relaxed">
                {event.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail Page
// ---------------------------------------------------------------------------

export default function EvidenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { campaign } = useCampaign();
  const [hashCopied, setHashCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<EvidenceItem | null>(MOCK_EVIDENCE[id] ?? null);
  const [custodyEvents, setCustodyEvents] = useState<CustodyEvent[]>(
    MOCK_CUSTODY_EVENTS[id] ?? []
  );

  // Fetch real evidence data from Supabase
  const fetchEvidence = useCallback(async () => {
    // For mock IDs, use the hardcoded data directly
    if (MOCK_EVIDENCE[id]) {
      setItem(MOCK_EVIDENCE[id]);
      setCustodyEvents(
        MOCK_CUSTODY_EVENTS[id] ?? [
          { id: 'cust-default-1', action: 'Uploaded', actor: MOCK_EVIDENCE[id].captured_by, timestamp: MOCK_EVIDENCE[id].created_at, detail: 'File uploaded to KURA360 Evidence Vault and SHA-256 hash generated' },
          { id: 'cust-default-2', action: 'Hash Generated', actor: 'System', timestamp: MOCK_EVIDENCE[id].created_at, detail: 'Automated SHA-256 integrity hash computed and stored' },
        ]
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch evidence item from DB
      const { data: dbItem, error } = await getEvidenceById(id);
      if (error || !dbItem) {
        setItem(null);
        setLoading(false);
        return;
      }

      setItem(mapDbToEvidenceItem(dbItem));

      // Fetch chain of custody from audit_log
      if (campaign?.id) {
        const { data: auditLogs } = await getAuditLog(campaign.id, {
          tableName: 'evidence_items',
          recordId: id,
        });
        if (auditLogs && auditLogs.length > 0) {
          setCustodyEvents(mapAuditToCustody(auditLogs));
        } else {
          // Default custody events for real items with no audit trail yet
          setCustodyEvents([
            { id: 'cust-default-1', action: 'Uploaded', actor: dbItem.agent_id ?? 'Unknown', timestamp: dbItem.created_at, detail: 'File uploaded to KURA360 Evidence Vault and SHA-256 hash generated' },
            { id: 'cust-default-2', action: 'Hash Generated', actor: 'System', timestamp: dbItem.created_at, detail: 'Automated SHA-256 integrity hash computed and stored' },
          ]);
        }
      }
    } catch (err) {
      console.error('[EvidenceDetail] Failed to fetch evidence:', err);
    } finally {
      setLoading(false);
    }
  }, [id, campaign?.id]);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const handleCopyHash = () => {
    if (!item) return;
    navigator.clipboard.writeText(item.sha256_hash);
    setHashCopied(true);
    setTimeout(() => setHashCopied(false), 2000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue animate-spin mb-4" />
        <p className="text-sm text-text-secondary font-medium">Loading evidence...</p>
      </div>
    );
  }

  // 404 fallback
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
  const typeColor = TYPE_COLORS[item.type];
  const relatedItems = MOCK_RELATED[id] ?? [];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <FadeIn direction="left" duration={0.3}>
        <Link
          href="/evidence"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-navy transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Evidence Vault
        </Link>
      </FadeIn>

      {/* Title + Status row */}
      <FadeIn direction="up" duration={0.4}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-navy">{item.title}</h1>
            <p className="text-xs text-text-tertiary mt-1 font-mono">
              Evidence ID: {item.id}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge text={statusConfig.label} variant={statusConfig.variant} />
            <Badge text={TYPE_LABELS[item.type]} variant="neutral" />
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column: Preview + Description + Chain of Custody */}
        <div className="lg:col-span-2 space-y-5">
          {/* Preview area */}
          <FadeIn delay={0.1} direction="up">
            <div className="bg-white rounded-2xl border border-surface-border overflow-hidden">
              <div className={cn('h-64 md:h-80 flex flex-col items-center justify-center relative', item.thumbnail_color)}>
                <TypeIcon className="w-16 h-16 text-white/60 mb-3" />
                <p className="text-white/80 text-sm font-semibold">
                  {TYPE_LABELS[item.type]} Preview
                </p>
                <p className="text-white/50 text-xs mt-1">{item.file_size}</p>
                {/* Type color indicator */}
                <div
                  className="absolute top-4 left-4 px-2.5 py-1 rounded-full text-[10px] font-bold text-white backdrop-blur-sm"
                  style={{ backgroundColor: `${typeColor}CC` }}
                >
                  {TYPE_LABELS[item.type]}
                </div>
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-2 p-4 border-t border-surface-border">
                <button className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#1D6B3F] rounded-lg hover:bg-[#1D6B3F]/90 transition-colors">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verify
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#E53E3E] border border-[#E53E3E]/30 rounded-lg hover:bg-[#E53E3E]/5 transition-colors">
                  <Flag className="w-3.5 h-3.5" />
                  Flag
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-text-secondary border border-surface-border rounded-lg hover:bg-surface-bg transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-text-secondary border border-surface-border rounded-lg hover:bg-surface-bg transition-colors">
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>
              </div>
            </div>
          </FadeIn>

          {/* Description */}
          <FadeIn delay={0.15} direction="up">
            <div className="bg-white rounded-xl border border-surface-border p-5">
              <h2 className="text-sm font-bold text-navy mb-2">Description</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {item.description}
              </p>
            </div>
          </FadeIn>

          {/* Chain of Custody */}
          <FadeIn delay={0.2} direction="up">
            <div className="bg-white rounded-xl border border-surface-border p-5">
              <h2 className="text-sm font-bold text-navy mb-4">Chain of Custody</h2>
              <CustodyTimeline events={custodyEvents} />
            </div>
          </FadeIn>
        </div>

        {/* Right column: Verification + Metadata + Hash + Related */}
        <div className="space-y-5">
          {/* Verification Status */}
          <FadeIn delay={0.1} direction="up">
            <div className="bg-white rounded-xl border border-surface-border p-5">
              <h2 className="text-sm font-bold text-navy mb-3">Verification Status</h2>
              <div className={cn('flex items-center gap-3 p-4 rounded-xl', statusConfig.bgClass)}>
                <StatusIcon className={cn('w-7 h-7', statusConfig.textColor)} />
                <div>
                  <p className={cn('text-sm font-bold', statusConfig.textColor)}>
                    {statusConfig.label}
                  </p>
                  <p className="text-[11px] text-text-tertiary mt-0.5">
                    {item.status === 'verified' && 'Integrity confirmed -- hash matches original file'}
                    {item.status === 'pending' && 'Awaiting manual review by compliance officer'}
                    {item.status === 'flagged' && 'Flagged for investigation -- potential integrity issue'}
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Metadata Card */}
          <FadeIn delay={0.15} direction="up">
            <div className="bg-white rounded-xl border border-surface-border p-5">
              <h2 className="text-sm font-bold text-navy mb-3">Metadata</h2>
              <div className="space-y-3.5">
                {[
                  { icon: FileText, label: 'Type', value: TYPE_LABELS[item.type] },
                  ...(item.county ? [{ icon: MapPin, label: 'County', value: item.county }] : []),
                  ...(item.captured_by ? [{ icon: User, label: 'Captured By', value: item.captured_by }] : []),
                  { icon: Calendar, label: 'Captured Date', value: formatDate(item.created_at) },
                  { icon: HardDrive, label: 'File Size', value: item.file_size },
                ].map((meta) => (
                  <div key={meta.label} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-surface-bg flex items-center justify-center shrink-0">
                      <meta.icon className="w-3.5 h-3.5 text-text-tertiary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
                        {meta.label}
                      </p>
                      <p className="text-xs text-text-primary font-medium mt-0.5">{meta.value}</p>
                    </div>
                  </div>
                ))}

                {item.location && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-surface-bg flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-text-tertiary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
                        GPS Coordinates
                      </p>
                      <p className="text-xs text-text-primary font-mono mt-0.5">
                        {item.location.lat.toFixed(4)}, {item.location.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>

          {/* SHA-256 Hash */}
          <FadeIn delay={0.2} direction="up">
            <div className="bg-white rounded-xl border border-surface-border p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-navy">SHA-256 Hash</h2>
                <button
                  onClick={handleCopyHash}
                  className="flex items-center gap-1 text-[10px] font-semibold text-blue hover:text-blue/80 transition-colors"
                  title="Copy hash to clipboard"
                >
                  <Copy className="w-3 h-3" />
                  {hashCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-[#0F2A44] rounded-lg p-3.5">
                <p className="text-[11px] font-mono text-[#A0D9B4] break-all leading-relaxed tracking-wide">
                  {item.sha256_hash}
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-2.5">
                {item.status === 'verified' ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-[#1D6B3F]" />
                    <span className="text-[11px] text-[#1D6B3F] font-semibold">
                      Integrity verified -- hash matches original file
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-text-tertiary" />
                    <span className="text-[11px] text-text-tertiary font-semibold">
                      Verification pending
                    </span>
                  </>
                )}
              </div>
            </div>
          </FadeIn>

          {/* Related Evidence */}
          {relatedItems.length > 0 && (
            <FadeIn delay={0.25} direction="up">
              <div className="bg-white rounded-xl border border-surface-border p-5">
                <h2 className="text-sm font-bold text-navy mb-3">Related Evidence</h2>
                <div className="space-y-2.5">
                  {relatedItems.map((related) => {
                    const RelIcon = TYPE_ICONS[related.type];
                    return (
                      <Link
                        key={related.id}
                        href={`/evidence/${related.id}`}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-bg transition-colors group"
                      >
                        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', related.thumbnail_color)}>
                          <RelIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-navy truncate group-hover:text-blue transition-colors">
                            {related.title}
                          </p>
                          <p className="text-[10px] text-text-tertiary capitalize">
                            {TYPE_LABELS[related.type]}
                          </p>
                        </div>
                        <Link2 className="w-3.5 h-3.5 text-text-tertiary ml-auto shrink-0 group-hover:text-blue transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </div>
  );
}
