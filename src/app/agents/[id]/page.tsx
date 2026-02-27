'use client';

import { use } from 'react';
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
  User,
} from 'lucide-react';
import { Button, Avatar, Badge } from '@/components/ui';
import { formatPhone, formatDate, formatDateShort } from '@/lib/utils';
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
// Mock data -- maps to the first agent in the list page
// ---------------------------------------------------------------------------

const MOCK_AGENT_MAP: Record<string, AgentDetail> = {
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
      {
        id: 'ci-001',
        timestamp: '2026-02-27T06:42:00Z',
        lat: -1.3119,
        lng: 36.7886,
        notes: 'Arrived at station. Setup underway.',
        status: 'on-time',
      },
      {
        id: 'ci-002',
        timestamp: '2026-02-27T09:00:00Z',
        lat: -1.3120,
        lng: 36.7887,
        notes: 'Voting in progress. Turnout moderate.',
        status: 'on-time',
      },
      {
        id: 'ci-003',
        timestamp: '2026-02-27T12:00:00Z',
        lat: -1.3119,
        lng: 36.7886,
        notes: 'Midday update. Queue manageable.',
        status: 'on-time',
      },
      {
        id: 'ci-004',
        timestamp: '2026-02-27T15:00:00Z',
        lat: -1.3119,
        lng: 36.7885,
        notes: 'Afternoon session. Turnout picking up.',
        status: 'late',
      },
      {
        id: 'ci-005',
        timestamp: '2026-02-27T17:30:00Z',
        lat: -1.3120,
        lng: 36.7886,
        notes: 'Polls closing. Starting tallying process.',
        status: 'on-time',
      },
    ],
    activity_log: [
      {
        id: 'al-001',
        timestamp: '2026-01-15T10:00:00Z',
        action: 'Registered',
        details: 'Agent registered by Campaign HQ',
      },
      {
        id: 'al-002',
        timestamp: '2026-02-10T09:00:00Z',
        action: 'Training Completed',
        details: 'Completed election day agent training at Nairobi HQ',
      },
      {
        id: 'al-003',
        timestamp: '2026-02-20T14:30:00Z',
        action: 'Assigned',
        details: 'Assigned to Kibera Primary School, Langata constituency',
      },
      {
        id: 'al-004',
        timestamp: '2026-02-25T11:00:00Z',
        action: 'Payment Processed',
        details: 'M-Pesa payment of KES 3,500 sent to +254 712 345 001',
      },
      {
        id: 'al-005',
        timestamp: '2026-02-27T06:42:00Z',
        action: 'Checked In',
        details: 'First check-in at polling station confirmed',
      },
    ],
  },
};

