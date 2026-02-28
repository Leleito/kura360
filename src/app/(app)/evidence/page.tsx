'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
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
  X,
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
import type { EvidenceType, EvidenceStatus, KenyaCounty } from '@/lib/validators/evidence';
import { EVIDENCE_TYPES, EVIDENCE_STATUSES, KENYA_COUNTIES } from '@/lib/validators/evidence';

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
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_EVIDENCE: EvidenceItem[] = [
  {
    id: 'ev-001',
    title: 'Uhuru Park Rally -- Crowd Aerial View',
    type: 'photo',
    county: 'Nairobi',
    description: 'Aerial drone photograph of campaign rally at Uhuru Park showing crowd turnout estimated at 15,000 supporters.',
    file_url: 'https://storage.kura360.co.ke/evidence/ev-001.jpg',
    captured_by: 'James Mwangi',
    sha256_hash: 'a3f2b8c4e5d6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0d91c',
    status: 'verified',
    created_at: '2026-02-15T09:30:00Z',
    thumbnail_color: 'bg-[#2E75B6]',
  },
  {
    id: 'ev-002',
    title: 'Ballot Counting -- Langata Constituency',
    type: 'video',
    county: 'Nairobi',
    description: 'Continuous video recording of ballot counting process at Langata Primary School polling station.',
    file_url: 'https://storage.kura360.co.ke/evidence/ev-002.mp4',
    captured_by: 'Sarah Wanjiku',
    sha256_hash: 'b7e4d2f1a8c3e6b9d5f0a2c4e7b1d3f6a9c2e5b8d0f3a6c9e1b4d7f0a3c6e9b2',
    status: 'verified',
    created_at: '2026-02-20T17:15:00Z',
    thumbnail_color: 'bg-[#805AD5]',
  },
  {
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
  },
  {
    id: 'ev-004',
    title: 'Voter Intimidation Incident -- Kisumu Central',
    type: 'photo',
    county: 'Kisumu',
    description: 'Photographic evidence of unauthorized persons attempting to obstruct voters.',
    file_url: 'https://storage.kura360.co.ke/evidence/ev-004.jpg',
    captured_by: 'Agnes Atieno',
    sha256_hash: 'd4e1f8a5b2c9d6e3f0a7b4c1d8e5f2a9b6c3d0e7f4a1b8c5d2e9f6a3b0c7d4e1',
    status: 'flagged',
    created_at: '2026-02-18T14:45:00Z',
    thumbnail_color: 'bg-[#E53E3E]',
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
    id: 'ev-008',
    title: 'Rally Stage Setup -- Garissa Town',
    type: 'photo',
    county: 'Garissa',
    description: 'Pre-event photograph documenting stage setup and branding compliance.',
    file_url: 'https://storage.kura360.co.ke/evidence/ev-008.jpg',
    captured_by: 'Abdi Mohamed',
    sha256_hash: 'b8d1f4a7c0e3b6d9f2a5c8e1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1',
    status: 'verified',
    created_at: '2026-02-19T07:45:00Z',
    thumbnail_color: 'bg-[#2E75B6]',
  },
  {
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
  },
  {
    id: 'ev-010',
    title: 'M-Pesa Donation Campaign -- Feedback Video',
    type: 'video',
    county: 'Machakos',
    description: 'Supporter testimonial video recorded during M-Pesa micro-donation campaign launch.',
    file_url: 'https://storage.kura360.co.ke/evidence/ev-010.mp4',
    captured_by: 'Mercy Mutua',
    sha256_hash: 'd3f6a9c2e5b8d1f4a7c0e3b6d9f2a5c8e1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6',
    status: 'pending',
    created_at: '2026-02-25T15:10:00Z',
    thumbnail_color: 'bg-[#805AD5]',
  },
];

// ---------------------------------------------------------------------------
// Upload Modal
// ---------------------------------------------------------------------------

function UploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <h2 className="text-sm font-bold text-navy">Upload Evidence</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-bg text-text-tertiary transition-colors" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form className="p-5 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Title <span className="text-[#E53E3E]">*</span></label>
            <input type="text" placeholder="e.g. Rally Photo -- Uhuru Park" className="w-full px-3 py-2.5 text-sm border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Type <span className="text-[#E53E3E]">*</span></label>
              <select className="w-full px-3 py-2.5 text-sm border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue bg-white">
                <option value="">Select type</option>
                {EVIDENCE_TYPES.map((t) => (<option key={t} value={t}>{TYPE_LABELS[t]}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">County <span className="text-[#E53E3E]">*</span></label>
              <select className="w-full px-3 py-2.5 text-sm border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue bg-white">
                <option value="">Select county</option>
                {KENYA_COUNTIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Description</label>
            <textarea rows={3} placeholder="Describe the evidence context..." className="w-full px-3 py-2.5 text-sm border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">File <span className="text-[#E53E3E]">*</span></label>
            <div className="border-2 border-dashed border-surface-border rounded-xl p-8 text-center hover:border-blue/40 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
              <p className="text-xs text-text-secondary font-medium">Drag and drop or click to browse</p>
              <p className="text-[10px] text-text-tertiary mt-1">Photos, videos, documents, or audio (max 50 MB)</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-xs font-semibold text-text-secondary rounded-lg hover:bg-surface-bg transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2.5 text-xs font-bold text-white bg-[#1D6B3F] rounded-lg hover:bg-[#1D6B3F]/90 transition-colors">Upload & Hash</button>
          </div>
        </form>
      </div>
    </div>
  );
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

export default function EvidencePage() {
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [countyFilter, setCountyFilter] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Counts
  const totalCount = MOCK_EVIDENCE.length;
  const verifiedCount = MOCK_EVIDENCE.filter((e) => e.status === 'verified').length;
  const pendingCount = MOCK_EVIDENCE.filter((e) => e.status === 'pending').length;
  const flaggedCount = MOCK_EVIDENCE.filter((e) => e.status === 'flagged').length;

  // Filter — eslint-disable for React Compiler: mock data, no perf concern
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
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

  const availableCounties = useMemo(() => {
    return Array.from(new Set(MOCK_EVIDENCE.map((e) => e.county))).sort();
  }, []);

  // Donut chart data: evidence by type
  const typeDonutData = useMemo(() => {
    return EVIDENCE_TYPES.map((t) => ({
      name: TYPE_LABELS[t],
      value: MOCK_EVIDENCE.filter((e) => e.type === t).length,
      type: t,
    })).filter((d) => d.value > 0);
  }, []);

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
      {/* Page Header */}
      <FadeIn direction="down" duration={0.4}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-navy">Evidence Vault</h1>
            <p className="text-sm text-text-tertiary mt-1">
              Tamper-proof evidence with SHA-256 integrity verification
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1D6B3F] text-white text-xs font-bold rounded-lg hover:bg-[#1D6B3F]/90 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Evidence
          </button>
        </div>
      </FadeIn>

      {/* Stat Cards with AnimatedCounter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: totalCount, sub: 'All evidence in vault', icon: Shield, color: 'text-navy', borderColor: 'border-l-[#0F2A44]' },
          { label: 'Verified', value: verifiedCount, sub: `${Math.round((verifiedCount / totalCount) * 100)}% of total`, icon: ShieldCheck, color: 'text-green', borderColor: 'border-l-[#1D6B3F]' },
          { label: 'Pending Review', value: pendingCount, sub: 'Awaiting verification', icon: Clock, color: 'text-orange', borderColor: 'border-l-[#ED8936]' },
          { label: 'Flagged', value: flaggedCount, sub: 'Requires investigation', icon: AlertTriangle, color: 'text-red', borderColor: 'border-l-[#E53E3E]' },
        ].map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.1} direction="up">
            <div className={cn('bg-white rounded-xl p-4 border border-surface-border border-l-4', stat.borderColor)}>
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
            </div>
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
                  onChange={setSearchQuery}
                  placeholder="Search by title, description, hash..."
                />
              </div>

              {/* Type filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-surface-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue"
              >
                <option value="">All Types</option>
                {EVIDENCE_TYPES.map((t) => (<option key={t} value={t}>{TYPE_LABELS[t]}</option>))}
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-surface-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue"
              >
                <option value="">All Statuses</option>
                {EVIDENCE_STATUSES.map((s) => (<option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>))}
              </select>

              {/* County filter */}
              <select
                value={countyFilter}
                onChange={(e) => setCountyFilter(e.target.value)}
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
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
      <UploadModal open={showUploadModal} onClose={() => setShowUploadModal(false)} />
    </div>
  );
}
