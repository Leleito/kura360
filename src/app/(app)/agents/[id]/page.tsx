'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Phone,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Calendar,
  Edit3,
  Shuffle,
  XCircle,
  Shield,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Button, Avatar, Badge } from '@/components/ui';
import { AnimatedCounter, FadeIn } from '@/components/premium';
import { cn, formatPhone, formatDate, formatDateShort, formatKES } from '@/lib/utils';
import { useCampaign } from '@/lib/campaign-context';
import { getAgentById } from '@/lib/actions/agents';
import { getAuditLog } from '@/lib/actions/audit';
import type { Tables } from '@/types/database';
import type { AgentStatus } from '@/lib/validators/agents';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CheckIn {
  id: string;
  timestamp: string;
  lat: number;
  lng: number;
  notes: string | null;
  status: 'on-time' | 'late' | 'missed';
}

interface ActivityLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  icon: 'register' | 'train' | 'assign' | 'pay' | 'checkin';
}

interface AgentDetail {
  id: string;
  full_name: string;
  phone: string;
  national_id: string;
  county: string;
  constituency: string;
  polling_station: string;
  status: AgentStatus;
  photo_url: string | null;
  created_at: string;
  assigned_at: string | null;
  payment_status: 'paid' | 'pending' | 'not_due';
  payment_amount_kes: number;
  check_ins: CheckIn[];
  activity_log: ActivityLogEntry[];
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  AgentStatus,
  { label: string; color: string; textColor: string; bgColor: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }
> = {
  deployed: { label: 'Deployed', color: '#2E75B6', textColor: 'text-[#2E75B6]', bgColor: 'bg-[#2E75B6]/10', variant: 'success' },
  active: { label: 'Active', color: '#1D6B3F', textColor: 'text-[#1D6B3F]', bgColor: 'bg-[#1D6B3F]/10', variant: 'success' },
  'checked-in': { label: 'Checked In', color: '#27AE60', textColor: 'text-[#27AE60]', bgColor: 'bg-[#27AE60]/10', variant: 'success' },
  inactive: { label: 'Inactive', color: '#A0AEC0', textColor: 'text-[#A0AEC0]', bgColor: 'bg-[#A0AEC0]/10', variant: 'neutral' },
  pending: { label: 'Pending', color: '#ED8936', textColor: 'text-[#ED8936]', bgColor: 'bg-[#ED8936]/10', variant: 'warning' },
};

const CHECKIN_STATUS_STYLES: Record<string, { text: string; bg: string; icon: typeof CheckCircle2 }> = {
  'on-time': { text: 'text-[#1D6B3F]', bg: 'bg-[#1D6B3F]/10', icon: CheckCircle2 },
  late: { text: 'text-[#ED8936]', bg: 'bg-[#ED8936]/10', icon: Clock },
  missed: { text: 'text-[#E53E3E]', bg: 'bg-[#E53E3E]/10', icon: AlertCircle },
};

const ACTIVITY_ICONS: Record<string, typeof Activity> = {
  register: Shield,
  train: CheckCircle2,
  assign: MapPin,
  pay: CreditCard,
  checkin: CheckCircle2,
};

const PAYMENT_BADGE_MAP: Record<string, { text: string; variant: 'success' | 'warning' | 'neutral' }> = {
  paid: { text: 'Paid', variant: 'success' },
  pending: { text: 'Pending', variant: 'warning' },
  not_due: { text: 'Not Due', variant: 'neutral' },
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

function getMockAgent(id: string): AgentDetail {
  const knownAgent: Record<string, AgentDetail> = {
    'a1b2c3d4-0001-4000-8000-000000000001': {
      id: 'a1b2c3d4-0001-4000-8000-000000000001',
      full_name: 'Wanjiku Kamau',
      phone: '+254712345001',
      national_id: '32456789',
      county: 'Nairobi',
      constituency: 'Langata',
      polling_station: 'Kibera Primary School',
      status: 'checked-in',
      photo_url: null,
      created_at: '2026-01-15T10:00:00Z',
      assigned_at: '2026-02-20T14:30:00Z',
      payment_status: 'paid',
      payment_amount_kes: 3500,
      check_ins: [
        { id: 'ci-001', timestamp: '2026-02-27T06:42:00Z', lat: -1.3119, lng: 36.7886, notes: 'Arrived at station. Setup underway.', status: 'on-time' },
        { id: 'ci-002', timestamp: '2026-02-27T09:00:00Z', lat: -1.3120, lng: 36.7887, notes: 'Voting in progress. Turnout moderate.', status: 'on-time' },
        { id: 'ci-003', timestamp: '2026-02-27T12:00:00Z', lat: -1.3119, lng: 36.7886, notes: 'Midday update. Queue manageable.', status: 'on-time' },
        { id: 'ci-004', timestamp: '2026-02-27T15:00:00Z', lat: -1.3119, lng: 36.7885, notes: 'Afternoon session. Turnout picking up.', status: 'late' },
        { id: 'ci-005', timestamp: '2026-02-27T17:30:00Z', lat: -1.3120, lng: 36.7886, notes: 'Polls closing. Starting tallying process.', status: 'on-time' },
      ],
      activity_log: [
        { id: 'al-001', timestamp: '2026-01-15T10:00:00Z', action: 'Registered', details: 'Agent registered by Campaign HQ', icon: 'register' },
        { id: 'al-002', timestamp: '2026-02-10T09:00:00Z', action: 'Training Completed', details: 'Completed election day agent training at Nairobi HQ', icon: 'train' },
        { id: 'al-003', timestamp: '2026-02-20T14:30:00Z', action: 'Assigned', details: 'Assigned to Kibera Primary School, Langata constituency', icon: 'assign' },
        { id: 'al-004', timestamp: '2026-02-25T11:00:00Z', action: 'Payment Processed', details: 'M-Pesa payment of KES 3,500 sent to +254 712 345 001', icon: 'pay' },
        { id: 'al-005', timestamp: '2026-02-27T06:42:00Z', action: 'Checked In', details: 'First check-in at polling station confirmed', icon: 'checkin' },
      ],
    },
  };

  return knownAgent[id] || {
    id,
    full_name: 'James Mwangi Kamau',
    phone: '+254722345099',
    national_id: '28765432',
    county: 'Nairobi',
    constituency: 'Dagoretti North',
    polling_station: 'Waithaka Primary School',
    status: 'deployed',
    photo_url: null,
    created_at: '2026-01-20T08:00:00Z',
    assigned_at: '2026-02-18T10:00:00Z',
    payment_status: 'pending',
    payment_amount_kes: 3500,
    check_ins: [
      { id: 'ci-101', timestamp: '2026-02-27T05:30:00Z', lat: -1.2870, lng: 36.7680, notes: 'Arrived at polling station.', status: 'on-time' },
      { id: 'ci-102', timestamp: '2026-02-27T08:45:00Z', lat: -1.2871, lng: 36.7681, notes: 'Voting commenced. Light turnout.', status: 'on-time' },
      { id: 'ci-103', timestamp: '2026-02-27T11:30:00Z', lat: -1.2870, lng: 36.7680, notes: 'Midday check-in. All calm.', status: 'on-time' },
      { id: 'ci-104', timestamp: '2026-02-27T14:15:00Z', lat: -1.2870, lng: 36.7679, notes: null, status: 'late' },
      { id: 'ci-105', timestamp: '2026-02-27T17:00:00Z', lat: -1.2871, lng: 36.7680, notes: 'Closing operations underway.', status: 'on-time' },
    ],
    activity_log: [
      { id: 'al-101', timestamp: '2026-01-20T08:00:00Z', action: 'Registered', details: 'Agent registered via field coordinator', icon: 'register' },
      { id: 'al-102', timestamp: '2026-02-12T14:00:00Z', action: 'Training Completed', details: 'Completed agent training at Nairobi County Office', icon: 'train' },
      { id: 'al-103', timestamp: '2026-02-18T10:00:00Z', action: 'Assigned', details: 'Assigned to Waithaka Primary School, Dagoretti North', icon: 'assign' },
      { id: 'al-104', timestamp: '2026-02-27T05:30:00Z', action: 'Deployed', details: 'Confirmed deployed at polling station', icon: 'checkin' },
      { id: 'al-105', timestamp: '2026-02-27T05:30:00Z', action: 'Checked In', details: 'First check-in confirmed via mobile app', icon: 'checkin' },
    ],
  };
}

// Mock 14-day check-in frequency for AreaChart
function getCheckinFrequencyData(): { day: string; checkins: number }[] {
  const days = ['Feb 14', 'Feb 15', 'Feb 16', 'Feb 17', 'Feb 18', 'Feb 19', 'Feb 20', 'Feb 21', 'Feb 22', 'Feb 23', 'Feb 24', 'Feb 25', 'Feb 26', 'Feb 27'];
  const values = [0, 1, 0, 2, 1, 3, 2, 0, 1, 3, 2, 1, 4, 5];
  return days.map((day, i) => ({ day, checkins: values[i] }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { campaign } = useCampaign();
  const activeCampaignId = campaign?.id ?? null;

  // State: start with mock data as default so page looks good without a campaign
  const [agent, setAgent] = useState<AgentDetail>(getMockAgent(id));
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // ---------------------------------------------------------------------------
  // Fetch real data from Supabase
  // ---------------------------------------------------------------------------

  const mapDbAgentToDetail = useCallback(
    (row: Tables<'agents'>): AgentDetail => ({
      id: row.id,
      full_name: row.full_name,
      phone: row.phone,
      national_id: row.national_id ?? '',
      county: row.county ?? '',
      constituency: row.sub_county ?? '',
      polling_station: row.assigned_station_name ?? '',
      status: (row.status as AgentStatus) || 'pending',
      photo_url: row.photo_url,
      created_at: row.created_at,
      assigned_at: row.checked_in_at,
      payment_status: (row.payment_status as 'paid' | 'pending' | 'not_due') ?? 'not_due',
      payment_amount_kes: row.payment_amount_kes ?? 0,
      // Build a single check-in entry if the agent has checked in
      check_ins: row.checked_in_at
        ? [
            {
              id: `ci-${row.id}`,
              timestamp: row.checked_in_at,
              lat: row.check_in_lat ?? 0,
              lng: row.check_in_lon ?? 0,
              notes: null,
              status: 'on-time' as const,
            },
          ]
        : [],
      // Activity log will be populated separately from audit_log
      activity_log: [],
    }),
    []
  );

  const mapAuditToActivity = useCallback(
    (row: Tables<'audit_log'>): ActivityLogEntry => {
      // Determine icon based on audit action + table
      let icon: ActivityLogEntry['icon'] = 'register';
      const actionLower = row.action.toLowerCase();
      if (actionLower === 'insert' && row.table_name === 'agents') icon = 'register';
      else if (actionLower === 'update') icon = 'assign';
      else if (row.table_name === 'transactions') icon = 'pay';
      else if (actionLower === 'checkin' || actionLower === 'check-in') icon = 'checkin';

      // Build a human-readable action label
      let actionLabel = row.action;
      if (actionLower === 'insert') actionLabel = 'Created';
      else if (actionLower === 'update') actionLabel = 'Updated';
      else if (actionLower === 'delete') actionLabel = 'Deleted';

      const details =
        row.table_name === 'agents'
          ? `${actionLabel} on agents table`
          : `${actionLabel} on ${row.table_name}`;

      return {
        id: row.id,
        timestamp: row.created_at,
        action: actionLabel,
        details,
        icon,
      };
    },
    []
  );

  useEffect(() => {
    if (!activeCampaignId) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        // Fetch agent and audit log in parallel
        const [agentResult, auditResult] = await Promise.all([
          getAgentById(id),
          getAuditLog(activeCampaignId, { recordId: id, pageSize: 20 }),
        ]);

        if (cancelled) return;

        if (agentResult.data) {
          const mapped = mapDbAgentToDetail(agentResult.data);

          // Merge audit log entries as activity log
          if (auditResult.data && auditResult.data.length > 0) {
            mapped.activity_log = auditResult.data.map(mapAuditToActivity);
          }

          setAgent(mapped);
        }
        // If no agent data returned (e.g. empty campaign), keep mock data as visual default
      } catch (err) {
        console.error('[AgentDetail] Failed to fetch data:', err);
        // On error, keep existing mock data
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeCampaignId, id, mapDbAgentToDetail, mapAuditToActivity]);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const statusCfg = STATUS_CONFIG[agent.status];
  const paymentBadge = PAYMENT_BADGE_MAP[agent.payment_status];
  const checkinData = getCheckinFrequencyData();

  const _handleCopyId = () => {
    navigator.clipboard.writeText(agent.national_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const maskedNationalId = `${agent.national_id.slice(0, 2)}****${agent.national_id.slice(-2)}`;

  return (
    <div className="space-y-6">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-40 bg-white/60 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 border-3 border-blue border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-text-secondary font-medium">Loading agent details...</p>
          </div>
        </div>
      )}

      {/* Back navigation */}
      <FadeIn direction="left" duration={0.3}>
        <button
          onClick={() => router.push('/agents')}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </button>
      </FadeIn>

      {/* Hero Card */}
      <FadeIn direction="up" duration={0.4}>
        <div className="bg-white rounded-2xl border border-surface-border overflow-hidden">
          {/* Colored header band */}
          <div className="h-2" style={{ backgroundColor: statusCfg.color }} />

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <Avatar name={agent.full_name} src={agent.photo_url} size="lg" />
                {/* Pulse animation for status dot */}
                <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: statusCfg.color }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-4 w-4 border-2 border-white"
                    style={{ backgroundColor: statusCfg.color }}
                  />
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <h1 className="text-xl font-bold text-navy">{agent.full_name}</h1>
                  <Badge text={statusCfg.label} variant={statusCfg.variant} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Phone className="h-4 w-4 text-text-tertiary shrink-0" />
                    <span>{formatPhone(agent.phone)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <CreditCard className="h-4 w-4 text-text-tertiary shrink-0" />
                    <span title={copiedId ? 'Copied!' : 'Click to reveal'}>
                      ID: {maskedNationalId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <MapPin className="h-4 w-4 text-text-tertiary shrink-0" />
                    <span>{agent.county}, {agent.constituency}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Shield className="h-4 w-4 text-text-tertiary shrink-0" />
                    <span>{agent.polling_station}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Calendar className="h-4 w-4 text-text-tertiary shrink-0" />
                    <span>Registered {formatDateShort(agent.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <CreditCard className="h-4 w-4 text-text-tertiary shrink-0" />
                    <span className="flex items-center gap-2">
                      {formatKES(agent.payment_amount_kes)}
                      <Badge text={paymentBadge.text} variant={paymentBadge.variant} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button variant="ghost">
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button variant="ghost">
                  <Shuffle className="h-3.5 w-3.5" />
                  Reassign
                </Button>
                <Button variant="ghost">
                  <XCircle className="h-3.5 w-3.5" />
                  Deactivate
                </Button>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Check-in Frequency Chart */}
      <FadeIn delay={0.15} direction="up">
        <div className="bg-white rounded-xl p-5 border border-surface-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-navy">Check-in Frequency (Last 14 Days)</h2>
            <div className="flex items-center gap-1.5">
              <AnimatedCounter
                value={agent.check_ins.length}
                className="text-lg font-extrabold text-green"
                formatter={(v) => Math.round(v).toString()}
              />
              <span className="text-xs text-text-tertiary">total today</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={checkinData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="checkinGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1D6B3F" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#1D6B3F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="checkins"
                stroke="#1D6B3F"
                strokeWidth={2}
                fill="url(#checkinGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </FadeIn>

      {/* Bottom: Check-in Timeline + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Check-in History Timeline */}
        <FadeIn delay={0.2} direction="up">
          <div className="bg-white rounded-xl p-5 border border-surface-border">
            <h2 className="text-sm font-bold text-navy mb-4">Check-in Timeline</h2>

            {agent.check_ins.length === 0 ? (
              <p className="text-sm text-text-tertiary py-4 text-center">
                No check-ins recorded yet.
              </p>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-surface-border" />

                <div className="space-y-4">
                  {agent.check_ins.map((checkIn, idx) => {
                    const style = CHECKIN_STATUS_STYLES[checkIn.status];
                    const StatusIcon = style.icon;
                    return (
                      <div key={checkIn.id} className="relative flex gap-3 pl-1">
                        {/* Timeline dot */}
                        <div className="relative z-10 shrink-0 mt-0.5">
                          <div className={cn('h-[30px] w-[30px] rounded-full flex items-center justify-center', style.bg)}>
                            <StatusIcon className={cn('h-4 w-4', style.text)} />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-text-primary">
                              Check-in #{agent.check_ins.length - idx}
                            </p>
                            <span
                              className={cn(
                                'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                                style.bg,
                                style.text
                              )}
                            >
                              {checkIn.status === 'on-time' ? 'On Time' : checkIn.status === 'late' ? 'Late' : 'Missed'}
                            </span>
                          </div>
                          <p className="text-xs text-text-tertiary mt-0.5">
                            {formatDate(checkIn.timestamp)}
                          </p>
                          {checkIn.notes && (
                            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                              {checkIn.notes}
                            </p>
                          )}
                          <p className="text-[10px] text-text-tertiary mt-1 font-mono">
                            GPS: {checkIn.lat.toFixed(4)}, {checkIn.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        {/* Activity Log */}
        <FadeIn delay={0.25} direction="up">
          <div className="bg-white rounded-xl p-5 border border-surface-border">
            <h2 className="text-sm font-bold text-navy mb-4">Activity Log</h2>

            {agent.activity_log.length === 0 ? (
              <p className="text-sm text-text-tertiary py-4 text-center">
                No activity recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {agent.activity_log.map((entry) => {
                  const EntryIcon = ACTIVITY_ICONS[entry.icon] || Activity;
                  return (
                    <div
                      key={entry.id}
                      className="flex gap-3 p-3 rounded-lg bg-surface-bg border border-surface-border-light hover:border-blue/20 transition-colors"
                    >
                      <div className="shrink-0 mt-0.5">
                        <div className="h-8 w-8 rounded-full bg-blue/10 flex items-center justify-center">
                          <EntryIcon className="h-4 w-4 text-blue" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-text-primary">{entry.action}</p>
                          <span className="text-[10px] text-text-tertiary whitespace-nowrap">
                            {formatDateShort(entry.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                          {entry.details}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </FadeIn>
      </div>

      {/* Assignment Card */}
      <FadeIn delay={0.3} direction="up">
        <div className="bg-white rounded-xl p-5 border border-surface-border">
          <h2 className="text-sm font-bold text-navy mb-3">Assignment Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">Polling Station</p>
              <p className="text-sm text-text-primary mt-0.5 font-medium">{agent.polling_station}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">Constituency</p>
              <p className="text-sm text-text-primary mt-0.5 font-medium">{agent.constituency}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">Assigned Date</p>
              <p className="text-sm text-text-primary mt-0.5 font-medium">
                {agent.assigned_at ? formatDateShort(agent.assigned_at) : '--'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">Payment</p>
              <p className="text-sm text-text-primary mt-0.5 font-medium flex items-center gap-2">
                {formatKES(agent.payment_amount_kes)}
                <Badge text={paymentBadge.text} variant={paymentBadge.variant} />
              </p>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
