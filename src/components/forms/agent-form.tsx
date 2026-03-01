'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  KENYA_COUNTIES,
  AGENT_STATUSES,
} from '@/lib/validators/agents';
import { createAgent } from '@/lib/actions/agents';
import { useCampaign } from '@/lib/campaign-context';
import { useUser } from '@/lib/auth/hooks';
import { useToast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

/* ---------- Form-specific schema (no .default() to avoid zodResolver mismatch) ---------- */

const agentFormSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be 100 characters or fewer'),
  phone: z
    .string()
    .regex(/^\+254[17]\d{8}$/, 'Phone must be in +254 format (e.g. +254712345678)'),
  national_id: z
    .string()
    .regex(/^\d{8}$/, 'National ID must be exactly 8 digits'),
  county: z.enum(KENYA_COUNTIES, {
    error: 'Select a valid Kenyan county',
  }),
  constituency: z
    .string()
    .min(2, 'Constituency is required')
    .max(100, 'Constituency must be 100 characters or fewer'),
  polling_station: z
    .string()
    .min(2, 'Polling station is required')
    .max(200, 'Polling station must be 200 characters or fewer'),
  status: z.enum(AGENT_STATUSES),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

/* ---------- Options ---------- */

const countyOptions = KENYA_COUNTIES.map((c) => ({ value: c, label: c }));

/* ---------- Props ---------- */

export interface AgentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/* ---------- Inner form content (usable without modal) ---------- */

export interface AgentFormContentProps {
  onSubmitSuccess?: () => void;
}

export function AgentFormContent({ onSubmitSuccess }: AgentFormContentProps) {
  const { campaign } = useCampaign();
  const { user } = useUser();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      full_name: '',
      phone: '+254',
      national_id: '',
      county: undefined,
      constituency: '',
      polling_station: '',
      status: 'pending',
    },
  });

  const onSubmit = async (values: AgentFormValues) => {
    if (!campaign?.id) {
      toast('No active campaign selected.', 'error');
      return;
    }
    if (!user?.id) {
      toast('You must be signed in to register an agent.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createAgent(
        {
          campaign_id: campaign.id,
          full_name: values.full_name,
          phone: values.phone,
          national_id: values.national_id,
          county: values.county,
          assigned_station_name: values.polling_station,
          sub_county: values.constituency,
          status: values.status,
        },
        user.id
      );

      if (result.error) {
        toast(result.error, 'error');
      } else {
        toast('Agent registered successfully.', 'success');
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
      {/* Full Name */}
      <Input
        label="Full Name"
        placeholder="Agent's full name"
        error={errors.full_name?.message}
        {...register('full_name')}
      />

      {/* Phone */}
      <Input
        label="Phone Number"
        placeholder="+254712345678"
        prefix="+254"
        error={errors.phone?.message}
        {...register('phone')}
      />

      {/* National ID */}
      <Input
        label="National ID"
        placeholder="12345678"
        maxLength={8}
        error={errors.national_id?.message}
        {...register('national_id')}
      />

      {/* County */}
      <Select
        label="County"
        placeholder="Select county"
        options={countyOptions}
        error={errors.county?.message}
        {...register('county')}
      />

      {/* Constituency */}
      <Input
        label="Constituency"
        placeholder="e.g. Westlands"
        error={errors.constituency?.message}
        {...register('constituency')}
      />

      {/* Polling Station */}
      <Input
        label="Polling Station"
        placeholder="e.g. Waithaka Primary School"
        error={errors.polling_station?.message}
        {...register('polling_station')}
      />

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={submitting} disabled={submitting}>
          Register Agent
        </Button>
      </div>
    </form>
  );
}

/* ---------- Modal wrapper ---------- */

export function AgentForm({ isOpen, onClose, onSuccess }: AgentFormProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register Agent" size="lg">
      <AgentFormContent onSubmitSuccess={handleSuccess} />
    </Modal>
  );
}
