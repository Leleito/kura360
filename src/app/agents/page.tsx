'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  UserPlus,
  Phone,
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Modal,
  DataTable,
  SearchInput,
  Badge,
  Avatar,
  StatCard,
  ProgressBar,
} from '@/components/ui';
import type { Column } from '@/components/ui';
import { cn, formatPhone, formatDate, percentage } from '@/lib/utils';
import type { AgentStatus } from '@/lib/validators/agents';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Agent extends Record<string, unknown> {
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
// Mock data -- realistic Kenyan names and geography
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
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000011',
    full_name: 'Nyambura Githinji',
    phone: '+254712345011',
    national_id: '32109876',
    county: 'Kiambu',
    constituency: 'Juja',
    polling_station: 'JKUAT Main Gate Hall',
    status: 'active',
    last_check_in: '2026-02-27T07:10:00Z',
    photo_url: null,
  },
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000012',
    full_name: 'Onyango Simiyu',
    phone: '+254722345012',
    national_id: '28901234',
    county: 'Nakuru',
    constituency: 'Naivasha',
    polling_station: 'Naivasha DEB Primary School',
    status: 'pending',
    last_check_in: null,
    photo_url: null,
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COUNTY_OPTIONS = [
  { value: '', label: 'All Counties' },
  { value: 'Nairobi', label: 'Nairobi' },
  { value: 'Mombasa', label: 'Mombasa' },
  { value: 'Kisumu', label: 'Kisumu' },
  { value: 'Nakuru', label: 'Nakuru' },
  { value: 'Kiambu', label: 'Kiambu' },
  { value: 'Uasin Gishu', label: 'Uasin Gishu' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'deployed', label: 'Deployed' },
  { value: 'active', label: 'Active' },
  { value: 'checked-in', label: 'Checked In' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];

const FORM_COUNTY_OPTIONS = COUNTY_OPTIONS.filter((c) => c.value !== '');

const STATUS_BADGE_MAP: Record<AgentStatus, { text: string; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  deployed: { text: 'Deployed', variant: 'success' },
  active: { text: 'Active', variant: 'success' },
  'checked-in': { text: 'Checked In', variant: 'success' },
  inactive: { text: 'Inactive', variant: 'danger' },
  pending: { text: 'Pending', variant: 'warning' },
};

const DEPLOYMENT_TARGET = 1580;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AgentsPage() {
  const router = useRouter();

  // Filters
  const [search, setSearch] = useState('');
  const [countyFilter, setCountyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
  // Derived data
  // ---------------------------------------------------------------------------

  const filteredAgents = useMemo(() => {
    return MOCK_AGENTS.filter((agent) => {
      const matchesSearch =
        !search ||
        agent.full_name.toLowerCase().includes(search.toLowerCase()) ||
        agent.phone.includes(search) ||
        agent.polling_station.toLowerCase().includes(search.toLowerCase());

      const matchesCounty = !countyFilter || agent.county === countyFilter;
      const matchesStatus = !statusFilter || agent.status === statusFilter;

      return matchesSearch && matchesCounty && matchesStatus;
    });
  }, [search, countyFilter, statusFilter]);

  const totalAgents = MOCK_AGENTS.length;
  const deployedCount = MOCK_AGENTS.filter(
    (a) => a.status === 'deployed' || a.status === 'active' || a.status === 'checked-in'
  ).length;
  const checkedInCount = MOCK_AGENTS.filter((a) => a.status === 'checked-in').length;
  const pendingCount = MOCK_AGENTS.filter((a) => a.status === 'pending').length;

  // ---------------------------------------------------------------------------
  // Table columns
  // ---------------------------------------------------------------------------

  const columns: Column<Agent>[] = [
    {
      key: 'full_name',
      label: 'Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={row.full_name}
            src={row.photo_url}
            size="sm"
            online={row.status === 'checked-in' || row.status === 'active'}
          />
          <div>
            <p className="font-medium text-text-primary">{row.full_name}</p>
            <p className="text-xs text-text-tertiary">ID: {row.national_id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (row) => (
        <span className="text-text-secondary">{formatPhone(row.phone)}</span>
      ),
    },
    {
      key: 'county',
      label: 'County',
      sortable: true,
    },
    {
      key: 'constituency',
      label: 'Constituency',
      sortable: true,
    },
    {
      key: 'polling_station',
      label: 'Polling Station',
      render: (row) => (
        <span className="text-text-secondary text-xs">{row.polling_station}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const badge = STATUS_BADGE_MAP[row.status];
        return <Badge text={badge.text} variant={badge.variant} />;
      },
    },
    {
      key: 'last_check_in',
      label: 'Last Check-in',
      sortable: true,
      render: (row) =>
        row.last_check_in ? (
          <span className="text-xs text-text-secondary">
            {formatDate(row.last_check_in)}
          </span>
        ) : (
          <span className="text-xs text-text-tertiary">--</span>
        ),
    },
  ];

  // ---------------------------------------------------------------------------
  // Form handling
  // ---------------------------------------------------------------------------

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
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

    if (formData.full_name.trim().length < 2) {
      errors.full_name = 'Full name must be at least 2 characters';
    }
    if (!/^\+254[17]\d{8}$/.test(formData.phone)) {
      errors.phone = 'Phone must be in +254 format (e.g. +254712345678)';
    }
    if (!/^\d{8}$/.test(formData.national_id)) {
      errors.national_id = 'National ID must be exactly 8 digits';
    }
    if (!formData.county) {
      errors.county = 'County is required';
    }
    if (formData.constituency.trim().length < 2) {
      errors.constituency = 'Constituency is required';
    }
    if (formData.polling_station.trim().length < 2) {
      errors.polling_station = 'Polling station is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = () => {
    if (!validateForm()) return;

    // In production this would call the Supabase API
    // For now, just close the modal
    setShowRegisterModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      phone: '+254',
      national_id: '',
      county: '',
      constituency: '',
      polling_station: '',
    });
    setFormErrors({});
  };

  const handleRowClick = (row: Agent) => {
    router.push(`/agents/${row.id}`);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-navy">
            Agent Management
          </h1>
          <p className="text-xs text-text-tertiary mt-0.5">
            Deploy, track, and coordinate polling station agents across all 47 counties
          </p>
        </div>
        <Button onClick={() => setShowRegisterModal(true)}>
          <UserPlus className="h-4 w-4" />
          Register Agent
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total Agents"
          value={totalAgents.toLocaleString()}
          sub={`Target: ${DEPLOYMENT_TARGET.toLocaleString()}`}
          variant="navy"
        />
        <StatCard
          label="Deployed"
          value={deployedCount.toLocaleString()}
          sub={`${percentage(deployedCount, totalAgents)}% of registered`}
          variant="green"
        />
        <StatCard
          label="Checked In"
          value={checkedInCount.toLocaleString()}
          sub={`${percentage(checkedInCount, deployedCount)}% of deployed`}
          variant="blue"
        />
        <StatCard
          label="Pending Deployment"
          value={pendingCount.toLocaleString()}
          sub="Awaiting assignment"
          variant="orange"
        />
      </div>

      {/* Deployment Progress */}
      <div className="bg-white rounded-xl p-4 border border-surface-border mb-6">
        <h2 className="text-sm font-bold text-navy mb-3">Deployment Progress</h2>
        <ProgressBar
          value={deployedCount}
          max={DEPLOYMENT_TARGET}
          label={`${deployedCount.toLocaleString()} of ${DEPLOYMENT_TARGET.toLocaleString()} agents deployed`}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-surface-border mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by name, phone, or station..."
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={COUNTY_OPTIONS}
              value={countyFilter}
              onChange={(e) => setCountyFilter(e.target.value)}
              placeholder="All Counties"
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="All Statuses"
            />
          </div>
        </div>
      </div>

      {/* Agent Table */}
      <div className="bg-white rounded-xl border border-surface-border">
        <DataTable<Agent>
          columns={columns}
          data={filteredAgents}
          onRowClick={handleRowClick}
          emptyMessage="No agents match your filters. Try adjusting your search criteria."
        />
        {/* Table footer */}
        <div className="px-4 py-3 border-t border-surface-border-light">
          <p className="text-xs text-text-tertiary">
            Showing {filteredAgents.length} of {totalAgents} agents
          </p>
        </div>
      </div>

      {/* Registration Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => {
          setShowRegisterModal(false);
          resetForm();
        }}
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setShowRegisterModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRegister}>
              <UserPlus className="h-4 w-4" />
              Register Agent
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
