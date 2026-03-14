'use client';

import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2, X } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface CSVImportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  campaignId: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  flagged: number;
  total: number;
  errors: string[];
}

export function CSVImportForm({ isOpen, onClose, onSuccess, campaignId }: CSVImportFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.endsWith('.csv')) {
        setError('Only CSV files are supported');
        return;
      }
      setFile(selected);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('campaignId', campaignId);

      const res = await fetch('/api/donations/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setResult(data);
      if (data.imported > 0) {
        onSuccess?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Bank Statement" size="md">
      <div className="space-y-4">
        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-blue-800 leading-relaxed">
            Upload a CSV file from your bank (KCB, Equity, NCBA, Co-op) with donation records.
            The system will automatically match columns for <strong>date</strong>,{' '}
            <strong>donor name</strong>, <strong>phone</strong>, <strong>amount</strong>, and{' '}
            <strong>reference</strong>. Duplicate entries will be skipped.
          </p>
        </div>

        {/* File upload area */}
        {!result && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn(
              'w-full border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer',
              file
                ? 'border-green-300 bg-green-50'
                : 'border-[#E2E8F0] hover:border-[#2E75B6]/30 bg-[#F7F9FC]'
            )}
          >
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-[#0F2A44]">{file.name}</p>
                  <p className="text-xs text-[#64748B]">
                    {(file.size / 1024).toFixed(1)} KB — Click to change
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="ml-2 p-1 rounded hover:bg-gray-200"
                >
                  <X className="h-3.5 w-3.5 text-[#64748B]" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-[#94A3B8] mx-auto mb-2" />
                <p className="text-sm font-medium text-[#4A5568]">
                  Click to select CSV file
                </p>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Supports KCB, Equity, NCBA, Co-op bank statement formats
                </p>
              </>
            )}
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h3 className="text-sm font-bold text-[#0F2A44]">Import Complete</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-green-700">{result.imported}</p>
                <p className="text-[10px] text-green-600">Imported</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-gray-600">{result.skipped}</p>
                <p className="text-[10px] text-gray-500">Skipped (duplicates)</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-orange-600">{result.flagged}</p>
                <p className="text-[10px] text-orange-500">Flagged</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-blue-600">{result.total}</p>
                <p className="text-[10px] text-blue-500">Total Rows</p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="bg-red-50 rounded-lg p-2 max-h-24 overflow-y-auto">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-[10px] text-red-600">{err}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button onClick={handleImport} disabled={!file || loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import Donations
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
