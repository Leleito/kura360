/**
 * Bank Statement CSV Import API (Option B)
 *
 * Accepts a CSV file upload with donation records and bulk-inserts them.
 * Supports common Kenyan bank statement formats:
 * - KCB, Equity, NCBA, Co-op Bank
 *
 * Expected CSV columns (flexible matching):
 *   date, name/donor, phone, amount, reference/ref
 *
 * POST /api/donations/import
 * Body: FormData with 'file' (CSV) and 'campaignId'
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ParsedRow {
  date: string;
  donor_name: string;
  donor_phone: string;
  amount: number;
  reference: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const campaignId = formData.get('campaignId') as string | null;

    if (!file || !campaignId) {
      return NextResponse.json(
        { error: 'Missing required fields: file and campaignId' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are supported' },
        { status: 400 }
      );
    }

    // Read and parse CSV
    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No valid donation rows found in CSV' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify campaign exists
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id, spending_limit_kes')
      .eq('id', campaignId)
      .single();

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Bulk insert donations
    const results = {
      imported: 0,
      skipped: 0,
      flagged: 0,
      errors: [] as string[],
    };

    for (const row of rows) {
      // Skip rows with invalid amounts
      if (row.amount <= 0) {
        results.skipped++;
        continue;
      }

      // Duplicate check by reference
      if (row.reference) {
        const { data: existing } = await supabase
          .from('donations')
          .select('id')
          .eq('mpesa_ref', row.reference)
          .eq('campaign_id', campaignId)
          .maybeSingle();

        if (existing) {
          results.skipped++;
          continue;
        }
      }

      // Compliance check
      let complianceStatus: 'compliant' | 'flagged' | 'violation' = 'compliant';
      let flaggedReason: string | null = null;

      if (row.amount > 500_000) {
        complianceStatus = 'violation';
        flaggedReason = 'Exceeds ECFA individual limit of KES 500,000';
      }

      const { error } = await supabase.from('donations').insert({
        campaign_id: campaignId,
        donor_name: row.donor_name || 'Bank Transfer Donor',
        donor_phone: row.donor_phone || '',
        amount_kes: row.amount,
        mpesa_ref: row.reference || null,
        is_anonymous: !row.donor_name,
        kyc_status: 'pending',
        compliance_status: complianceStatus,
        flagged_reason: flaggedReason,
        donated_at: row.date || new Date().toISOString(),
        source: 'csv_import',
      });

      if (error) {
        results.errors.push(`Row "${row.donor_name}": ${error.message}`);
      } else {
        results.imported++;
        if (complianceStatus !== 'compliant') results.flagged++;
      }
    }

    // Audit log
    await supabase.from('audit_log').insert({
      campaign_id: campaignId,
      user_id: 'system-csv-import',
      action: 'BULK_IMPORT',
      table_name: 'donations',
      record_id: 'bulk',
      new_values: {
        source: 'csv_import',
        filename: file.name,
        total_rows: rows.length,
        imported: results.imported,
        skipped: results.skipped,
        flagged: results.flagged,
      },
    });

    return NextResponse.json({
      success: true,
      ...results,
      total: rows.length,
    });
  } catch (err) {
    console.error('[CSV Import] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Import failed' },
      { status: 500 }
    );
  }
}

// ── CSV Parser ─────────────────────────────────────────────────────────────

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return []; // Need header + at least one row

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));

  // Flexible column mapping — match common Kenyan bank statement headers
  const dateCol = findColumn(header, ['date', 'trans_date', 'transaction_date', 'value_date', 'posted_date']);
  const nameCol = findColumn(header, ['name', 'donor', 'donor_name', 'sender', 'account_name', 'description', 'particulars']);
  const phoneCol = findColumn(header, ['phone', 'donor_phone', 'mobile', 'msisdn', 'telephone']);
  const amountCol = findColumn(header, ['amount', 'credit', 'credit_amount', 'deposit', 'trans_amount']);
  const refCol = findColumn(header, ['reference', 'ref', 'trans_id', 'transaction_id', 'receipt', 'receipt_no']);

  if (amountCol === -1) return []; // Must have amount column

  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCSVLine(lines[i]);
    if (cells.length <= amountCol) continue;

    const rawAmount = cells[amountCol]?.replace(/[,"'KES\sKsh]/gi, '') ?? '0';
    const amount = parseFloat(rawAmount);
    if (isNaN(amount) || amount <= 0) continue;

    rows.push({
      date: dateCol >= 0 ? parseFlexibleDate(cells[dateCol]) : new Date().toISOString(),
      donor_name: nameCol >= 0 ? cells[nameCol]?.trim() ?? '' : '',
      donor_phone: phoneCol >= 0 ? cells[phoneCol]?.trim() ?? '' : '',
      amount,
      reference: refCol >= 0 ? cells[refCol]?.trim() ?? '' : '',
    });
  }

  return rows;
}

function findColumn(header: string[], candidates: string[]): number {
  for (const candidate of candidates) {
    const idx = header.indexOf(candidate);
    if (idx !== -1) return idx;
  }
  // Partial match
  for (const candidate of candidates) {
    const idx = header.findIndex((h) => h.includes(candidate));
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseFlexibleDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  const cleaned = dateStr.replace(/['"]/g, '').trim();

  // Try ISO format first
  const iso = new Date(cleaned);
  if (!isNaN(iso.getTime())) return iso.toISOString();

  // Try DD/MM/YYYY (common in Kenyan bank statements)
  const dmyMatch = cleaned.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`).toISOString();
  }

  return new Date().toISOString();
}
