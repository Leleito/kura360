'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  HandCoins,
  Users,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  Phone,
  CreditCard,
  FileText,
  Trophy,
  TrendingUp,
  Banknote,
  Building2,
  Receipt,
  Upload,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn, formatKES, formatDate, formatPhone, percentage } from '@/lib/utils';
import {
  Button,
  Input,
  Select,
  Textarea,
  Modal,
  DataTable,
  SearchInput,
  Badge,
  StatCard,
  Avatar,
} from '@/components/ui';
import type { Column } from '@/components/ui';
import { AnimatedCounter } from '@/components/premium';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/premium';
import {
  DONATION_METHODS,
  DONATION_METHOD_LABELS,
  ECFA_ANONYMOUS_THRESHOLD,
  ECFA_INDIVIDUAL_LIMIT,
  HIGH_VALUE_THRESHOLD,
  type DonationMethod,
  type KYCStatus,
  type ComplianceStatus,
} from '@/lib/validators/donations';
import { CSVImportForm } from '@/components/forms/csv-import-form';
import { useCampaign } from '@/lib/campaign-context';
import { RoleGate } from '@/lib/rbac';
import { getDonations } from '@/lib/actions/donations';
import { useUser } from '@/lib/auth/hooks';
import { createDonation } from '@/lib/actions/donations';
import type { Tables } from '@/types/database';
import Link from 'next/link';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface Donation {
  id: string;
  donor_name: string;
  donor_phone: string;
  national_id: string;
  amount: number;
  method: DonationMethod;
  reference: string;
  kyc_status: KYCStatus;
  compliance: ComplianceStatus;
  flagged_reason: string | null;
  anonymous: boolean;
  notes: string;
  donated_at: string;
  receipt_number: string;
  [key: string]: unknown;
}

/* -------------------------------------------------------------------------- */
/*  DB → UI mapper                                                            */
/* -------------------------------------------------------------------------- */

type DbDonation = Tables<'donations'>;

function inferMethod(d: DbDonation): DonationMethod {
  if (d.source === 'mpesa' || d.source === 'c2b' || d.source === 'stk_push' || d.mpesa_ref) return 'mpesa';
  if (d.source === 'bank') return 'bank';
  if (d.source === 'cheque') return 'cheque';
  if (d.source === 'cash') return 'cash';
  // Default: if mpesa_ref exists → mpesa, otherwise manual/cash
  return d.mpesa_ref ? 'mpesa' : 'cash';
}

function mapDbDonationToUI(d: DbDonation): Donation {
  return {
    id: d.id,
    donor_name: d.is_anonymous ? 'Anonymous Donor' : (d.donor_name ?? 'Unknown'),
    donor_phone: d.donor_phone ?? '',
    national_id: '',
    amount: d.amount_kes,
    method: inferMethod(d),
    reference: d.mpesa_ref ?? '',
    kyc_status: (d.kyc_status as KYCStatus) || 'pending',
    compliance: (d.compliance_status as ComplianceStatus) || 'compliant',
    flagged_reason: d.flagged_reason,
    anonymous: d.is_anonymous,
    notes: '',
    donated_at: d.donated_at,
    receipt_number: d.receipt_number ?? '',
  };
}

