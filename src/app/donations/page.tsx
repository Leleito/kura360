'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  HandCoins,
  Users,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Phone,
  CreditCard,
  FileText,
  Trophy,
} from 'lucide-react';
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
import {
  DONATION_METHODS,
  DONATION_METHOD_LABELS,
  ECFA_ANONYMOUS_THRESHOLD,
  type DonationMethod,
  type KYCStatus,
  type ComplianceStatus,
} from '@/lib/validators/donations';

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
/*  Mock Data                                                                 */
/* -------------------------------------------------------------------------- */

const MOCK_DONATIONS: Donation[] = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

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

function methodLabel(method: DonationMethod) {
  return DONATION_METHOD_LABELS[method];
}

/* -------------------------------------------------------------------------- */
/*  Page Component                                                            */
/* -------------------------------------------------------------------------- */

export default function DonationsPage() {
  const router = useRouter();

  /* ---- Filters ---- */
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [complianceFilter, setComplianceFilter] = useState('');

  /* ---- Modal ---- */
  const [modalOpen, setModalOpen] = useState(false);
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

  /* ---- Filtered data ---- */
  const filteredDonations = useMemo(() => {
    return MOCK_DONATIONS.filter((d) => {
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
  }, [search, methodFilter, kycFilter, complianceFilter]);

  /* ---- Summary stats ---- */
  const totalAmount = MOCK_DONATIONS.reduce((sum, d) => sum + d.amount, 0);
  const donorCount = new Set(MOCK_DONATIONS.filter((d) => !d.anonymous).map((d) => d.national_id)).size;
  const avgDonation = MOCK_DONATIONS.length > 0 ? Math.round(totalAmount / MOCK_DONATIONS.length) : 0;
  const compliantCount = MOCK_DONATIONS.filter((d) => d.compliance === 'compliant').length;
  const complianceRate = percentage(compliantCount, MOCK_DONATIONS.length);

  /* ---- Top donors ---- */
  const topDonors = useMemo(() => {
    const donorMap = new Map<string, { name: string; phone: string; total: number; count: number }>();
    for (const d of MOCK_DONATIONS) {
      if (d.anonymous) continue;
      const existing = donorMap.get(d.national_id);
      if (existing) {
        existing.total += d.amount;
        existing.count += 1;
      } else {
        donorMap.set(d.national_id, {
          name: d.donor_name,
          phone: d.donor_phone,
          total: d.amount,
          count: 1,
        });
      }
    }
    return Array.from(donorMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, []);

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

  const handleSubmit = () => {
    // In production, this would call the Supabase insert + run Zod validation
    // For now, just close the modal
    setModalOpen(false);
    resetForm();
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
        <span className="text-sm text-text-primary">{methodLabel(row.method)}</span>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-lg font-bold text-navy">Donations & Fundraising</h1>
          <p className="text-sm text-text-secondary">
            Track donations, enforce ECFA compliance, and manage donor KYC
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Record Donation
        </Button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Summary Cards                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Donations"
          value={formatKES(totalAmount)}
          sub={`${MOCK_DONATIONS.length} donations recorded`}
          variant="green"
        />
        <StatCard
          label="Unique Donors"
          value={donorCount.toLocaleString()}
          sub="KYC-verified individuals"
          variant="blue"
        />
        <StatCard
          label="Avg Donation"
          value={formatKES(avgDonation)}
          sub="Per contribution"
          variant="purple"
        />
        <StatCard
          label="Compliance Rate"
          value={`${complianceRate}%`}
          sub={`${compliantCount} of ${MOCK_DONATIONS.length} compliant`}
          variant={complianceRate >= 90 ? 'green' : complianceRate >= 70 ? 'orange' : 'red'}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Content: Table + Top Donors                                       */}
      {/* ------------------------------------------------------------------ */}
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
              Showing {filteredDonations.length} of {MOCK_DONATIONS.length} donations
            </p>
          </div>
        </div>

        {/* Top Donors Sidebar */}
        <div className="bg-white rounded-xl border border-surface-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-orange" />
            <h2 className="text-sm font-bold text-navy">Top Donors</h2>
          </div>
          <div className="space-y-3">
            {topDonors.map((donor, i) => (
              <div
                key={donor.phone}
                className="flex items-center gap-3"
              >
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
                  <p className="text-[10px] text-text-tertiary">
                    {donor.count} donation{donor.count > 1 ? 's' : ''}
                  </p>
                </div>
                <span className="text-sm font-semibold text-green whitespace-nowrap">
                  {formatKES(donor.total)}
                </span>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div className="mt-5 pt-4 border-t border-surface-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-tertiary">M-Pesa donations</span>
              <span className="text-xs font-semibold text-text-primary">
                {MOCK_DONATIONS.filter((d) => d.method === 'mpesa').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-tertiary">Bank transfers</span>
              <span className="text-xs font-semibold text-text-primary">
                {MOCK_DONATIONS.filter((d) => d.method === 'bank').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-tertiary">Flagged / Violations</span>
              <span className="text-xs font-semibold text-red">
                {MOCK_DONATIONS.filter((d) => d.compliance !== 'compliant').length}
              </span>
            </div>
          </div>
        </div>
      </div>

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
            placeholder="e.g. Wanjiku Kamau"
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
            <Button type="submit" disabled={showAnonymousWarning}>
              <HandCoins className="h-4 w-4" />
              Record Donation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