// Fallback agent for unknown IDs (simulates navigating from the list)
function getDefaultAgent(id: string): AgentDetail {
  return {
    id,
    full_name: 'Odhiambo Otieno',
    phone: '+254722345002',
    national_id: '28765432',
    county: 'Kisumu',
    constituency: 'Kisumu Central',
    polling_station: 'Oginga Odinga Grounds',
    status: 'deployed',
    photo_url: null,
    created_at: '2026-01-20T08:00:00Z',
    assigned_at: '2026-02-18T10:00:00Z',
    payment_status: 'pending',
    payment_amount_kes: 3500,
    check_ins: [
      {
        id: 'ci-101',
        timestamp: '2026-02-27T05:30:00Z',
        lat: -0.0917,
        lng: 34.7680,
        notes: 'Arrived at Oginga Odinga Grounds.',
        status: 'on-time',
      },
      {
        id: 'ci-102',
        timestamp: '2026-02-27T08:45:00Z',
        lat: -0.0918,
        lng: 34.7681,
        notes: 'Voting commenced. Light turnout so far.',
        status: 'on-time',
      },
      {
        id: 'ci-103',
        timestamp: '2026-02-27T11:30:00Z',
        lat: -0.0917,
        lng: 34.7680,
        notes: 'Midday check-in. All calm.',
        status: 'on-time',
      },
      {
        id: 'ci-104',
        timestamp: '2026-02-27T14:15:00Z',
        lat: -0.0917,
        lng: 34.7679,
        notes: null,
        status: 'late',
      },
      {
        id: 'ci-105',
        timestamp: '2026-02-27T17:00:00Z',
        lat: -0.0918,
        lng: 34.7680,
        notes: 'Closing operations underway.',
        status: 'on-time',
      },
    ],
    activity_log: [
      {
        id: 'al-101',
        timestamp: '2026-01-20T08:00:00Z',
        action: 'Registered',
        details: 'Agent registered via field coordinator',
      },
      {
        id: 'al-102',
        timestamp: '2026-02-12T14:00:00Z',
        action: 'Training Completed',
        details: 'Completed agent training at Kisumu County Office',
      },
      {
        id: 'al-103',
        timestamp: '2026-02-18T10:00:00Z',
        action: 'Assigned',
        details: 'Assigned to Oginga Odinga Grounds, Kisumu Central',
      },
      {
        id: 'al-104',
        timestamp: '2026-02-27T05:30:00Z',
        action: 'Deployed',
        details: 'Confirmed deployed at polling station',
      },
      {
        id: 'al-105',
        timestamp: '2026-02-27T05:30:00Z',
        action: 'Checked In',
        details: 'First check-in confirmed via mobile app',
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

const STATUS_BADGE_MAP: Record<AgentStatus, { text: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  deployed: { text: 'Deployed', variant: 'success' },
  active: { text: 'Active', variant: 'success' },
  'checked-in': { text: 'Checked In', variant: 'success' },
  inactive: { text: 'Inactive', variant: 'danger' },
  pending: { text: 'Pending', variant: 'warning' },
};

const CHECKIN_STATUS_STYLES: Record<string, string> = {
  'on-time': 'text-green bg-green-pale',
  late: 'text-orange bg-orange-pale',
  missed: 'text-red bg-red-pale',
};

const PAYMENT_BADGE_MAP: Record<string, { text: string; variant: 'success' | 'warning' | 'neutral' }> = {
  paid: { text: 'Paid', variant: 'success' },
  pending: { text: 'Pending', variant: 'warning' },
  not_due: { text: 'Not Due', variant: 'neutral' },
};

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
  const agent = MOCK_AGENT_MAP[id] || getDefaultAgent(id);
  const statusBadge = STATUS_BADGE_MAP[agent.status];
  const paymentBadge = PAYMENT_BADGE_MAP[agent.payment_status];

  return (
    <div>
      {/* Back navigation */}
      <button
        onClick={() => router.push('/agents')}
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-navy transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Agents
      </button>

      {/* Top section: Profile + Assignment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Agent Profile Card */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-surface-border">
          <div className="flex items-start gap-4">
            <Avatar name={agent.full_name} src={agent.photo_url} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-navy">{agent.full_name}</h1>
                <Badge text={statusBadge.text} variant={statusBadge.variant} />
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Phone className="h-4 w-4 text-text-tertiary shrink-0" />
                  <span>{formatPhone(agent.phone)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <CreditCard className="h-4 w-4 text-text-tertiary shrink-0" />
                  <span>ID: {agent.national_id}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <MapPin className="h-4 w-4 text-text-tertiary shrink-0" />
                  <span>{agent.county}, {agent.constituency}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Calendar className="h-4 w-4 text-text-tertiary shrink-0" />
                  <span>Registered {formatDateShort(agent.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Details Card */}
        <div className="bg-white rounded-xl p-5 border border-surface-border">
          <h2 className="text-sm font-bold text-navy mb-3">Assignment Details</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                Polling Station
              </dt>
              <dd className="text-sm text-text-primary mt-0.5">{agent.polling_station}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                Constituency
              </dt>
              <dd className="text-sm text-text-primary mt-0.5">{agent.constituency}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                Assigned Date
              </dt>
              <dd className="text-sm text-text-primary mt-0.5">
                {agent.assigned_at ? formatDateShort(agent.assigned_at) : '--'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                Payment
              </dt>
              <dd className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-text-primary">
                  KES {agent.payment_amount_kes.toLocaleString()}
                </span>
                <Badge text={paymentBadge.text} variant={paymentBadge.variant} />
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Bottom section: Check-ins + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Check-in History Timeline */}
        <div className="bg-white rounded-xl p-5 border border-surface-border">
          <h2 className="text-sm font-bold text-navy mb-4">Check-in History</h2>

          {agent.check_ins.length === 0 ? (
            <p className="text-sm text-text-tertiary py-4 text-center">
              No check-ins recorded yet.
            </p>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-surface-border" />

              <div className="space-y-4">
                {agent.check_ins.map((checkIn, idx) => (
                  <div key={checkIn.id} className="relative flex gap-3 pl-1">
                    {/* Timeline dot */}
                    <div className="relative z-10 shrink-0 mt-0.5">
                      <div
                        className={`h-[30px] w-[30px] rounded-full flex items-center justify-center ${
                          CHECKIN_STATUS_STYLES[checkIn.status]
                        }`}
                      >
                        {checkIn.status === 'on-time' ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : checkIn.status === 'late' ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-text-primary">
                          Check-in #{agent.check_ins.length - idx}
                        </p>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            CHECKIN_STATUS_STYLES[checkIn.status]
                          }`}
                        >
                          {checkIn.status === 'on-time'
                            ? 'On Time'
                            : checkIn.status === 'late'
                              ? 'Late'
                              : 'Missed'}
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
                      <p className="text-[10px] text-text-tertiary mt-1">
                        GPS: {checkIn.lat.toFixed(4)}, {checkIn.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-xl p-5 border border-surface-border">
          <h2 className="text-sm font-bold text-navy mb-4">Activity Log</h2>

          {agent.activity_log.length === 0 ? (
            <p className="text-sm text-text-tertiary py-4 text-center">
              No activity recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {agent.activity_log.map((entry) => (
                <div
                  key={entry.id}
                  className="flex gap-3 p-3 rounded-lg bg-surface-bg border border-surface-border-light"
                >
                  <div className="shrink-0 mt-0.5">
                    <Activity className="h-4 w-4 text-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-text-primary">
                        {entry.action}
                      </p>
                      <span className="text-[10px] text-text-tertiary whitespace-nowrap">
                        {formatDateShort(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                      {entry.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
