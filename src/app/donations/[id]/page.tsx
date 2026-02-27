'use client';

import { use } from 'react';
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
} from 'lucide-react';
import { cn, formatKES, formatDate, formatDateShort, formatPhone } from '@/lib/utils';
import { Button, Badge, Avatar } from '@/components/ui';
import {
  DONATION_METHOD_LABELS,
  ECFA_ANONYMOUS_THRESHOLD,
  ECFA_INDIVIDUAL_LIMIT,
  type DonationMethod,
  type KYCStatus,
  type ComplianceStatus,
} from '@/lib/validators/donations';

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
/*  Mock Data — Full donation records keyed by ID                             */
/* -------------------------------------------------------------------------- */

const MOCK_DONATIONS: Record<string, DonationDetail> = {
  don_001: {
    id: 'don_001',
    donor_name: 'Wanjiku Kamau',
    donor_phone: '+254712345678',
    national_id: '28456712',
    amount: 50_000,
    method: 'mpesa',
    reference: 'QJH7T2KXMR',
    kyc_status: 'verified',
    compliance: 'compliant',
    flagged_reason: null,
    anonymous: false,
    notes: 'Monthly supporter contribution',
    donated_at: '2026-02-27T09:30:00Z',
    receipt_number: 'RCP-2026-0001',
    created_at: '2026-02-27T09:31:12Z',
  },
  don_002: {
    id: 'don_002',
    donor_name: 'Ochieng Otieno',
    donor_phone: '+254723456789',
    national_id: '31245890',
    amount: 150_000,
    method: 'bank',
    reference: 'KCB-TRF-98271',
    kyc_status: 'verified',
    compliance: 'compliant',
    flagged_reason: null,
    anonymous: false,
    notes: 'Bank transfer from Equity account',
    donated_at: '2026-02-26T14:15:00Z',
    receipt_number: 'RCP-2026-0002',
    created_at: '2026-02-26T14:16:45Z',
  },
  don_003: {
    id: 'don_003',
    donor_name: 'Akinyi Nyambura',
    donor_phone: '+254734567890',
    national_id: '27893456',
    amount: 25_000,
    method: 'mpesa',
    reference: 'RNL4P8VBZQ',
    kyc_status: 'verified',
    compliance: 'compliant',
    flagged_reason: null,
    anonymous: false,
    notes: '',
    donated_at: '2026-02-25T11:45:00Z',
    receipt_number: 'RCP-2026-0003',
    created_at: '2026-02-25T11:46:33Z',
  },
  don_004: {
    id: 'don_004',
    donor_name: 'Anonymous Donor',
    donor_phone: '+254700000000',
    national_id: '00000000',
    amount: 8_000,
    method: 'cash',
    reference: '',
    kyc_status: 'failed',
    compliance: 'violation',
    flagged_reason: 'Anonymous donation exceeds KES 5,000 ECFA threshold',
    anonymous: true,
    notes: 'Cash donation at Nairobi rally',
    donated_at: '2026-02-24T16:20:00Z',
    receipt_number: 'RCP-2026-0004',
    created_at: '2026-02-24T16:21:08Z',
  },
  don_005: {
    id: 'don_005',
    donor_name: 'Mutua Kioko',
    donor_phone: '+254745678901',
    national_id: '34567823',
    amount: 100_000,
    method: 'cheque',
    reference: 'CHQ-00456',
    kyc_status: 'verified',
    compliance: 'compliant',
    flagged_reason: null,
    anonymous: false,
    notes: 'Co-operative Bank cheque',
    donated_at: '2026-02-23T10:00:00Z',
    receipt_number: 'RCP-2026-0005',
    created_at: '2026-02-23T10:01:22Z',
  },
  don_006: {
    id: 'don_006',
    donor_name: 'Njeri Mwangi',
    donor_phone: '+254756789012',
    national_id: '29876543',
    amount: 10_000,
    method: 'mpesa',
    reference: 'TYK9M3HDWF',
    kyc_status: 'pending',
    compliance: 'flagged',
    flagged_reason: 'KYC verification incomplete',
    anonymous: false,
    notes: 'Awaiting ID verification',
    donated_at: '2026-02-22T08:30:00Z',
    receipt_number: 'RCP-2026-0006',
    created_at: '2026-02-22T08:31:55Z',
  },
  don_007: {
    id: 'don_007',
    donor_name: 'Kipchoge Ruto',
    donor_phone: '+254767890123',
    national_id: '25678934',
    amount: 75_000,
    method: 'bank',
    reference: 'EQT-TRF-54382',
    kyc_status: 'verified',
    compliance: 'compliant',
    flagged_reason: null,
    anonymous: false,
    notes: 'Equity Bank transfer',
    donated_at: '2026-02-21T15:45:00Z',
    receipt_number: 'RCP-2026-0007',
    created_at: '2026-02-21T15:46:30Z',
  },
  don_008: {
    id: 'don_008',
    donor_name: 'Fatuma Hassan',
    donor_phone: '+254778901234',
    national_id: '32145678',
    amount: 5_000,
    method: 'mpesa',
    reference: 'BNX2L6JCPA',
    kyc_status: 'verified',
    compliance: 'compliant',
    flagged_reason: null,
    anonymous: false,
    notes: 'Small donor — grassroots contribution',
    donated_at: '2026-02-20T12:10:00Z',
    receipt_number: 'RCP-2026-0008',
    created_at: '2026-02-20T12:11:15Z',
  },
  don_009: {
    id: 'don_009',
    donor_name: 'Omondi Juma',
    donor_phone: '+254789012345',
    national_id: '27654321',
    amount: 200_000,
    method: 'bank',
    reference: 'NCBA-TRF-11029',
    kyc_status: 'verified',
    compliance: 'compliant',
    flagged_reason: null,
    anonymous: false,
    notes: 'NCBA Bank transfer — business supporter',
    donated_at: '2026-02-19T09:00:00Z',
    receipt_number: 'RCP-2026-0009',
    created_at: '2026-02-19T09:01:40Z',
  },
  don_010: {
    id: 'don_010',
    donor_name: 'Chebet Langat',
    donor_phone: '+254790123456',
    national_id: '30987654',
    amount: 3_000,
    method: 'mpesa',
    reference: 'WSG5R1PMNE',
    kyc_status: 'pending',
    compliance: 'flagged',
    flagged_reason: 'KYC verification incomplete',
    anonymous: false,
    notes: '',
    donated_at: '2026-02-18T17:30:00Z',
    receipt_number: 'RCP-2026-0010',
    created_at: '2026-02-18T17:31:05Z',
  },
  don_011: {
    id: 'don_011',
    donor_name: 'Amina Wekesa',
    donor_phone: '+254701234567',
    national_id: '26543210',
    amount: 30_000,
    method: 'mpesa',
    reference: 'FKQ8D4YNVT',
    kyc_status: 'verified',
    compliance: 'compliant',
    flagged_reason: null,
    anonymous: false,
    notes: 'Recurring monthly donor',
    donated_at: '2026-02-17T13:15:00Z',
    receipt_number: 'RCP-2026-0011',
    created_at: '2026-02-17T13:16:20Z',
  },
  don_012: {
    id: 'don_012',
    donor_name: 'Barasa Wafula',
    donor_phone: '+254712098765',
    national_id: '33210987',
    amount: 45_000,
    method: 'cheque',
    reference: 'CHQ-00891',
    kyc_status: 'verified',
    compliance: 'compliant',
    flagged_reason: null,
    anonymous: false,
    notes: 'KCB cheque deposit',
    donated_at: '2026-02-16T10:45:00Z',
    receipt_number: 'RCP-2026-0012',
    created_at: '2026-02-16T10:46:50Z',
  },
};

