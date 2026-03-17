'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Phone,
  FileText,
  CreditCard,
  Calendar,
  Hash,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HandCoins,
  Receipt,
  Clock,
  Building2,
  Flag,
  Download,
  Smartphone,
  Banknote,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { cn, formatKES, formatDate, formatDateShort, formatPhone } from '@/lib/utils';
import { Button, Badge, Avatar } from '@/components/ui';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/premium';
import { AnimatedCounter } from '@/components/premium';
import {
  DONATION_METHOD_LABELS,
  ECFA_ANONYMOUS_THRESHOLD,
  ECFA_INDIVIDUAL_LIMIT,
  type DonationMethod,
  type KYCStatus,
  type ComplianceStatus,
} from '@/lib/validators/donations';
import { getDonationById, getDonationsByDonorPhone } from '@/lib/actions/donations';
import { useCampaign } from '@/lib/campaign-context';
import type { Tables } from '@/types/database';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface DonationDetail {
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
  created_at: string;
}

interface ComplianceCheck {
  label: string;
  description: string;
  passed: boolean;
}

/* -------------------------------------------------------------------------- */
/*  DB → UI mapping                                                           */
/* -------------------------------------------------------------------------- */

/** Infer DonationMethod from the DB source column and mpesa_ref */
function inferMethod(row: Tables<'donations'>): DonationMethod {
  const src = (row.source ?? '').toLowerCase();
  if (src === 'mpesa' || src === 'm-pesa' || row.mpesa_ref) return 'mpesa';
  if (src === 'bank') return 'bank';
  if (src === 'cheque') return 'cheque';
  if (src === 'cash') return 'cash';
  // fallback: if mpesa_ref exists treat as mpesa, otherwise cash
  return row.mpesa_ref ? 'mpesa' : 'cash';
}

/** Map a Supabase donations row to the UI DonationDetail shape */
function mapRowToDetail(row: Tables<'donations'>): DonationDetail {
  return {
    id: row.id,
    donor_name: row.donor_name ?? 'Unknown Donor',
    donor_phone: row.donor_phone ?? '',
    national_id: '', // not stored in DB — leave blank
    amount: row.amount_kes,
    method: inferMethod(row),
    reference: row.mpesa_ref ?? '',
    kyc_status: row.kyc_status as KYCStatus,
    compliance: row.compliance_status as ComplianceStatus,
    flagged_reason: row.flagged_reason,
    anonymous: row.is_anonymous,
    notes: '', // not stored in DB
    donated_at: row.donated_at,
    receipt_number: row.receipt_number ?? '',
    created_at: row.created_at,
  };
}

/* -------------------------------------------------------------------------- */
/*  Method colors + icons                                                     */
/* -------------------------------------------------------------------------- */

const METHOD_COLORS: Record<DonationMethod, string> = {
  mpesa: '#1D6B3F',
  bank: '#2E75B6',
  cash: '#ED8936',
  cheque: '#805AD5',
};

function methodIcon(method: DonationMethod) {
  switch (method) {
    case 'mpesa':
      return <Smartphone className="h-5 w-5" />;
    case 'bank':
      return <Building2 className="h-5 w-5" />;
    case 'cash':
      return <Banknote className="h-5 w-5" />;
    case 'cheque':
      return <Receipt className="h-5 w-5" />;
  }
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function kycIcon(status: KYCStatus) {
  switch (status) {
    case 'verified':
      return <ShieldCheck className="h-5 w-5 text-green" />;
    case 'pending':
      return <ShieldAlert className="h-5 w-5 text-orange" />;
    case 'failed':
      return <ShieldX className="h-5 w-5 text-red" />;
  }
}

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

function maskNationalId(id: string): string {
  if (id.length <= 3) return id;
  return id.slice(0, 2) + '*'.repeat(id.length - 4) + id.slice(-2);
}

function buildComplianceChecks(donation: DonationDetail): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];

  checks.push({
    label: 'Anonymous Threshold',
    description: `Anonymous donations must not exceed KES ${ECFA_ANONYMOUS_THRESHOLD.toLocaleString()}`,
    passed: !(donation.anonymous && donation.amount > ECFA_ANONYMOUS_THRESHOLD),
  });

  checks.push({
    label: 'KYC Verification',
    description: 'Donor identity must be verified with a valid national ID',
    passed: donation.kyc_status === 'verified',
  });

  checks.push({
    label: 'Individual Limit',
    description: `Single donation must not exceed KES ${ECFA_INDIVIDUAL_LIMIT.toLocaleString()}`,
    passed: donation.amount <= ECFA_INDIVIDUAL_LIMIT,
  });

  checks.push({
    label: 'Payment Reference',
    description: 'A valid payment reference or receipt number must be recorded',
    passed: donation.reference.length > 0 || donation.method === 'cash',
  });

  checks.push({
    label: 'Donor Contact',
    description: 'Donor phone number must be a valid Kenyan number (+254...)',
    passed: !donation.anonymous && donation.donor_phone.startsWith('+254'),
  });

  checks.push({
    label: 'Receipt Issued',
    description: 'An official campaign receipt must be generated for each donation',
    passed: donation.receipt_number.length > 0,
  });

  return checks;
}

