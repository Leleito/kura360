export interface TourStep {
  /** CSS selector targeting a data-tour attribute */
  selector: string;
  /** Display title for this step */
  title: string;
  /** Explanatory text shown in the tooltip */
  description: string;
  /** Route path where the target element lives */
  page: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    selector: '[data-tour="stat-balance"]',
    title: 'Campaign Balance',
    description:
      'Track your total campaign spending against the ECFA limit in real-time.',
    page: '/dashboard',
  },
  {
    selector: '[data-tour="stat-compliance"]',
    title: 'Compliance Score',
    description:
      'Monitor your ECFA compliance score \u2014 stays green above 90%.',
    page: '/dashboard',
  },
  {
    selector: '[data-tour="chart-spending"]',
    title: 'Spending Trends',
    description: 'View daily spending patterns over the last 30 days.',
    page: '/dashboard',
  },
  {
    selector: '[data-tour="chart-category"]',
    title: 'ECFA Categories',
    description:
      'See budget allocation across the 6 ECFA spending categories.',
    page: '/dashboard',
  },
  {
    selector: '[data-tour="alerts"]',
    title: 'Compliance Alerts',
    description:
      'Real-time alerts for threshold breaches and violations.',
    page: '/dashboard',
  },
  {
    selector: '[data-tour="finance-overview"]',
    title: 'Finance Overview',
    description:
      'Complete financial overview with spending summaries and trends.',
    page: '/finance',
  },
  {
    selector: '[data-tour="record-transaction"]',
    title: 'Record Transaction',
    description:
      'Log campaign expenditures with receipts and ECFA category tracking.',
    page: '/finance',
  },
  {
    selector: '[data-tour="transactions-table"]',
    title: 'Transaction Ledger',
    description:
      'Full transaction history with search, filters, and CSV export.',
    page: '/finance/transactions',
  },
  {
    selector: '[data-tour="agents-map"]',
    title: 'Agent Deployment',
    description:
      'View field agent deployment across counties and constituencies.',
    page: '/agents',
  },
  {
    selector: '[data-tour="agent-add"]',
    title: 'Register Agent',
    description:
      'Register polling station agents with KYC verification.',
    page: '/agents',
  },
  {
    selector: '[data-tour="evidence-gallery"]',
    title: 'Evidence Vault',
    description:
      'SHA-256 hashed evidence vault for photos, videos, and documents.',
    page: '/evidence',
  },
  {
    selector: '[data-tour="evidence-upload"]',
    title: 'Upload Evidence',
    description:
      'Upload and hash evidence files for tamper-proof storage.',
    page: '/evidence',
  },
  {
    selector: '[data-tour="donations-overview"]',
    title: 'Donation Tracking',
    description:
      'Track donations with automatic ECFA compliance checks and KYC.',
    page: '/donations',
  },
  {
    selector: '[data-tour="donation-portal"]',
    title: 'Donor Portal',
    description:
      'Public donor portal with M-Pesa integration for micro-donations.',
    page: '/donations',
  },
  {
    selector: '[data-tour="compliance-dashboard"]',
    title: 'Compliance Dashboard',
    description:
      'Full ECFA compliance overview with automated checks and alerts.',
    page: '/compliance',
  },
];
