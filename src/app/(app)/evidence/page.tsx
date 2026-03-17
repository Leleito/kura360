'use client';

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { EvidenceForm } from '@/components/forms/evidence-form';
import {
  Shield,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Upload,
  LayoutGrid,
  List,
  CheckCircle,
  Camera,
  Video,
  FileText,
  Mic,
  MapPin,
  Calendar,
  Hash,
  ChevronRight,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { SearchInput, Badge, DataTable } from '@/components/ui';
import type { Column } from '@/components/ui';
import { AnimatedCounter, FadeIn, StaggerContainer, StaggerItem } from '@/components/premium';
import { cn, formatDateShort } from '@/lib/utils';
import { useQueryFilters } from '@/lib/hooks/use-query-filters';
import { useCampaign } from '@/lib/campaign-context';
import { RoleGate } from '@/lib/rbac';
import { getEvidenceItems } from '@/lib/actions/evidence';
import type { EvidenceType, EvidenceStatus, KenyaCounty } from '@/lib/validators/evidence';
import { EVIDENCE_TYPES, EVIDENCE_STATUSES } from '@/lib/validators/evidence';
import type { Tables } from '@/types/database';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EvidenceItem extends Record<string, unknown> {
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

const STATUS_BADGE: Record<EvidenceStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  verified: { label: 'Verified', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  flagged: { label: 'Flagged', variant: 'danger' },
};

function truncateHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

// ---------------------------------------------------------------------------
// Map DB evidence row to the UI EvidenceItem interface
// ---------------------------------------------------------------------------

const THUMBNAIL_COLORS: Record<EvidenceType, string> = {
  photo: 'bg-[#2E75B6]',
  video: 'bg-[#805AD5]',
  document: 'bg-[#1D6B3F]',
  audio: 'bg-[#ED8936]',
};

function mapDbEvidenceToUI(dbItem: Tables<'evidence_items'>): EvidenceItem {
  const evidenceType = (dbItem.type as EvidenceType) || 'document';
  const evidenceStatus = (dbItem.verification_status as EvidenceStatus) || 'pending';
  return {
    id: dbItem.id,
    title: dbItem.title,
    type: evidenceType,
    county: '' as KenyaCounty, // DB does not store county directly; show GPS-based or empty
    description: dbItem.description ?? '',
    file_url: dbItem.file_url,
    captured_by: '', // DB does not have captured_by; could be enriched from agent_id later
    sha256_hash: dbItem.sha256_hash,
    status: evidenceStatus,
    created_at: dbItem.captured_at ?? dbItem.created_at,
    thumbnail_color:
      evidenceStatus === 'flagged'
        ? 'bg-[#E53E3E]'
        : THUMBNAIL_COLORS[evidenceType] ?? 'bg-[#2E75B6]',
  };
}

// ---------------------------------------------------------------------------
// Gallery Card
// ---------------------------------------------------------------------------

function GalleryCard({ item }: { item: EvidenceItem }) {
  const TypeIcon = TYPE_ICONS[item.type];
  const statusInfo = STATUS_BADGE[item.status];

  return (
    <Link
      href={`/evidence/${item.id}`}
      className="bg-white rounded-xl border border-surface-border overflow-hidden hover:shadow-lg hover:border-blue/30 transition-all group"
    >
      {/* Thumbnail */}
      <div className={cn('relative h-40 flex items-center justify-center', item.thumbnail_color)}>
        <TypeIcon className="w-12 h-12 text-white/70" />
        {item.status === 'verified' && (
          <div className="absolute top-2.5 right-2.5 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm">
            <CheckCircle className="w-4 h-4 text-[#1D6B3F]" />
          </div>
        )}
        {item.status === 'flagged' && (
          <div className="absolute top-2.5 right-2.5 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm">
            <AlertTriangle className="w-4 h-4 text-[#E53E3E]" />
          </div>
        )}
        {/* Type badge overlay */}
        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-black/30 backdrop-blur-sm rounded-full text-[10px] font-semibold text-white">
          {TYPE_LABELS[item.type]}
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-xs font-bold text-navy leading-snug group-hover:text-blue transition-colors line-clamp-2">
            {item.title}
          </h3>
          <Badge text={statusInfo.label} variant={statusInfo.variant} />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>{item.county}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary">
            <Calendar className="w-3 h-3 shrink-0" />
            <span>{formatDateShort(item.created_at)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary font-mono">
            <Hash className="w-3 h-3 shrink-0" />
            <span>{truncateHash(item.sha256_hash)}</span>
          </div>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-surface-border flex items-center justify-between">
          <span className="text-[10px] text-text-tertiary">{item.captured_by}</span>
          <ChevronRight className="w-3 h-3 text-text-tertiary group-hover:text-blue transition-colors" />
        </div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

function EvidencePageInner() {
  const { campaign } = useCampaign();
  const activeCampaignId = campaign?.id ?? null;

  // Evidence data (starts empty, fetches from Supabase)
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
  const { filters, setFilter, clearFilters: clearUrlFilters } = useQueryFilters({
    search: '',
    type: '',
    status: '',
    county: '',
  });
  const { search: searchQuery, type: typeFilter, status: statusFilter, county: countyFilter } = filters;
  const [showUploadModal, setShowUploadModal] = useState(false);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const refreshEvidence = useCallback(async () => {
    if (!activeCampaignId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const result = await getEvidenceItems(activeCampaignId, {});
      if (result.data && result.data.length > 0) {
        setEvidence(result.data.map(mapDbEvidenceToUI));
      }
    } catch {
      // keep existing data on error
    } finally {
      setLoading(false);
    }
  }, [activeCampaignId]);

  useEffect(() => {
    refreshEvidence();
  }, [refreshEvidence]);

  // Counts
  const totalCount = evidence.length;
  const verifiedCount = evidence.filter((e) => e.status === 'verified').length;
  const pendingCount = evidence.filter((e) => e.status === 'pending').length;
  const flaggedCount = evidence.filter((e) => e.status === 'flagged').length;

  // Filter
  const filteredEvidence = useMemo(() => {
    return evidence.filter((item) => {
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
  }, [searchQuery, typeFilter, statusFilter, countyFilter, evidence]);

  const availableCounties = useMemo(() => {
    return Array.from(new Set(evidence.map((e) => e.county).filter(Boolean))).sort();
  }, [evidence]);

  // Donut chart data: evidence by type
  const typeDonutData = useMemo(() => {
    return EVIDENCE_TYPES.map((t) => ({
      name: TYPE_LABELS[t],
      value: evidence.filter((e) => e.type === t).length,
      type: t,
    })).filter((d) => d.value > 0);
  }, [evidence]);

  // DataTable columns for list view
  const columns: Column<EvidenceItem>[] = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (row) => {
        const TypeIcon = TYPE_ICONS[row.type];
        return (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', row.thumbnail_color)}>
              <TypeIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-navy truncate text-xs">{row.title}</span>
          </div>
        );
      },
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (row) => <span className="text-text-secondary text-xs capitalize">{TYPE_LABELS[row.type]}</span>,
    },
    {
      key: 'county',
      label: 'County',
      sortable: true,
      render: (row) => <span className="text-text-secondary text-xs">{row.county}</span>,
    },
    {
      key: 'captured_by',
      label: 'Captured By',
      render: (row) => <span className="text-text-secondary text-xs">{row.captured_by}</span>,
    },
    {
      key: 'sha256_hash',
      label: 'Hash',
      render: (row) => <span className="font-mono text-text-tertiary text-[10px]">{truncateHash(row.sha256_hash)}</span>,
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (row) => <span className="text-text-tertiary text-xs">{formatDateShort(row.created_at)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const info = STATUS_BADGE[row.status];
        return <Badge text={info.label} variant={info.variant} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-40 bg-white/60 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 border-3 border-blue border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-text-secondary font-medium">Loading evidence...</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <FadeIn direction="down" duration={0.4}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-navy">Evidence Vault</h1>
            <p className="text-sm text-text-tertiary mt-1">
              Tamper-proof evidence with SHA-256 integrity verification
            </p>
          </div>
          <RoleGate permission="evidence:create">
            <button
              data-tour="evidence-upload"
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1D6B3F] text-white text-xs font-bold rounded-lg hover:bg-[#1D6B3F]/90 transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Evidence
            </button>
          </RoleGate>
        </div>
      </FadeIn>

      {/* Stat Cards with AnimatedCounter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: totalCount, sub: 'All evidence in vault', icon: Shield, color: 'text-navy', borderColor: 'border-l-[#0F2A44]', filter: '' },
          { label: 'Verified', value: verifiedCount, sub: `${Math.round((verifiedCount / totalCount) * 100)}% of total`, icon: ShieldCheck, color: 'text-green', borderColor: 'border-l-[#1D6B3F]', filter: 'verified' },
          { label: 'Pending Review', value: pendingCount, sub: 'Awaiting verification', icon: Clock, color: 'text-orange', borderColor: 'border-l-[#ED8936]', filter: 'pending' },
          { label: 'Flagged', value: flaggedCount, sub: 'Requires investigation', icon: AlertTriangle, color: 'text-red', borderColor: 'border-l-[#E53E3E]', filter: 'flagged' },
        ].map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.1} direction="up">
            <button
              type="button"
              onClick={() => setFilter('status', statusFilter === stat.filter ? '' : stat.filter)}
              className={cn(
                'w-full text-left bg-white rounded-xl p-4 border border-surface-border border-l-4 transition-all duration-200',
                'hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] cursor-pointer hover:scale-[1.01] active:scale-[0.99]',
                statusFilter === stat.filter && stat.filter !== '' && 'ring-2 ring-blue/20',
                stat.borderColor
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">{stat.label}</p>
                <stat.icon className={cn('h-4 w-4', stat.color)} />
              </div>
              <AnimatedCounter
                value={stat.value}
                className={cn('text-2xl font-extrabold', stat.color)}
                formatter={(v) => Math.round(v).toLocaleString()}
              />
              <p className="text-[10px] text-text-tertiary mt-1">{stat.sub}</p>
            </button>
          </FadeIn>
        ))}
      </div>

      {/* Donut Chart + Filters row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Donut */}
        <FadeIn delay={0.2} direction="up">
          <div className="bg-white rounded-xl p-5 border border-surface-border">
            <h2 className="text-sm font-bold text-navy mb-3">By Type</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={typeDonutData}
                  cx="50%"
                  cy="45%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {typeDonutData.map((entry) => (
                    <Cell key={entry.type} fill={TYPE_COLORS[entry.type]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Legend
                  verticalAlign="bottom"
                  height={30}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => <span className="text-[10px] text-text-secondary">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>

        {/* Filters */}
        <FadeIn delay={0.15} direction="up" className="lg:col-span-3">
          <div className="bg-white rounded-xl p-4 border border-surface-border space-y-3">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              {/* Search */}
              <div className="flex-1 w-full md:w-auto">
                <SearchInput
                  value={searchQuery}
                  onChange={(v: string) => setFilter('search', v)}
                  placeholder="Search by title, description, hash..."
                />
              </div>

              {/* Type filter */}
              <select
                value={typeFilter}
                onChange={(e) => setFilter('type', e.target.value)}
                className="px-3 py-2 text-xs border border-surface-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue"
              >
                <option value="">All Types</option>
                {EVIDENCE_TYPES.map((t) => (<option key={t} value={t}>{TYPE_LABELS[t]}</option>))}
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setFilter('status', e.target.value)}
                className="px-3 py-2 text-xs border border-surface-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue"
              >
                <option value="">All Statuses</option>
                {EVIDENCE_STATUSES.map((s) => (<option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>))}
              </select>

              {/* County filter */}
              <select
                value={countyFilter}
                onChange={(e) => setFilter('county', e.target.value)}
                className="px-3 py-2 text-xs border border-surface-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue"
              >
                <option value="">All Counties</option>
                {availableCounties.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>

            {/* View toggle + results count */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-text-tertiary font-medium">
                Showing {filteredEvidence.length} of {totalCount} evidence items
              </p>
              <div className="flex items-center border border-surface-border rounded-lg overflow-hidden shrink-0">
                <button
                  onClick={() => setViewMode('gallery')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'gallery' ? 'bg-navy text-white' : 'text-text-tertiary hover:bg-surface-bg'
                  )}
                  aria-label="Gallery view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'list' ? 'bg-navy text-white' : 'text-text-tertiary hover:bg-surface-bg'
                  )}
                  aria-label="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Gallery View */}
      {viewMode === 'gallery' && (
        <StaggerContainer data-tour="evidence-gallery" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEvidence.map((item) => (
            <StaggerItem key={item.id}>
              <GalleryCard item={item} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <FadeIn>
          <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
            <DataTable<EvidenceItem>
              columns={columns}
              data={filteredEvidence}
              onRowClick={(row) => { window.location.href = `/evidence/${row.id}`; }}
              emptyMessage="No evidence items match your filters."
            />
          </div>
        </FadeIn>
      )}

      {/* Empty state */}
      {filteredEvidence.length === 0 && (
        <FadeIn>
          <div className="bg-white rounded-xl border border-surface-border p-12 text-center">
            <Shield className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <p className="text-sm font-semibold text-navy mb-1">No evidence found</p>
            <p className="text-xs text-text-tertiary">
              Try adjusting your filters or upload new evidence.
            </p>
          </div>
        </FadeIn>
      )}

      {/* Upload Modal */}
      <EvidenceForm
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={refreshEvidence}
      />
    </div>
  );
}

export default function EvidencePage() {
  return (
    <Suspense>
      <EvidencePageInner />
    </Suspense>
  );
}