/**
 * Mock donation history (previous donations from the same donor).
 * In production, this would be a Supabase query filtered by national_id.
 */
function getDonorHistory(nationalId: string, currentId: string): DonationDetail[] {
  return Object.values(MOCK_DONATIONS).filter(
    (d) => d.national_id === nationalId && d.id !== currentId
  );
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

function buildComplianceChecks(donation: DonationDetail): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];

  // 1. Anonymous threshold check
  checks.push({
    label: 'Anonymous Threshold',
    description: `Anonymous donations must not exceed KES ${ECFA_ANONYMOUS_THRESHOLD.toLocaleString()}`,
    passed: !(donation.anonymous && donation.amount > ECFA_ANONYMOUS_THRESHOLD),
  });

  // 2. KYC verification
  checks.push({
    label: 'KYC Verification',
    description: 'Donor identity must be verified with a valid national ID',
    passed: donation.kyc_status === 'verified',
  });

  // 3. Individual donation limit
  checks.push({
    label: 'Individual Limit',
    description: `Single donation must not exceed KES ${ECFA_INDIVIDUAL_LIMIT.toLocaleString()}`,
    passed: donation.amount <= ECFA_INDIVIDUAL_LIMIT,
  });

  // 4. Payment reference
  checks.push({
    label: 'Payment Reference',
    description: 'A valid payment reference or receipt number must be recorded',
    passed: donation.reference.length > 0 || donation.method === 'cash',
  });

  // 5. Donor contact info
  checks.push({
    label: 'Donor Contact',
    description: 'Donor phone number must be a valid Kenyan number (+254...)',
    passed: !donation.anonymous && donation.donor_phone.startsWith('+254'),
  });

  // 6. Receipt issued
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
    <div className="flex items-start gap-3 py-2.5">
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

  const donation = MOCK_DONATIONS[id];

  // 404 fallback
  if (!donation) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-semibold text-text-primary mb-2">
          Donation not found
        </p>
        <p className="text-sm text-text-secondary mb-4">
          The donation record &quot;{id}&quot; could not be located.
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
  const donorHistory = getDonorHistory(donation.national_id, donation.id);
  const totalFromDonor =
    donation.amount + donorHistory.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div>
      {/* ---- Header ---- */}
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
          <h1 className="text-lg font-bold text-navy">Donation Detail</h1>
          <p className="text-xs text-text-tertiary font-mono">{donation.id}</p>
        </div>
        <div className="flex items-center gap-2">
          {complianceBadge(donation.compliance)}
          {kycBadge(donation.kyc_status)}
        </div>
      </div>

      {/* ---- Flagged warning banner ---- */}
      {donation.flagged_reason && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-pale border border-red/20 mb-6">
          <AlertTriangle className="h-5 w-5 text-red shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red">Compliance Issue</p>
            <p className="text-xs text-red/80 mt-0.5">{donation.flagged_reason}</p>
          </div>
        </div>
      )}

      {/* ---- Content Grid ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Donor Info */}
        <div className="bg-white rounded-xl border border-surface-border p-5">
          <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
            <User className="h-4 w-4" />
            Donor Information
          </h2>

          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-surface-border">
            <Avatar name={donation.donor_name} size="lg" />
            <div>
              <p className="text-base font-semibold text-text-primary">
                {donation.donor_name}
              </p>
              <p className="text-xs text-text-tertiary">
                {donation.anonymous ? 'Anonymous Donor' : 'Identified Donor'}
              </p>
            </div>
          </div>

          <div className="divide-y divide-surface-border-light">
            <DetailRow icon={Phone} label="Phone">
              {formatPhone(donation.donor_phone)}
            </DetailRow>
            <DetailRow icon={FileText} label="National ID">
              <span className="font-mono">{donation.national_id}</span>
            </DetailRow>
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

        {/* Column 2: Donation Details + Receipt */}
        <div className="space-y-4">
          {/* Donation Details */}
          <div className="bg-white rounded-xl border border-surface-border p-5">
            <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Donation Details
            </h2>
            <div className="divide-y divide-surface-border-light">
              <DetailRow icon={HandCoins} label="Amount">
                <span className="text-xl font-extrabold text-green">
                  {formatKES(donation.amount)}
                </span>
              </DetailRow>
              <DetailRow icon={Building2} label="Payment Method">
                {DONATION_METHOD_LABELS[donation.method]}
              </DetailRow>
              <DetailRow icon={Hash} label="Reference">
                <span className="font-mono">
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
                  {donation.notes}
                </DetailRow>
              )}
            </div>
          </div>

          {/* Receipt Card */}
          <div className="bg-white rounded-xl border border-surface-border p-5">
            <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Receipt & Confirmation
            </h2>
            <div className="divide-y divide-surface-border-light">
              <DetailRow icon={Hash} label="Receipt Number">
                <span className="font-mono font-semibold text-blue">
                  {donation.receipt_number}
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
                <Receipt className="h-4 w-4" />
                Download Receipt
              </Button>
            </div>
          </div>
        </div>

        {/* Column 3: Compliance Checks + Donor History */}
        <div className="space-y-4">
          {/* Compliance Checks */}
          <div className="bg-white rounded-xl border border-surface-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-navy flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Compliance Checks
              </h2>
              <span
                className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded-full',
                  passedChecks === complianceChecks.length
                    ? 'bg-green-pale text-green'
                    : 'bg-red-pale text-red'
                )}
              >
                {passedChecks}/{complianceChecks.length} passed
              </span>
            </div>
            <div className="space-y-2">
              {complianceChecks.map((check) => (
                <div
                  key={check.label}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border',
                    check.passed
                      ? 'bg-green-pale/30 border-green/10'
                      : 'bg-red-pale/30 border-red/10'
                  )}
                >
                  {check.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-green shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p
                      className={cn(
                        'text-xs font-semibold',
                        check.passed ? 'text-green' : 'text-red'
                      )}
                    >
                      {check.label}
                    </p>
                    <p className="text-[10px] text-text-tertiary mt-0.5">
                      {check.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Donor History */}
          <div className="bg-white rounded-xl border border-surface-border p-5">
            <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Donation History
            </h2>
            {donorHistory.length === 0 ? (
              <p className="text-xs text-text-tertiary py-4 text-center">
                No other donations from this donor
              </p>
            ) : (
              <div className="space-y-2">
                {donorHistory.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => router.push(`/donations/${d.id}`)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-surface-border-light hover:bg-surface-bg transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {formatKES(d.amount)}
                      </p>
                      <p className="text-[10px] text-text-tertiary">
                        {formatDateShort(d.donated_at)} via{' '}
                        {DONATION_METHOD_LABELS[d.method]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {complianceBadge(d.compliance)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
