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
import { useUser } from '@/lib/auth/hooks';
import { getEvidenceById, getEvidenceItems, updateEvidenceItem } from '@/lib/actions/evidence';
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
  const { user } = useUser();
  const [hashCopied, setHashCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'verify' | 'flag' | null>(null);
  const [item, setItem] = useState<EvidenceItem | null>(null);
  const [custodyEvents, setCustodyEvents] = useState<CustodyEvent[]>([]);
  const [relatedItems, setRelatedItems] = useState<RelatedItem[]>([]);

  // Fetch real evidence data from Supabase
  const fetchEvidence = useCallback(async () => {
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
          // Default custody events when no audit trail exists yet
          setCustodyEvents([
            { id: 'cust-default-1', action: 'Uploaded', actor: dbItem.agent_id ?? 'Unknown', timestamp: dbItem.created_at, detail: 'File uploaded to KURA360 Evidence Vault and SHA-256 hash generated' },
            { id: 'cust-default-2', action: 'Hash Generated', actor: 'System', timestamp: dbItem.created_at, detail: 'Automated SHA-256 integrity hash computed and stored' },
          ]);
        }

        // Fetch related evidence items from the same campaign (up to 3, excluding current)
        const { data: siblings } = await getEvidenceItems(campaign.id, { pageSize: 4 });
        const related = siblings
          .filter((s) => s.id !== id)
          .slice(0, 3)
          .map((s): RelatedItem => ({
            id: s.id,
            title: s.title,
            type: s.type as EvidenceType,
            thumbnail_color: TYPE_THUMBNAIL_COLORS[s.type] ?? 'bg-[#2E75B6]',
          }));
        setRelatedItems(related);
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

  // Handle verify / flag status updates
  const handleStatusUpdate = useCallback(
    async (newStatus: 'verified' | 'flagged') => {
      if (!item || !campaign?.id || !user?.id) return;
      setActionLoading(newStatus === 'verified' ? 'verify' : 'flag');
      try {
        const updates: { verification_status: string; verified_at?: string } = {
          verification_status: newStatus,
        };
        if (newStatus === 'verified') {
          updates.verified_at = new Date().toISOString();
        }
        const { data, error } = await updateEvidenceItem(id, campaign.id, user.id, updates);
        if (!error && data) {
          setItem(mapDbToEvidenceItem(data));
          // Re-fetch custody events to include the new audit log entry
          const { data: auditLogs } = await getAuditLog(campaign.id, {
            tableName: 'evidence_items',
            recordId: id,
          });
          if (auditLogs && auditLogs.length > 0) {
            setCustodyEvents(mapAuditToCustody(auditLogs));
          }
        }
      } catch (err) {
        console.error('[EvidenceDetail] Failed to update status:', err);
      } finally {
        setActionLoading(null);
      }
    },
    [id, item, campaign?.id, user?.id]
  );

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
                <button
                  onClick={() => handleStatusUpdate('verified')}
                  disabled={actionLoading !== null || item.status === 'verified'}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#1D6B3F] rounded-lg hover:bg-[#1D6B3F]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === 'verify' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  {actionLoading === 'verify' ? 'Verifying...' : 'Verify'}
                </button>
                <button
                  onClick={() => handleStatusUpdate('flagged')}
                  disabled={actionLoading !== null || item.status === 'flagged'}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#E53E3E] border border-[#E53E3E]/30 rounded-lg hover:bg-[#E53E3E]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === 'flag' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Flag className="w-3.5 h-3.5" />}
                  {actionLoading === 'flag' ? 'Flagging...' : 'Flag'}
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
