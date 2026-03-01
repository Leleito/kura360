/**
 * CSV Export Utility
 * Generates downloadable CSV files from data arrays
 */

export interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  /** Optional formatter for the cell value */
  format?: (value: unknown, row: T) => string;
}

/** Export data as a CSV file download */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
) {
  if (data.length === 0) return;

  // Build CSV header
  const headers = columns.map((col) => escapeCSV(col.header));

  // Build CSV rows
  const rows = data.map((row) =>
    columns.map((col) => {
      const rawValue = col.key in row ? row[col.key as keyof T] : '';
      const value = col.format
        ? col.format(rawValue, row)
        : String(rawValue ?? '');
      return escapeCSV(value);
    })
  );

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join(
    '\n'
  );

  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/** Escape a CSV cell value */
function escapeCSV(value: string): string {
  if (
    value.includes(',') ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Trigger a file download in the browser */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Export transactions to CSV */
export function exportTransactionsCSV(
  transactions: Array<{
    id: string;
    transaction_date: string;
    description: string;
    category: string;
    amount_kes: number;
    status: string;
    vendor_name?: string | null;
    reference?: string | null;
  }>
) {
  exportToCSV(transactions, [
    { key: 'id', header: 'Transaction ID' },
    { key: 'transaction_date', header: 'Date' },
    { key: 'description', header: 'Description' },
    { key: 'category', header: 'ECFA Category' },
    {
      key: 'amount_kes',
      header: 'Amount (KES)',
      format: (v) => String(v ?? 0),
    },
    { key: 'status', header: 'Status' },
    { key: 'vendor_name', header: 'Vendor' },
    { key: 'reference', header: 'Reference' },
  ], `kura360-transactions-${new Date().toISOString().slice(0, 10)}`);
}

/** Export agents to CSV */
export function exportAgentsCSV(
  agents: Array<{
    id: string;
    full_name: string;
    phone: string;
    county?: string | null;
    sub_county?: string | null;
    status: string;
    national_id?: string | null;
  }>
) {
  exportToCSV(agents, [
    { key: 'id', header: 'Agent ID' },
    { key: 'full_name', header: 'Full Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'county', header: 'County' },
    { key: 'sub_county', header: 'Sub-County' },
    { key: 'status', header: 'Status' },
    { key: 'national_id', header: 'National ID' },
  ], `kura360-agents-${new Date().toISOString().slice(0, 10)}`);
}

/** Export donations to CSV */
export function exportDonationsCSV(
  donations: Array<{
    id: string;
    donated_at: string;
    donor_name?: string | null;
    donor_phone?: string | null;
    amount_kes: number;
    is_anonymous: boolean;
    compliance_status: string;
    mpesa_ref?: string | null;
  }>
) {
  exportToCSV(donations, [
    { key: 'id', header: 'Donation ID' },
    { key: 'donated_at', header: 'Date' },
    { key: 'donor_name', header: 'Donor Name' },
    { key: 'donor_phone', header: 'Phone' },
    {
      key: 'amount_kes',
      header: 'Amount (KES)',
      format: (v) => String(v ?? 0),
    },
    {
      key: 'is_anonymous',
      header: 'Anonymous',
      format: (v) => (v ? 'Yes' : 'No'),
    },
    { key: 'compliance_status', header: 'Compliance' },
    { key: 'mpesa_ref', header: 'M-Pesa Ref' },
  ], `kura360-donations-${new Date().toISOString().slice(0, 10)}`);
}

/** Export evidence items to CSV */
export function exportEvidenceCSV(
  items: Array<{
    id: string;
    title: string;
    type: string;
    captured_at: string;
    verification_status: string;
    sha256_hash: string;
    description?: string | null;
  }>
) {
  exportToCSV(items, [
    { key: 'id', header: 'Evidence ID' },
    { key: 'title', header: 'Title' },
    { key: 'type', header: 'Type' },
    { key: 'captured_at', header: 'Captured At' },
    { key: 'verification_status', header: 'Verification Status' },
    { key: 'sha256_hash', header: 'SHA-256 Hash' },
    { key: 'description', header: 'Description' },
  ], `kura360-evidence-${new Date().toISOString().slice(0, 10)}`);
}