/** Build inflow chart data from donation list (aggregate by day) */
function buildInflowData(donations: Donation[]) {
  const dayMap = new Map<string, number>();
  for (const d of donations) {
    const day = new Date(d.donated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dayMap.set(day, (dayMap.get(day) ?? 0) + d.amount);
  }
  return Array.from(dayMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .slice(-20); // last 20 data points
}

/* -------------------------------------------------------------------------- */
/*  Method colors and chart data                                              */
/* -------------------------------------------------------------------------- */

const METHOD_COLORS: Record<DonationMethod, string> = {
  mpesa: '#1D6B3F',
  bank: '#2E75B6',
  cash: '#ED8936',
  cheque: '#805AD5',
};

/* -------------------------------------------------------------------------- */
/*  Filter options                                                            */
/* -------------------------------------------------------------------------- */

const METHOD_OPTIONS = [
  { value: '', label: 'All Methods' },
  ...DONATION_METHODS.map((m) => ({ value: m, label: DONATION_METHOD_LABELS[m] })),
];

const KYC_OPTIONS = [
  { value: '', label: 'All KYC' },
  { value: 'verified', label: 'Verified' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

const COMPLIANCE_OPTIONS = [
  { value: '', label: 'All Compliance' },
  { value: 'compliant', label: 'Compliant' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'violation', label: 'Violation' },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function kycBadge(status: KYCStatus) {
  const map: Record<KYCStatus, { text: string; variant: 'success' | 'warning' | 'danger' }> = {
    verified: { text: 'Verified', variant: 'success' },
    pending: { text: 'Pending', variant: 'warning' },
    failed: { text: 'Failed', variant: 'danger' },
  };
  const { text, variant } = map[status];
  return <Badge text={text} variant={variant} />;
}

function complianceBadge(status: ComplianceStatus) {
  const map: Record<ComplianceStatus, { text: string; variant: 'success' | 'warning' | 'danger' }> = {
    compliant: { text: 'Compliant', variant: 'success' },
    flagged: { text: 'Flagged', variant: 'warning' },
    violation: { text: 'Violation', variant: 'danger' },
  };
  const { text, variant } = map[status];
  return <Badge text={text} variant={variant} />;
}

function methodIcon(method: DonationMethod) {
  switch (method) {
    case 'mpesa':
      return <Smartphone className="h-3.5 w-3.5" />;
    case 'bank':
      return <Building2 className="h-3.5 w-3.5" />;
    case 'cash':
      return <Banknote className="h-3.5 w-3.5" />;
    case 'cheque':
      return <Receipt className="h-3.5 w-3.5" />;
  }
}

/* -------------------------------------------------------------------------- */
/*  Custom Tooltip for Area Chart                                             */
/* -------------------------------------------------------------------------- */

function InflowTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-surface-border px-3 py-2">
      <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-navy">{formatKES(payload[0].value)}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                            */
/* -------------------------------------------------------------------------- */

export default function DonationsPage() {
  const router = useRouter();
  const { campaign } = useCampaign();
  const { user } = useUser();
  const activeCampaignId = campaign?.id;

  /* ---- Data state ---- */
  const [allDonations, setAllDonations] = useState<Donation[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* ---- Filters ---- */
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [complianceFilter, setComplianceFilter] = useState('');

  /* ---- Modals ---- */
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    donor_name: '',
    donor_phone: '',
    amount: '',
    method: 'mpesa',
    reference: '',
    national_id: '',
    notes: '',
    anonymous: false,
  });

  /* ---- Fetch donations from Supabase ---- */
  const refreshDonations = useCallback(async () => {
    if (!activeCampaignId) return;
    setLoading(true);
    try {
      const result = await getDonations(activeCampaignId, { pageSize: 200 });
      if (result.data.length > 0) {
        setAllDonations(result.data.map(mapDbDonationToUI));
        setTotalCount(result.count);
      }
    } catch {
      // keep existing data on error
    } finally {
      setLoading(false);
    }
  }, [activeCampaignId]);

  useEffect(() => {
    refreshDonations();
  }, [refreshDonations]);

  /* ---- Filtered data ---- */
  const filteredDonations = useMemo(() => {
    return allDonations.filter((d) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch =
          d.donor_name.toLowerCase().includes(q) ||
          d.donor_phone.includes(q) ||
          d.reference.toLowerCase().includes(q) ||
          d.receipt_number.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (methodFilter && d.method !== methodFilter) return false;
      if (kycFilter && d.kyc_status !== kycFilter) return false;
      if (complianceFilter && d.compliance !== complianceFilter) return false;
      return true;
    });
  }, [allDonations, search, methodFilter, kycFilter, complianceFilter]);

  /* ---- Summary stats ---- */
  const totalAmount = allDonations.reduce((sum, d) => sum + d.amount, 0);
  const donorCount = new Set(allDonations.filter((d) => !d.anonymous).map((d) => d.donor_phone)).size;
  const mpesaDonations = allDonations.filter((d) => d.method === 'mpesa');
  const mpesaPercent = percentage(mpesaDonations.length, allDonations.length);
  const compliantCount = allDonations.filter((d) => d.compliance === 'compliant').length;
  const complianceRate = percentage(compliantCount, allDonations.length);

  /* ---- Inflow chart data from real donations ---- */
  const inflowData = useMemo(() => buildInflowData(allDonations), [allDonations]);

  /* ---- Method distribution for PieChart ---- */
  const methodDistribution = useMemo(() => {
    const counts: Record<DonationMethod, number> = { mpesa: 0, bank: 0, cash: 0, cheque: 0 };
    allDonations.forEach((d) => {
      counts[d.method] += d.amount;
    });
    return DONATION_METHODS.map((m) => ({
      name: DONATION_METHOD_LABELS[m],
      value: counts[m],
      color: METHOD_COLORS[m],
    })).filter((d) => d.value > 0);
  }, [allDonations]);

  /* ---- Top donors ---- */
  const topDonors = useMemo(() => {
    const donorMap = new Map<string, { name: string; phone: string; total: number; count: number; kyc: KYCStatus }>();
    for (const d of allDonations) {
      if (d.anonymous || !d.donor_phone) continue;
      const existing = donorMap.get(d.donor_phone);
      if (existing) {
        existing.total += d.amount;
        existing.count += 1;
      } else {
        donorMap.set(d.donor_phone, {
          name: d.donor_name,
          phone: d.donor_phone,
          total: d.amount,
          count: 1,
          kyc: d.kyc_status,
        });
      }
    }
    return Array.from(donorMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [allDonations]);

  /* ---- ECFA Compliance Alerts ---- */
  const ecfaAlerts = useMemo(() => {
    const alerts: { severity: 'danger' | 'warning'; message: string; donationId: string }[] = [];
    allDonations.forEach((d) => {
      if (d.anonymous && d.amount > ECFA_ANONYMOUS_THRESHOLD) {
        alerts.push({
          severity: 'danger',
          message: `Anonymous donation of ${formatKES(d.amount)} exceeds KES ${ECFA_ANONYMOUS_THRESHOLD.toLocaleString()} threshold`,
          donationId: d.id,
        });
      }
      if (d.amount > ECFA_INDIVIDUAL_LIMIT) {
        alerts.push({
          severity: 'danger',
          message: `${d.donor_name}: ${formatKES(d.amount)} exceeds individual limit of ${formatKES(ECFA_INDIVIDUAL_LIMIT)}`,
          donationId: d.id,
        });
      }
      if (d.amount >= HIGH_VALUE_THRESHOLD * 0.8 && d.amount < HIGH_VALUE_THRESHOLD) {
        alerts.push({
          severity: 'warning',
          message: `${d.donor_name}: ${formatKES(d.amount)} approaching high-value threshold`,
          donationId: d.id,
        });
      }
      if (d.kyc_status === 'pending' || d.kyc_status === 'failed') {
        alerts.push({
          severity: d.kyc_status === 'failed' ? 'danger' : 'warning',
          message: `${d.donor_name}: KYC ${d.kyc_status} -- verification required`,
          donationId: d.id,
        });
      }
    });
    return alerts;
  }, [allDonations]);

  /* ---- Anonymous amount warning ---- */
  const parsedAmount = parseFloat(formData.amount) || 0;
  const showAnonymousWarning = formData.anonymous && parsedAmount > ECFA_ANONYMOUS_THRESHOLD;

  /* ---- Form helpers ---- */
  const resetForm = () => {
    setFormData({
      donor_name: '',
      donor_phone: '',
      amount: '',
      method: 'mpesa',
      reference: '',
      national_id: '',
      notes: '',
      anonymous: false,
    });
  };

  const handleSubmit = async () => {
    if (!activeCampaignId || !user) return;
    setSubmitting(true);
    try {
      const phone = formData.anonymous ? null : (formData.donor_phone ? `+254${formData.donor_phone.replace(/\D/g, '')}` : null);
      const result = await createDonation(
        {
          campaign_id: activeCampaignId,
          amount_kes: parsedAmount,
          donor_name: formData.anonymous ? null : (formData.donor_name || null),
          donor_phone: phone,
          mpesa_ref: formData.method === 'mpesa' ? (formData.reference || null) : null,
          is_anonymous: formData.anonymous,
          source: formData.method === 'mpesa' ? 'manual' : formData.method,
          receipt_number: null,
        },
        user.id
      );
      if (result.error) {
        alert(result.error);
      } else {
        setModalOpen(false);
        resetForm();
        await refreshDonations();
      }
    } catch (err) {
      alert(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  /* ---- Table columns ---- */
  const columns: Column<Donation>[] = [
    {
      key: 'donated_at',
      label: 'Date',
      sortable: true,
      render: (row) => (
        <span className="text-text-secondary text-xs">{formatDate(row.donated_at)}</span>
      ),
    },
    {
      key: 'donor_name',
      label: 'Donor',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.donor_name} size="sm" />
          <div>
            <p className="text-sm font-medium text-text-primary">{row.donor_name}</p>
            <p className="text-xs text-text-tertiary">{formatPhone(row.donor_phone)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (row) => (
        <span className="text-sm font-semibold text-navy">{formatKES(row.amount)}</span>
      ),
    },
    {
      key: 'method',
      label: 'Method',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <span
            className="flex items-center justify-center h-5 w-5 rounded"
            style={{ backgroundColor: METHOD_COLORS[row.method] + '18', color: METHOD_COLORS[row.method] }}
          >
            {methodIcon(row.method)}
          </span>
          <span className="text-sm text-text-primary">{DONATION_METHOD_LABELS[row.method]}</span>
        </div>
      ),
    },
    {
      key: 'reference',
      label: 'Reference',
      render: (row) => (
        <span className="text-xs font-mono text-text-secondary">
          {row.reference || '--'}
        </span>
      ),
    },
    {
      key: 'kyc_status',
      label: 'KYC',
      sortable: true,
      render: (row) => kycBadge(row.kyc_status),
    },
    {
      key: 'compliance',
      label: 'Compliance',
      sortable: true,
      render: (row) => complianceBadge(row.compliance),
    },
  ];

  return (
    <div>
      {/* ------------------------------------------------------------------ */}
      {/*  Page Header                                                       */}
      {/* ------------------------------------------------------------------ */}
      <FadeIn direction="down" duration={0.4}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-navy flex items-center gap-2">
              <HandCoins className="h-6 w-6 text-green" />
              Donations & Fundraising
            </h1>
            <p className="text-sm text-text-secondary mt-0.5">
              Track donations, enforce ECFA compliance, and manage donor KYC verification
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RoleGate permission="donations:import">
              <Button variant="secondary" onClick={() => setImportModalOpen(true)}>
                <Upload className="h-4 w-4" />
                Import CSV
              </Button>
            </RoleGate>
            <Link
              data-tour="donation-portal"
              href="/donate"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-surface-border text-text-secondary hover:bg-surface-bg transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Donor Portal
            </Link>
            <RoleGate permission="donations:create">
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Record Donation
              </Button>
            </RoleGate>
          </div>
        </div>
      </FadeIn>

      {/* ------------------------------------------------------------------ */}
      {/*  Stat Cards with AnimatedCounter                                   */}
      {/* ------------------------------------------------------------------ */}
      <StaggerContainer data-tour="donations-overview" className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StaggerItem>
          <StatCard
            label="Total Donations"
            value={
              <AnimatedCounter
                value={totalAmount}
                formatter={(v) => formatKES(Math.round(v))}
                className="text-xl font-extrabold"
              />
            }
            sub={`${allDonations.length} donations recorded`}
            variant="green"
            icon={<HandCoins className="h-4 w-4" />}
            onClick={() => setModalOpen(true)}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Unique Donors"
            value={
              <AnimatedCounter
                value={donorCount}
                className="text-xl font-extrabold"
              />
            }
            sub="KYC-verified individuals"
            variant="blue"
            icon={<Users className="h-4 w-4" />}
            onClick={() => { setKycFilter('verified'); setMethodFilter(''); setComplianceFilter(''); }}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="M-Pesa Donations"
            value={
              <AnimatedCounter
                value={mpesaPercent}
                suffix="%"
                className="text-xl font-extrabold"
              />
            }
            sub={`${mpesaDonations.length} of ${allDonations.length} via M-Pesa`}
            variant="green"
            icon={<Smartphone className="h-4 w-4" />}
            onClick={() => { setMethodFilter('mpesa'); setKycFilter(''); setComplianceFilter(''); }}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Compliance Rate"
            value={
              <AnimatedCounter
                value={complianceRate}
                suffix="%"
                className="text-xl font-extrabold"
              />
            }
            sub={`${compliantCount} of ${allDonations.length} compliant`}
            variant={complianceRate >= 90 ? 'green' : complianceRate >= 70 ? 'orange' : 'red'}
            icon={<ShieldCheck className="h-4 w-4" />}
            onClick={() => { setComplianceFilter('flagged'); setMethodFilter(''); setKycFilter(''); }}
          />
        </StaggerItem>
      </StaggerContainer>

      {/* ------------------------------------------------------------------ */}
      {/*  Charts Row: Area + Pie + ECFA Alerts                              */}
      {/* ------------------------------------------------------------------ */}
      <FadeIn delay={0.2}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          {/* Donation Inflow Area Chart */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-surface-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-navy">Donation Inflow</h2>
                <p className="text-[10px] text-text-tertiary mt-0.5">Last 30 days</p>
              </div>
              <div className="flex items-center gap-1.5 text-green">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-semibold">+24%</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={inflowData}>
                <defs>
                  <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D6B3F" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1D6B3F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<InflowTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#1D6B3F"
                  strokeWidth={2}
                  fill="url(#inflowGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Donations by Method Pie Chart */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-surface-border p-5">
            <h2 className="text-sm font-bold text-navy mb-1">By Method</h2>
            <p className="text-[10px] text-text-tertiary mb-2">Amount distribution</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={methodDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {methodDistribution.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatKES(Number(value ?? 0))}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* ECFA Compliance Alerts */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-surface-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-navy flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange" />
                ECFA Compliance Alerts
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-pale text-red">
                {ecfaAlerts.length} alerts
              </span>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {ecfaAlerts.length === 0 ? (
                <p className="text-xs text-text-tertiary text-center py-6">
                  No compliance alerts. All donations within ECFA limits.
                </p>
              ) : (
                ecfaAlerts.map((alert, i) => (
                  <button
                    key={i}
                    onClick={() => router.push(`/donations/${alert.donationId}`)}
                    className={cn(
                      'w-full text-left flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors',
                      alert.severity === 'danger'
                        ? 'bg-red-pale/40 border-red/10 hover:border-red/30'
                        : 'bg-orange-pale/40 border-orange/10 hover:border-orange/30'
                    )}
                  >
                    <AlertTriangle
                      className={cn(
                        'h-3.5 w-3.5 shrink-0 mt-0.5',
                        alert.severity === 'danger' ? 'text-red' : 'text-orange'
                      )}
                    />
                    <p className="text-[11px] text-text-primary leading-snug">{alert.message}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ------------------------------------------------------------------ */}
      {/*  Content: Table + Top Donors                                       */}
      {/* ------------------------------------------------------------------ */}
      <FadeIn delay={0.35}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Table Area */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-surface-border">
            {/* Filters */}
            <div className="p-4 border-b border-surface-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search donors, refs..."
                />
                <Select
                  options={METHOD_OPTIONS}
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  placeholder="All Methods"
                />
                <Select
                  options={KYC_OPTIONS}
                  value={kycFilter}
                  onChange={(e) => setKycFilter(e.target.value)}
                  placeholder="All KYC"
                />
                <Select
                  options={COMPLIANCE_OPTIONS}
                  value={complianceFilter}
                  onChange={(e) => setComplianceFilter(e.target.value)}
                  placeholder="All Compliance"
                />
              </div>
            </div>

            {/* Table */}
            <DataTable<Donation>
              columns={columns}
              data={filteredDonations}
              onRowClick={(row) => router.push(`/donations/${row.id}`)}
              emptyMessage="No donations match your filters"
            />

            {/* Results count */}
            <div className="px-4 py-3 border-t border-surface-border">
              <p className="text-xs text-text-tertiary">
                {loading ? 'Loading donations...' : `Showing ${filteredDonations.length} of ${totalCount || allDonations.length} donations`}
              </p>
            </div>
          </div>

          {/* Top Donors Sidebar */}
          <div className="bg-white rounded-xl border border-surface-border p-4">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-4 w-4 text-orange" />
              <h2 className="text-sm font-bold text-navy">Top Donors</h2>
            </div>
            <StaggerContainer className="space-y-3" staggerDelay={0.06}>
              {topDonors.map((donor, i) => (
                <StaggerItem key={donor.phone}>
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold',
                        i === 0
                          ? 'bg-orange-pale text-orange'
                          : i === 1
                            ? 'bg-surface-border-light text-text-secondary'
                            : 'bg-surface-bg text-text-tertiary'
                      )}
                    >
                      {i + 1}
                    </span>
                    <Avatar name={donor.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {donor.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[10px] text-text-tertiary">
                          {donor.count} donation{donor.count > 1 ? 's' : ''}
                        </p>
                        {donor.kyc === 'verified' ? (
                          <ShieldCheck className="h-3 w-3 text-green" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 text-orange" />
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-green whitespace-nowrap">
                      {formatKES(donor.total)}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Quick stats */}
            <div className="mt-5 pt-4 border-t border-surface-border space-y-2.5">
              {DONATION_METHODS.map((m) => {
                const count = allDonations.filter((d) => d.method === m).length;
                if (count === 0) return null;
                return (
                  <div key={m} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: METHOD_COLORS[m] }}
                      />
                      <span className="text-xs text-text-tertiary">{DONATION_METHOD_LABELS[m]}</span>
                    </div>
                    <span className="text-xs font-semibold text-text-primary">{count}</span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between pt-1 border-t border-surface-border-light">
                <span className="text-xs text-text-tertiary">Flagged / Violations</span>
                <span className="text-xs font-semibold text-red">
                  {allDonations.filter((d) => d.compliance !== 'compliant').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ------------------------------------------------------------------ */}
      {/*  Record Donation Modal                                             */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title="Record Donation"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Anonymous warning */}
          {showAnonymousWarning && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-pale border border-red/20">
              <AlertTriangle className="h-5 w-5 text-red shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red">ECFA Violation</p>
                <p className="text-xs text-red/80 mt-0.5">
                  Anonymous donations exceeding KES{' '}
                  {ECFA_ANONYMOUS_THRESHOLD.toLocaleString()} are illegal under the
                  Election Campaign Financing Act. Donor identity must be collected
                  and verified before this donation can be recorded.
                </p>
              </div>
            </div>
          )}

          {/* Anonymous toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.anonymous}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, anonymous: e.target.checked }))
              }
              className="h-4 w-4 rounded border-surface-border text-green focus:ring-green/20"
            />
            <span className="text-sm text-text-primary">Anonymous donor</span>
          </label>

          {/* Donor Name */}
          <Input
            label="Donor Name"
            placeholder="e.g. Grace Wanjiku Muthoni"
            value={formData.donor_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, donor_name: e.target.value }))
            }
            disabled={formData.anonymous}
          />

          {/* Phone + National ID row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="712 345 678"
              prefix={
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  +254
                </span>
              }
              value={formData.donor_phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, donor_phone: e.target.value }))
              }
              disabled={formData.anonymous}
            />
            <Input
              label="National ID (KYC)"
              placeholder="e.g. 28456712"
              prefix={<FileText className="h-3.5 w-3.5" />}
              value={formData.national_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, national_id: e.target.value }))
              }
              maxLength={8}
              disabled={formData.anonymous}
            />
          </div>

          {/* Amount + Method row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Amount"
              type="number"
              placeholder="e.g. 50000"
              prefix={<span className="font-medium">KES</span>}
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              min={1}
            />
            <Select
              label="Payment Method"
              options={DONATION_METHODS.map((m) => ({
                value: m,
                label: DONATION_METHOD_LABELS[m],
              }))}
              value={formData.method}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, method: e.target.value }))
              }
            />
          </div>

          {/* Reference */}
          <Input
            label="Payment Reference"
            placeholder={
              formData.method === 'mpesa'
                ? 'e.g. QJH7T2KXMR (M-Pesa code)'
                : formData.method === 'bank'
                  ? 'e.g. KCB-TRF-98271'
                  : formData.method === 'cheque'
                    ? 'e.g. CHQ-00456'
                    : 'Reference number (optional)'
            }
            prefix={<CreditCard className="h-3.5 w-3.5" />}
            value={formData.reference}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, reference: e.target.value }))
            }
          />

          {/* Notes */}
          <Textarea
            label="Notes"
            placeholder="Additional notes about this donation..."
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            maxLength={500}
            showCount
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={showAnonymousWarning || submitting}>
              <HandCoins className="h-4 w-4" />
              {submitting ? 'Saving...' : 'Record Donation'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CSV Import Modal (Option B) */}
      <CSVImportForm
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        campaignId={campaign?.id ?? ''}
      />
    </div>
  );
}
