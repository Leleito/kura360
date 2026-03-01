'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  UserPlus,
  Phone,
  Rocket,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Button,
  Modal,
  Input,
  Select,
  SearchInput,
  Badge,
  Avatar,
} from '@/components/ui';
import { AnimatedCounter, FadeIn, StaggerContainer, StaggerItem } from '@/components/premium';
import { cn, formatPhone, formatDate, percentage } from '@/lib/utils';
import { useCampaign } from '@/lib/campaign-context';
import { useUser } from '@/lib/auth/hooks';
import { getAgents, createAgent } from '@/lib/actions/agents';
import type { AgentStatus } from '@/lib/validators/agents';
import type { Tables } from '@/types/database';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Agent {
  id: string;
  full_name: string;
  phone: string;
  national_id: string;
  county: string;
  constituency: string;
  polling_station: string;
  status: AgentStatus;
  last_check_in: string | null;
  photo_url: string | null;
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  AgentStatus,
  { label: string; color: string; bg: string; dot: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }
> = {
  deployed: { label: 'Deployed', color: '#2E75B6', bg: 'bg-[#2E75B6]/10', dot: 'bg-[#2E75B6]', variant: 'success' },
  active: { label: 'Active', color: '#1D6B3F', bg: 'bg-[#1D6B3F]/10', dot: 'bg-[#1D6B3F]', variant: 'success' },
  'checked-in': { label: 'Checked In', color: '#27AE60', bg: 'bg-[#27AE60]/10', dot: 'bg-[#27AE60]', variant: 'success' },
  inactive: { label: 'Inactive', color: '#A0AEC0', bg: 'bg-[#A0AEC0]/10', dot: 'bg-[#A0AEC0]', variant: 'neutral' },
  pending: { label: 'Pending', color: '#ED8936', bg: 'bg-[#ED8936]/10', dot: 'bg-[#ED8936]', variant: 'warning' },
};

const PIE_COLORS: Record<AgentStatus, string> = {
  deployed: '#2E75B6',
  active: '#1D6B3F',
  'checked-in': '#27AE60',
  inactive: '#A0AEC0',
  pending: '#ED8936',
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_AGENTS: Agent[] = [
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    full_name: 'Wanjiku Kamau',
    phone: '+254712345001',
    national_id: '32456789',
    county: 'Nairobi',
    constituency: 'Langata',
    polling_station: 'Kibera Primary School',
    status: 'checked-in',
    last_check_in: '2026-02-27T06:42:00Z',
    photo_url: null,
  },
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000002',
    full_name: 'Odhiambo Otieno',
    phone: '+254722345002',
    national_id: '28765432',
    county: 'Kisumu',
    constituency: 'Kisumu Central',
    polling_station: 'Oginga Odinga Grounds',
    status: 'deployed',
    last_check_in: '2026-02-27T05:30:00Z',
    photo_url: null,
  },
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000003',
    full_name: 'Amina Hassan',
    phone: '+254733345003',
    national_id: '34567890',
    county: 'Mombasa',
    constituency: 'Mvita',
    polling_station: 'Majengo Community Hall',
    status: 'active',
    last_check_in: '2026-02-27T07:15:00Z',
    photo_url: null,
  },
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000004',
    full_name: 'Kipchoge Ruto',
    phone: '+254745345004',
    national_id: '29876543',
    county: 'Uasin Gishu',
    constituency: 'Ainabkoi',
    polling_station: 'Eldoret ASK Grounds',
    status: 'checked-in',
    last_check_in: '2026-02-27T06:58:00Z',
    photo_url: null,
  },
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000005',
    full_name: 'Njeri Muthoni',
    phone: '+254756345005',
    national_id: '31234567',
    county: 'Kiambu',
    constituency: 'Thika Town',
    polling_station: 'Thika Stadium Hall',
    status: 'deployed',
    last_check_in: '2026-02-26T16:20:00Z',
    photo_url: null,
  },
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000006',
    full_name: 'Barasa Wekesa',
    phone: '+254712345006',
    national_id: '27654321',
    county: 'Nakuru',
    constituency: 'Nakuru Town East',
    polling_station: 'Afraha Stadium Annex',
    status: 'inactive',
    last_check_in: '2026-02-25T10:00:00Z',
    photo_url: null,
  },
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000007',
    full_name: 'Akinyi Ouma',
    phone: '+254722345007',
    national_id: '33456789',
    county: 'Kisumu',
    constituency: 'Nyando',
    polling_station: 'Ahero Market Centre',
    status: 'active',
    last_check_in: '2026-02-27T07:02:00Z',
    photo_url: null,
  },
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000008',
    full_name: 'Mwangi Kariuki',
    phone: '+254733345008',
    national_id: '30123456',
    county: 'Nairobi',
    constituency: 'Westlands',
    polling_station: 'Parklands Primary School',
    status: 'checked-in',
    last_check_in: '2026-02-27T06:35:00Z',
    photo_url: null,
  },
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000009',
    full_name: 'Fatuma Ali',
    phone: '+254745345009',
    national_id: '35678901',
    county: 'Mombasa',
    constituency: 'Changamwe',
    polling_station: 'Port Reitz Community Hall',
    status: 'pending',
    last_check_in: null,
    photo_url: null,
  },
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000010',
    full_name: 'Kosgei Chebet',
    phone: '+254756345010',
    national_id: '26543210',
    county: 'Uasin Gishu',
    constituency: 'Kesses',
    polling_station: 'University of Eldoret Gate',
    status: 'deployed',
    last_check_in: '2026-02-27T05:50:00Z',
    photo_url: null,
  },
];