/* -------------------------------------------------------------------------- */
/*  Detail Row Component                                                      */
/* -------------------------------------------------------------------------- */

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="h-4 w-4 text-text-tertiary mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wide font-semibold text-text-tertiary">
          {label}
        </p>
        <div className="text-sm text-text-primary mt-0.5">{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                            */
/* -------------------------------------------------------------------------- */

export default function DonationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { campaign } = useCampaign();

  const [donation, setDonation] = useState<DonationDetail | null>(null);
  const [donorHistory, setDonorHistory] = useState<DonationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDonation = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getDonationById(id);

    if (result.error || !result.data) {
      setError(result.error ?? 'Donation not found');
      setLoading(false);
      return;
    }

    const mapped = mapRowToDetail(result.data);
    setDonation(mapped);

    // Fetch related donations from same donor
    if (result.data.donor_phone && campaign?.id) {
      const historyResult = await getDonationsByDonorPhone(
        campaign.id,
        result.data.donor_phone,
        id
      );
      if (historyResult.data.length > 0) {
        setDonorHistory(historyResult.data.map(mapRowToDetail));
      }
    }

    setLoading(false);
  }, [id, campaign?.id]);

  useEffect(() => {
    fetchDonation();
  }, [fetchDonation]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-blue animate-spin mb-4" />
        <p className="text-sm text-text-secondary">Loading donation details...</p>
      </div>
    );
  }

  // 404 / error fallback
  if (!donation || error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-16 w-16 rounded-full bg-surface-bg flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-text-tertiary" />
        </div>
        <p className="text-lg font-semibold text-text-primary mb-2">
          Donation not found
        </p>
        <p className="text-sm text-text-secondary mb-4">
          {error ?? `The donation record "${id}" could not be located.`}
        </p>
        <Button variant="secondary" onClick={() => router.push('/donations')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Donations
        </Button>
      </div>
    );
  }

  const complianceChecks = buildComplianceChecks(donation);
  const passedChecks = complianceChecks.filter((c) => c.passed).length;
  const totalFromDonor =
    donation.amount + donorHistory.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div>
      {/* ---- Header ---- */}
      <FadeIn direction="down" duration={0.35}>
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/donations')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-navy">Donation Detail</h1>
            <p className="text-xs text-text-tertiary font-mono">{donation.id}</p>
          </div>
          <div className="flex items-center gap-2">
            {complianceBadge(donation.compliance)}
            {kycBadge(donation.kyc_status)}
          </div>
        </div>
      </FadeIn>

      {/* ---- Flagged warning banner ---- */}
      {donation.flagged_reason && (
        <FadeIn delay={0.1}>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-pale border border-red/20 mb-6">
            <div className="h-8 w-8 rounded-lg bg-red/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red">Compliance Issue Detected</p>
              <p className="text-xs text-red/80 mt-0.5">{donation.flagged_reason}</p>
              <p className="text-[10px] text-text-tertiary mt-1">
                This donation has been flagged under the Election Campaign Financing Act.
                Immediate action is required.
              </p>
            </div>
          </div>
        </FadeIn>
      )}

      {/* ---- Hero Amount Card ---- */}
      <FadeIn delay={0.15}>
        <div className="bg-white rounded-xl border border-surface-border p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="h-14 w-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: METHOD_COLORS[donation.method] + '15', color: METHOD_COLORS[donation.method] }}
              >
                {methodIcon(donation.method)}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide font-semibold text-text-tertiary">
                  Donation Amount
                </p>
                <AnimatedCounter
                  value={donation.amount}
                  formatter={(v) => formatKES(Math.round(v))}
                  className="text-3xl font-extrabold text-navy"
                />
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: METHOD_COLORS[donation.method] + '15', color: METHOD_COLORS[donation.method] }}
                  >
                    {methodIcon(donation.method)}
                    {DONATION_METHOD_LABELS[donation.method]}
                  </span>
                  <span className="text-xs text-text-tertiary font-mono">
                    {donation.reference || 'No reference'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm">
                <ShieldCheck className="h-4 w-4" />
                Verify KYC
              </Button>
              <Button variant="secondary" size="sm">
                <Flag className="h-4 w-4" />
                Flag
              </Button>
              <Button variant="secondary" size="sm">
                <Receipt className="h-4 w-4" />
                Generate Receipt
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ---- Content Grid ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Donor Profile */}
        <FadeIn delay={0.2}>
          <div className="bg-white rounded-xl border border-surface-border p-5">
            <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
              <User className="h-4 w-4" />
              Donor Profile
            </h2>

            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-surface-border">
              <Avatar name={donation.donor_name} size="lg" />
              <div>
                <p className="text-base font-semibold text-text-primary">
                  {donation.donor_name}
                </p>
                <p className="text-xs text-text-tertiary">
                  {donation.anonymous ? 'Anonymous Donor' : 'Identified Donor'}
                </p>
                <div className="mt-1">
                  {kycBadge(donation.kyc_status)}
                </div>
              </div>
            </div>

            <div className="divide-y divide-surface-border-light">
              <DetailRow icon={Phone} label="Phone">
                {donation.donor_phone ? formatPhone(donation.donor_phone) : 'N/A'}
              </DetailRow>
              {donation.national_id && (
                <DetailRow icon={FileText} label="National ID">
                  <span className="font-mono">{maskNationalId(donation.national_id)}</span>
                </DetailRow>
              )}
              <DetailRow icon={ShieldCheck} label="KYC Status">
                <div className="flex items-center gap-2">
                  {kycIcon(donation.kyc_status)}
                  <span
                    className={cn(
                      'font-medium capitalize',
                      donation.kyc_status === 'verified'
                        ? 'text-green'
                        : donation.kyc_status === 'pending'
                          ? 'text-orange'
                          : 'text-red'
                    )}
                  >
                    {donation.kyc_status}
                  </span>
                </div>
              </DetailRow>
              <DetailRow icon={HandCoins} label="Total from Donor">
                <span className="font-semibold text-navy">{formatKES(totalFromDonor)}</span>
                <span className="text-xs text-text-tertiary ml-1">
                  ({donorHistory.length + 1} donation{donorHistory.length > 0 ? 's' : ''})
                </span>
              </DetailRow>
            </div>
          </div>
        </FadeIn>

        {/* Column 2: Donation Details */}
        <FadeIn delay={0.3}>
          <div className="space-y-4">
            {/* Donation Details */}
            <div className="bg-white rounded-xl border border-surface-border p-5">
              <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Donation Details
              </h2>
              <div className="divide-y divide-surface-border-light">
                <DetailRow icon={Building2} label="Payment Method">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center justify-center h-6 w-6 rounded"
                      style={{ backgroundColor: METHOD_COLORS[donation.method] + '15', color: METHOD_COLORS[donation.method] }}
                    >
                      {methodIcon(donation.method)}
                    </span>
                    <span className="font-medium">{DONATION_METHOD_LABELS[donation.method]}</span>
                  </div>
                </DetailRow>
                <DetailRow icon={Hash} label="Reference">
                  <span className="font-mono font-medium">
                    {donation.reference || 'N/A'}
                  </span>
                </DetailRow>
                <DetailRow icon={Calendar} label="Donation Date">
                  {formatDate(donation.donated_at)}
                </DetailRow>
                <DetailRow icon={Clock} label="Recorded At">
                  {formatDate(donation.created_at)}
                </DetailRow>
                {donation.notes && (
                  <DetailRow icon={FileText} label="Notes">
                    <p className="text-text-secondary">{donation.notes}</p>
                  </DetailRow>
                )}
              </div>
            </div>

            {/* Receipt Card */}
            <div className="bg-white rounded-xl border border-surface-border p-5">
              <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Receipt
              </h2>
              <div className="divide-y divide-surface-border-light">
                <DetailRow icon={Hash} label="Receipt Number">
                  <span className="font-mono font-semibold text-blue">
                    {donation.receipt_number || 'Not issued'}
                  </span>
                </DetailRow>
                <DetailRow icon={Calendar} label="Issue Date">
                  {formatDateShort(donation.created_at)}
                </DetailRow>
                <DetailRow icon={User} label="Issued To">
                  {donation.anonymous ? 'Anonymous' : donation.donor_name}
                </DetailRow>
              </div>
              <div className="mt-4">
                <Button variant="secondary" size="sm" className="w-full">
                  <Download className="h-4 w-4" />
                  Download Receipt
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Column 3: Compliance + History */}
        <FadeIn delay={0.4}>
          <div className="space-y-4">
            {/* ECFA Compliance Checks */}
            <div className="bg-white rounded-xl border border-surface-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-navy flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  ECFA Compliance
                </h2>
                <span
                  className={cn(
                    'text-xs font-bold px-2.5 py-1 rounded-full',
                    passedChecks === complianceChecks.length
                      ? 'bg-green-pale text-green'
                      : 'bg-red-pale text-red'
                  )}
                >
                  {passedChecks}/{complianceChecks.length} passed
                </span>
              </div>
              <StaggerContainer className="space-y-2" staggerDelay={0.05}>
                {complianceChecks.map((check) => (
                  <StaggerItem key={check.label}>
                    <div
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border transition-all',
                        check.passed
                          ? 'bg-green-pale/20 border-green/10'
                          : 'bg-red-pale/20 border-red/10'
                      )}
                    >
                      {check.passed ? (
                        <div className="h-5 w-5 rounded-full bg-green/10 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-red/10 flex items-center justify-center shrink-0 mt-0.5">
                          <XCircle className="h-3.5 w-3.5 text-red" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-xs font-semibold',
                            check.passed ? 'text-green' : 'text-red'
                          )}
                        >
                          {check.label}
                        </p>
                        <p className="text-[10px] text-text-tertiary mt-0.5 leading-relaxed">
                          {check.description}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>

            {/* Donor History */}
            <div className="bg-white rounded-xl border border-surface-border p-5">
              <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Donation History
              </h2>
              {donorHistory.length === 0 ? (
                <div className="text-center py-6">
                  <div className="h-10 w-10 rounded-full bg-surface-bg flex items-center justify-center mx-auto mb-2">
                    <HandCoins className="h-5 w-5 text-text-tertiary" />
                  </div>
                  <p className="text-xs text-text-tertiary">
                    No other donations from this donor
                  </p>
                </div>
              ) : (
                <StaggerContainer className="space-y-2" staggerDelay={0.06}>
                  {donorHistory.map((d) => (
                    <StaggerItem key={d.id}>
                      <button
                        onClick={() => router.push(`/donations/${d.id}`)}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-surface-border-light hover:bg-surface-bg hover:border-surface-border transition-all text-left group"
                      >
                        <div>
                          <p className="text-sm font-medium text-text-primary group-hover:text-navy transition-colors">
                            {formatKES(d.amount)}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: METHOD_COLORS[d.method] }}
                            />
                            <p className="text-[10px] text-text-tertiary">
                              {formatDateShort(d.donated_at)} via{' '}
                              {DONATION_METHOD_LABELS[d.method]}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {complianceBadge(d.compliance)}
                          <ExternalLink className="h-3 w-3 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
