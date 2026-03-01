'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react';
import {
  DONATION_METHODS,
  DONATION_METHOD_LABELS,
  ECFA_ANONYMOUS_THRESHOLD,
  ECFA_INDIVIDUAL_LIMIT,
  type DonationMethod,
} from '@/lib/validators/donations';
import { createDonation } from '@/lib/actions/donations';
import { useCampaign } from '@/lib/campaign-context';
import { useUser } from '@/lib/auth/hooks';
import { useToast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

/* ---------- Form-specific schema ---------- */

/**
 * The donation form uses a simplified schema that maps to the DB columns.
 * The full donationSchema from validators/donations.ts includes cross-field
 * refinements that we handle with real-time warnings instead.
 */
const donationFormSchema = z.object({
  donor_name: z
    .string()
    .max(100, 'Donor name must be 100 characters or fewer')
    .optional()
    .or(z.literal('')),
  donor_phone: z
    .string()
    .optional()
    .or(z.literal('')),
  amount: z
    .number({ error: 'Amount is required' })
    .positive('Amount must be a positive number'),
  method: z.enum(DONATION_METHODS, {
    error: 'Select a valid payment method',
  }),
  reference: z
    .string()
    .max(20, 'Reference must be 20 characters or fewer')
    .optional()
    .or(z.literal('')),
  date: z
    .string()
    .min(1, 'Date is required'),
  notes: z
    .string()
    .max(500, 'Notes must be 500 characters or fewer')
    .optional()
    .or(z.literal('')),
  is_anonymous: z.boolean(),
});

type DonationFormValues = z.infer<typeof donationFormSchema>;

/* ---------- Options ---------- */

const methodOptions = DONATION_METHODS.map((m) => ({
  value: m,
  label: DONATION_METHOD_LABELS[m as DonationMethod],
}));

/* ---------- ECFA Warning Component ---------- */

function ECFAWarnings({ amount, isAnonymous }: { amount: number | undefined; isAnonymous: boolean }) {
  const warnings: { message: string; level: 'warning' | 'error' }[] = [];

  if (amount && isAnonymous && amount > ECFA_ANONYMOUS_THRESHOLD) {
    warnings.push({
      message: `ECFA Violation: Anonymous donations exceeding KES ${ECFA_ANONYMOUS_THRESHOLD.toLocaleString()} are illegal under the Election Campaign Financing Act. Donor identity must be verified.`,
      level: 'error',
    });
  }

  if (amount && amount > ECFA_INDIVIDUAL_LIMIT) {
    warnings.push({
      message: `ECFA Violation: Individual donations cannot exceed KES ${ECFA_INDIVIDUAL_LIMIT.toLocaleString()} per election cycle.`,
      level: 'error',
    });
  }

  if (amount && amount > 100_000 && amount <= ECFA_INDIVIDUAL_LIMIT) {
    warnings.push({
      message: `High-value donation: KES ${amount.toLocaleString()}. This will be flagged for additional scrutiny.`,
      level: 'warning',
    });
  }

  if (warnings.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {warnings.map((w, i) => (
        <div
          key={i}
          className={`flex items-start gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm ${
            w.level === 'error'
              ? 'bg-red/10 text-red border border-red/20'
              : 'bg-orange/10 text-orange border border-orange/20'
          }`}
          role="alert"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{w.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Props ---------- */

export interface DonationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/* ---------- Inner form content (usable without modal) ---------- */

export interface DonationFormContentProps {
  onSubmitSuccess?: () => void;
}

export function DonationFormContent({ onSubmitSuccess }: DonationFormContentProps) {
  const { campaign } = useCampaign();
  const { user } = useUser();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      donor_name: '',
      donor_phone: '',
      amount: undefined,
      method: undefined,
      reference: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      is_anonymous: false,
    },
  });

  // Watch values for real-time ECFA warnings
  const watchedAmount = useWatch({ control, name: 'amount' });
  const watchedAnonymous = useWatch({ control, name: 'is_anonymous' });

  const onSubmit = async (values: DonationFormValues) => {
    if (!campaign?.id) {
      toast('No active campaign selected.', 'error');
      return;
    }
    if (!user?.id) {
      toast('You must be signed in to record a donation.', 'error');
      return;
    }

    // Block ECFA violations at form level
    if (values.is_anonymous && values.amount > ECFA_ANONYMOUS_THRESHOLD) {
      toast(
        `ECFA Violation: Anonymous donations over KES ${ECFA_ANONYMOUS_THRESHOLD.toLocaleString()} are illegal.`,
        'error'
      );
      return;
    }
    if (values.amount > ECFA_INDIVIDUAL_LIMIT) {
      toast(
        `ECFA Violation: Individual donations cannot exceed KES ${ECFA_INDIVIDUAL_LIMIT.toLocaleString()}.`,
        'error'
      );
      return;
    }

    setSubmitting(true);
    try {
      const result = await createDonation(
        {
          campaign_id: campaign.id,
          donor_name: values.is_anonymous ? null : (values.donor_name || null),
          donor_phone: values.donor_phone || null,
          amount_kes: values.amount,
          mpesa_ref: values.method === 'mpesa' ? (values.reference || null) : null,
          receipt_number: values.method !== 'mpesa' ? (values.reference || null) : null,
          donated_at: values.date,
          is_anonymous: values.is_anonymous,
        },
        user.id
      );

      if (result.error) {
        toast(result.error, 'error');
      } else {
        toast('Donation recorded successfully.', 'success');
        reset();
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
      {/* Anonymous checkbox */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-surface-border text-green focus:ring-green/20"
          {...register('is_anonymous')}
        />
        <span className="text-sm font-medium text-text-primary">Anonymous Donation</span>
      </label>

      {/* ECFA Warnings */}
      <ECFAWarnings amount={watchedAmount} isAnonymous={watchedAnonymous} />

      {/* Donor Name */}
      {!watchedAnonymous && (
        <Input
          label="Donor Name"
          placeholder="Full name of the donor"
          error={errors.donor_name?.message}
          {...register('donor_name')}
        />
      )}

      {/* Donor Phone */}
      {!watchedAnonymous && (
        <Input
          label="Phone Number"
          placeholder="+254712345678"
          error={errors.donor_phone?.message}
          {...register('donor_phone')}
        />
      )}

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

      {/* Payment Method */}
      <Select
        label="Payment Method"
        placeholder="Select method"
        options={methodOptions}
        error={errors.method?.message}
        {...register('method')}
      />

      {/* Reference Number */}
      <Input
        label="Reference Number"
        placeholder="e.g. QWE12345RT"
        error={errors.reference?.message}
        {...register('reference')}
      />

      {/* Date */}
      <Input
        label="Date"
        type="date"
        error={errors.date?.message}
        {...register('date')}
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

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={submitting} disabled={submitting}>
          Record Donation
        </Button>
      </div>
    </form>
  );
}

/* ---------- Modal wrapper ---------- */

export function DonationForm({ isOpen, onClose, onSuccess }: DonationFormProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Donation" size="lg">
      <DonationFormContent onSubmitSuccess={handleSuccess} />
    </Modal>
  );
}