// ---------------------------------------------------------------------------
// County filter options (unique from mock)
// ---------------------------------------------------------------------------

const COUNTY_OPTIONS = [
  { value: '', label: 'All Counties' },
  ...Array.from(new Set(MOCK_AGENTS.map((a) => a.county)))
    .sort()
    .map((c) => ({ value: c, label: c })),
];

const FORM_COUNTY_OPTIONS = COUNTY_OPTIONS.filter((c) => c.value !== '');

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Map DB agent row to the UI Agent interface
// ---------------------------------------------------------------------------

function mapDbAgentToUI(dbAgent: Tables<'agents'>): Agent {
  return {
    id: dbAgent.id,
    full_name: dbAgent.full_name,
    phone: dbAgent.phone,
    national_id: dbAgent.national_id ?? '',
    county: dbAgent.county ?? '',
    constituency: dbAgent.sub_county ?? '',
    polling_station: dbAgent.assigned_station_name ?? '',
    status: (dbAgent.status as AgentStatus) || 'pending',
    last_check_in: dbAgent.checked_in_at,
    photo_url: dbAgent.photo_url,
  };
}

export default function AgentsPage() {
  const router = useRouter();
  const { campaign } = useCampaign();
  const activeCampaignId = campaign?.id ?? null;
  const { user } = useUser();

  // Agent data (falls back to mock)
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState<AgentStatus | 'all'>('all');

  // Registration modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '+254',
    national_id: '',
    county: '',
    constituency: '',
    polling_station: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const refreshAgents = useCallback(async () => {
    if (!activeCampaignId) return;
    setLoading(true);
    try {
      const result = await getAgents(activeCampaignId, {});
      if (result.data && result.data.length > 0) {
        setAgents(result.data.map(mapDbAgentToUI));
      }
      // If no data returned (empty campaign), keep mock data as visual default
    } catch {
      // On error, keep existing data (mock or previously fetched)
    } finally {
      setLoading(false);
    }
  }, [activeCampaignId]);

  useEffect(() => {
    refreshAgents();
  }, [refreshAgents]);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: agents.length };
    for (const s of Object.keys(STATUS_CONFIG)) {
      counts[s] = agents.filter((a) => a.status === s).length;
    }
    return counts;
  }, [agents]);

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch =
        !search ||
        agent.full_name.toLowerCase().includes(search.toLowerCase()) ||
        agent.county.toLowerCase().includes(search.toLowerCase()) ||
        agent.phone.includes(search);

      const matchesStatus = activeStatus === 'all' || agent.status === activeStatus;

      return matchesSearch && matchesStatus;
    });
  }, [search, activeStatus, agents]);

  const totalAgents = agents.length;
  const deployedCount = agents.filter(
    (a) => a.status === 'deployed' || a.status === 'active' || a.status === 'checked-in'
  ).length;
  const checkedInCount = agents.filter((a) => a.status === 'checked-in').length;
  const pendingCount = agents.filter((a) => a.status === 'pending').length;

  // County distribution (top 10)
  const countyData = useMemo(() => {
    const map: Record<string, number> = {};
    agents.forEach((a) => {
      map[a.county] = (map[a.county] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([county, count]) => ({ county, count }));
  }, [agents]);

  // Status pie data
  const pieData = useMemo(() => {
    return (Object.keys(STATUS_CONFIG) as AgentStatus[])
      .map((s) => ({
        name: STATUS_CONFIG[s].label,
        value: agents.filter((a) => a.status === s).length,
        status: s,
      }))
      .filter((d) => d.value > 0);
  }, [agents]);

  // ---------------------------------------------------------------------------
  // Form handling
  // ---------------------------------------------------------------------------

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (formData.full_name.trim().length < 2) errors.full_name = 'Full name must be at least 2 characters';
    if (!/^\+254[17]\d{8}$/.test(formData.phone)) errors.phone = 'Phone must be in +254 format';
    if (!/^\d{8}$/.test(formData.national_id)) errors.national_id = 'National ID must be exactly 8 digits';
    if (!formData.county) errors.county = 'County is required';
    if (formData.constituency.trim().length < 2) errors.constituency = 'Constituency is required';
    if (formData.polling_station.trim().length < 2) errors.polling_station = 'Polling station is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    if (!activeCampaignId || !user) {
      // If no campaign or user, fall back to demo behavior
      setShowRegisterModal(false);
      resetForm();
      return;
    }
    setSubmitting(true);
    try {
      const result = await createAgent(
        {
          campaign_id: activeCampaignId,
          full_name: formData.full_name,
          phone: formData.phone,
          national_id: formData.national_id,
          county: formData.county,
          sub_county: formData.constituency,
          assigned_station_name: formData.polling_station,
          status: 'pending',
        },
        user.id
      );
      if (result.data) {
        setShowRegisterModal(false);
        resetForm();
        refreshAgents();
      } else if (result.error) {
        setFormErrors({ full_name: result.error });
      }
    } catch {
      setFormErrors({ full_name: 'Failed to register agent. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ full_name: '', phone: '+254', national_id: '', county: '', constituency: '', polling_station: '' });
    setFormErrors({});
  };

  // ---------------------------------------------------------------------------
  // Status filter pills
  // ---------------------------------------------------------------------------

  const statusPills: { key: AgentStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'deployed', label: 'Deployed' },
    { key: 'active', label: 'Active' },
    { key: 'checked-in', label: 'Checked In' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'pending', label: 'Pending' },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-40 bg-white/60 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 border-3 border-blue border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-text-secondary font-medium">Loading agents...</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <FadeIn direction="down" duration={0.4}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-navy">Agent Management</h1>
            <p className="text-sm text-text-tertiary mt-1">
              Deploy, track, and coordinate polling station agents across all 47 counties
            </p>
          </div>
          <Button onClick={() => setShowRegisterModal(true)}>
            <UserPlus className="h-4 w-4" />
            Register Agent
          </Button>
        </div>
      </FadeIn>

      {/* Summary Stats with AnimatedCounter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Agents', value: totalAgents, sub: 'Registered', icon: Users, color: 'text-navy', borderColor: 'border-l-[#0F2A44]' },
          { label: 'Deployed', value: deployedCount, sub: `${percentage(deployedCount, totalAgents)}% of total`, icon: Rocket, color: 'text-blue', borderColor: 'border-l-[#2E75B6]' },
          { label: 'Active Check-ins', value: checkedInCount, sub: `${percentage(checkedInCount, deployedCount)}% of deployed`, icon: CheckCircle2, color: 'text-green', borderColor: 'border-l-[#1D6B3F]' },
          { label: 'Pending Assignment', value: pendingCount, sub: 'Awaiting deployment', icon: Clock, color: 'text-orange', borderColor: 'border-l-[#ED8936]' },
        ].map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.1} direction="up">
            <div className={cn('bg-white rounded-xl p-4 border border-surface-border border-l-4', stat.borderColor)}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">
                  {stat.label}
                </p>
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

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* County Bar Chart */}
        <FadeIn delay={0.2} direction="up" className="lg:col-span-2">
          <div className="bg-white rounded-xl p-5 border border-surface-border">
            <h2 className="text-sm font-bold text-navy mb-4">Agents by County (Top 10)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={countyData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="county"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                  cursor={{ fill: '#F7F9FC' }}
                />
                <Bar dataKey="count" fill="#2E75B6" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>

        {/* Status Pie Chart */}
        <FadeIn delay={0.3} direction="up">
          <div className="bg-white rounded-xl p-5 border border-surface-border">
            <h2 className="text-sm font-bold text-navy mb-4">Status Breakdown</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.status} fill={PIE_COLORS[entry.status]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-[11px] text-text-secondary">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>
      </div>

      {/* Filters: Search + Status Pills */}
      <FadeIn delay={0.15} direction="up">
        <div className="bg-white rounded-xl p-4 border border-surface-border space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search by name, county, or phone..."
              />
            </div>
          </div>

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2">
            {statusPills.map((pill) => {
              const isActive = activeStatus === pill.key;
              const count = statusCounts[pill.key] || 0;
              const cfg = pill.key !== 'all' ? STATUS_CONFIG[pill.key] : null;

              return (
                <button
                  key={pill.key}
                  onClick={() => setActiveStatus(pill.key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-navy text-white shadow-sm'
                      : 'bg-surface-bg text-text-secondary hover:bg-surface-border/50'
                  )}
                >
                  {cfg && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cfg.color }}
                    />
                  )}
                  {pill.label}
                  <span
                    className={cn(
                      'ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                      isActive ? 'bg-white/20 text-white' : 'bg-surface-border text-text-tertiary'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-tertiary font-medium">
          Showing {filteredAgents.length} of {totalAgents} agents
        </p>
      </div>

      {/* Agent Cards Grid */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAgents.map((agent) => {
          const cfg = STATUS_CONFIG[agent.status];
          return (
            <StaggerItem key={agent.id}>
              <button
                onClick={() => router.push(`/agents/${agent.id}`)}
                className="w-full text-left bg-white rounded-xl border border-surface-border p-4 hover:shadow-lg hover:border-blue/30 transition-all group"
              >
                {/* Top: Avatar + Status */}
                <div className="flex items-start justify-between mb-3">
                  <Avatar
                    name={agent.full_name}
                    src={agent.photo_url}
                    size="md"
                    online={agent.status === 'checked-in' || agent.status === 'active'}
                  />
                  <Badge text={cfg.label} variant={cfg.variant} />
                </div>

                {/* Name */}
                <h3 className="text-sm font-bold text-navy group-hover:text-blue transition-colors truncate">
                  {agent.full_name}
                </h3>

                {/* County */}
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-text-secondary">
                  <MapPin className="h-3 w-3 text-text-tertiary shrink-0" />
                  <span className="truncate">{agent.county}, {agent.constituency}</span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-1.5 mt-1 text-xs text-text-secondary">
                  <Phone className="h-3 w-3 text-text-tertiary shrink-0" />
                  <span>{formatPhone(agent.phone)}</span>
                </div>

                {/* Last check-in */}
                <div className="flex items-center gap-1.5 mt-1 text-xs text-text-tertiary">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>
                    {agent.last_check_in ? formatDate(agent.last_check_in) : 'No check-in yet'}
                  </span>
                </div>

                {/* Bottom: arrow indicator */}
                <div className="mt-3 pt-3 border-t border-surface-border flex items-center justify-between">
                  <span className="text-[10px] text-text-tertiary font-mono truncate">
                    {agent.polling_station}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-text-tertiary group-hover:text-blue transition-colors shrink-0" />
                </div>
              </button>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Empty state */}
      {filteredAgents.length === 0 && (
        <FadeIn>
          <div className="bg-white rounded-xl border border-surface-border p-12 text-center">
            <Users className="h-10 w-10 text-text-tertiary mx-auto mb-3" />
            <p className="text-sm font-semibold text-navy mb-1">No agents match your filters</p>
            <p className="text-xs text-text-tertiary">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        </FadeIn>
      )}

      {/* Registration Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => { setShowRegisterModal(false); resetForm(); }}
        title="Register New Agent"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Wanjiku Kamau"
            value={formData.full_name}
            onChange={(e) => handleFormChange('full_name', e.target.value)}
            error={formErrors.full_name}
          />
          <Input
            label="Phone Number"
            placeholder="+254712345678"
            value={formData.phone}
            onChange={(e) => handleFormChange('phone', e.target.value)}
            error={formErrors.phone}
            prefix={<Phone className="h-4 w-4" />}
          />
          <Input
            label="National ID"
            placeholder="e.g. 32456789"
            value={formData.national_id}
            onChange={(e) => handleFormChange('national_id', e.target.value)}
            error={formErrors.national_id}
            maxLength={8}
          />
          <Select
            label="County"
            options={FORM_COUNTY_OPTIONS}
            value={formData.county}
            onChange={(e) => handleFormChange('county', e.target.value)}
            placeholder="Select county"
            error={formErrors.county}
          />
          <Input
            label="Constituency"
            placeholder="e.g. Langata"
            value={formData.constituency}
            onChange={(e) => handleFormChange('constituency', e.target.value)}
            error={formErrors.constituency}
          />
          <Input
            label="Polling Station"
            placeholder="e.g. Kibera Primary School"
            value={formData.polling_station}
            onChange={(e) => handleFormChange('polling_station', e.target.value)}
            error={formErrors.polling_station}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setShowRegisterModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleRegister} disabled={submitting}>
              <UserPlus className="h-4 w-4" />
              {submitting ? 'Registering...' : 'Register Agent'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
