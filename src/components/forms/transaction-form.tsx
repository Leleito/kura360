'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ECFA_CATEGORIES,
  ECFA_SPENDING_LIMIT,
  TRANSACTION_STATUSES,
} from '@/lib/validators/finance';
import { createTransaction } from '@/lib/actions/transactions';
import { uploadFile, getStoragePath } from '@/lib/storage';
import { useCampaign } from '@/lib/campaign-context';
import { useUser } from '@/lib/auth/hooks';
import { useToast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';

/* ---------- Form-specific schema (no .default() to avoid zodResolver mismatch) ---------- */

const transactionFormSchema = z.object({
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(200, 'Description must be 200 characters or fewer'),
  amount: z
    .number({ error: 'Amount is required' })
    .positive('Amount must be a positive number')
    .max(ECFA_SPENDING_LIMIT, `Amount cannot exceed KES ${ECFA_SPENDING_LIMIT.toLocaleString()}`),
  category: z.enum(ECFA_CATEGORIES, {
    error: 'Select a valid ECFA category',
  }),
  date: z
    .string()
    .min(1, 'Date is required'),
  receipt_url: z
    .string()
    .url('Please enter a valid URL for the receipt')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(500, 'Notes must be 500 characters or fewer')
    .optional()
    .or(z.literal('')),
  status: z.enum(TRANSACTION_STATUSES),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

/* ---------- Options ---------- */

const categoryOptions = ECFA_CATEGORIES.map((c) => ({ value: c, label: c }));

const paymentMethodOptions = [
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
];

const statusOptions = TRANSACTION_STATUSES.map((s) => ({
  value: s,
  label: s.charAt(0).toUpperCase() + s.slice(1),
}));

/* ---------- Props ---------- */

export interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/* ---------- Inner form content (usable without modal) ---------- */

export interface TransactionFormContentProps {
  onSubmitSuccess?: () => void;
}

export function TransactionFormContent({ onSubmitSuccess }: TransactionFormContentProps) {
  const { campaign } = useCampaign();
  const { user } = useUser();
  const { toast } = useToast();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: '',
      amount: undefined,
      category: undefined,
      date: new Date().toISOString().split('T')[0],
      receipt_url: '',
      notes: '',
      status: 'pending',
    },
  });

  const onSubmit = async (values: TransactionFormValues) => {
    if (!campaign?.id) {
      toast('No active campaign selected.', 'error');
      return;
    }
    if (!user?.id) {
      toast('You must be signed in to record a transaction.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let receiptUrl = values.receipt_url || '';

      // Upload receipt file if provided
      if (receiptFile) {
        const path = getStoragePath(campaign.id, 'receipts', receiptFile.name);
        const uploadResult = await uploadFile('receipts', path, receiptFile);
        if (uploadResult.error) {
          toast(`Receipt upload failed: ${uploadResult.error}`, 'error');
          setSubmitting(false);
          return;
        }
        receiptUrl = uploadResult.url;
      }

      const result = await createTransaction({
        campaign_id: campaign.id,
        recorded_by: user.id,
        description: values.description,
        amount_kes: values.amount,
        category: values.category,
        transaction_date: values.date,
        receipt_url: receiptUrl || null,
        status: values.status,
        type: 'expense',
      });

      if (result.error) {
        toast(result.error, 'error');
      } else {
        toast('Transaction recorded successfully.', 'success');
        reset();
        setReceiptFile(null);
        onSubmitSuccess?.();
      }
    } catch {
      toast('An unexpected error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Date */}
      <Input
        label="Date"
        type="date"
        error={errors.date?.message}
        {...register('date')}
      />

      {/* Description */}
      <Textarea
        label="Description"
        placeholder="What was this expense for?"
        maxLength={200}
        showCount
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Amount */}
      <Input
        label="Amount"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        prefix="KES"
        error={errors.amount?.message}
        {...register('amount', { valueAsNumber: true })}
      />

      {/* Category */}
      <Select
        label="ECFA Category"
        placeholder="Select category"
        options={categoryOptions}
        error={errors.category?.message}
        {...register('category')}
      />

      {/* Payment Method — informational, not in schema but useful in the form */}
      <Select
        label="Payment Method"
        placeholder="Select method"
        options={paymentMethodOptions}
        // Not part of transactionSchema, used for UX context only
      />

      {/* Status */}
      <Select
        label="Status"
        options={statusOptions}
        error={errors.status?.message}
        {...register('status')}
      />

      {/* Notes */}
      <Textarea
        label="Notes (optional)"
        placeholder="Additional notes..."
        maxLength={500}
        showCount
        error={errors.notes?.message}
        {...register('notes')}
      />

      {/* Receipt Upload */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          Receipt (optional)
        </label>
        <FileUpload
          accept="image/*,.pdf"
          maxSizeMB={10}
          preview
          onFileSelect={(file) => setReceiptFile(file)}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={submitting} disabled={submitting}>
          Record Transaction
        </Button>
      </div>
    </form>
  );
}

/* ---------- Modal wrapper ---------- */

export function TransactionForm({ isOpen, onClose, onSuccess }: TransactionFormProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Transaction" size="lg">
      <TransactionFormContent onSubmitSuccess={handleSuccess} />
    </Modal>
  );
}
