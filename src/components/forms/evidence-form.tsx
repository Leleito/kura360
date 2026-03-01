'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  EVIDENCE_TYPES,
  KENYA_COUNTIES,
} from '@/lib/validators/evidence';
import { createEvidenceItem } from '@/lib/actions/evidence';
import { uploadFile, computeFileHash, getStoragePath } from '@/lib/storage';
import { useCampaign } from '@/lib/campaign-context';
import { useUser } from '@/lib/auth/hooks';
import { useToast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';

/* ---------- Form-specific schema (excludes computed fields) ---------- */

const evidenceFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be 200 characters or fewer'),
  type: z.enum(EVIDENCE_TYPES, {
    error: 'Select a valid evidence type',
  }),
  county: z.enum(KENYA_COUNTIES, {
    error: 'Select a valid Kenyan county',
  }),
  description: z
    .string()
    .max(1000, 'Description must be 1,000 characters or fewer')
    .optional()
    .or(z.literal('')),
  severity: z.enum(['low', 'medium', 'high', 'critical'], {
    error: 'Select a severity level',
  }),
});

type EvidenceFormValues = z.infer<typeof evidenceFormSchema>;

/* ---------- Options ---------- */

const typeOptions = EVIDENCE_TYPES.map((t) => ({
  value: t,
  label: t.charAt(0).toUpperCase() + t.slice(1),
}));

const countyOptions = KENYA_COUNTIES.map((c) => ({ value: c, label: c }));

const severityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

/* ---------- Props ---------- */

export interface EvidenceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/* ---------- Inner form content (usable without modal) ---------- */

export interface EvidenceFormContentProps {
  onSubmitSuccess?: () => void;
}

export function EvidenceFormContent({ onSubmitSuccess }: EvidenceFormContentProps) {
  const { campaign } = useCampaign();
  const { user } = useUser();
  const { toast } = useToast();
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | undefined>(undefined);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EvidenceFormValues>({
    resolver: zodResolver(evidenceFormSchema),
    defaultValues: {
      title: '',
      type: undefined,
      county: undefined,
      description: '',
      severity: undefined,
    },
  });

  const onSubmit = async (values: EvidenceFormValues) => {
    if (!campaign?.id) {
      toast('No active campaign selected.', 'error');
      return;
    }
    if (!user?.id) {
      toast('You must be signed in to upload evidence.', 'error');
      return;
    }
    if (!evidenceFile) {
      toast('Please select a file to upload.', 'error');
      return;
    }

    setSubmitting(true);
    setUploadProgress(10);

    try {
      // Step 1: Compute SHA-256 hash
      setUploadProgress(20);
      const sha256Hash = await computeFileHash(evidenceFile);

      // Step 2: Upload file to storage
      setUploadProgress(40);
      const path = getStoragePath(campaign.id, 'evidence', evidenceFile.name);
      const uploadResult = await uploadFile('evidence', path, evidenceFile);

      if (uploadResult.error) {
        toast(`File upload failed: ${uploadResult.error}`, 'error');
        setSubmitting(false);
        setUploadProgress(undefined);
        return;
      }

      setUploadProgress(70);

      // Step 3: Create evidence record
      const result = await createEvidenceItem(
        {
          campaign_id: campaign.id,
          title: values.title,
          type: values.type,
          description: values.description || null,
          file_url: uploadResult.url,
          sha256_hash: sha256Hash,
          verification_status: 'pending',
          file_size_bytes: evidenceFile.size,
        },
        user.id
      );

      setUploadProgress(100);

      if (result.error) {
        toast(result.error, 'error');
      } else {
        toast('Evidence uploaded successfully.', 'success');
        reset();
        setEvidenceFile(null);
        setUploadProgress(undefined);
        onSubmitSuccess?.();
      }
    } catch {
      toast('An unexpected error occurred.', 'error');
    } finally {
      setSubmitting(false);
      setUploadProgress(undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Title */}
      <Input
        label="Title"
        placeholder="Evidence title"
        error={errors.title?.message}
        {...register('title')}
      />

      {/* Type */}
      <Select
        label="Evidence Type"
        placeholder="Select type"
        options={typeOptions}
        error={errors.type?.message}
        {...register('type')}
      />

      {/* Description */}
      <Textarea
        label="Description (optional)"
        placeholder="Describe the evidence..."
        maxLength={1000}
        showCount
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Severity */}
      <Select
        label="Severity"
        placeholder="Select severity"
        options={severityOptions}
        error={errors.severity?.message}
        {...register('severity')}
      />

      {/* County */}
      <Select
        label="County"
        placeholder="Select county"
        options={countyOptions}
        error={errors.county?.message}
        {...register('county')}
      />

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          File <span className="text-red">*</span>
        </label>
        <FileUpload
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          maxSizeMB={50}
          preview
          onFileSelect={(file) => setEvidenceFile(file)}
          progress={uploadProgress}
        />
        {!evidenceFile && (
          <p className="mt-1 text-xs text-text-tertiary">
            Supported: images, video, audio, PDF, documents (max 50MB)
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={submitting} disabled={submitting || !evidenceFile}>
          Upload Evidence
        </Button>
      </div>
    </form>
  );
}

/* ---------- Modal wrapper ---------- */

export function EvidenceForm({ isOpen, onClose, onSuccess }: EvidenceFormProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Evidence" size="lg">
      <EvidenceFormContent onSubmitSuccess={handleSuccess} />
    </Modal>
  );
}
