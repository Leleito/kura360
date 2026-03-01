import { createClient } from '@/lib/supabase/client';

/** Storage bucket configuration */
export const STORAGE_BUCKETS = {
  evidence: { name: 'evidence', maxSize: 50 * 1024 * 1024 }, // 50MB
  receipts: { name: 'receipts', maxSize: 10 * 1024 * 1024 }, // 10MB
  avatars: { name: 'avatars', maxSize: 2 * 1024 * 1024 },   // 2MB
} as const;

export type BucketName = keyof typeof STORAGE_BUCKETS;

/** Upload a file to Supabase Storage */
export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: File
): Promise<{ url: string; error?: string }> {
  const config = STORAGE_BUCKETS[bucket];

  if (file.size > config.maxSize) {
    return {
      url: '',
      error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds ${bucket} limit (${config.maxSize / 1024 / 1024}MB)`,
    };
  }

  const supabase = createClient();

  const { error } = await supabase.storage
    .from(config.name)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) return { url: '', error: error.message };

  const { data: urlData } = supabase.storage
    .from(config.name)
    .getPublicUrl(path);

  return { url: urlData.publicUrl };
}

/** Get a signed URL for private files */
export async function getSignedUrl(
  bucket: BucketName,
  path: string,
  expiresIn: number = 3600
): Promise<{ url: string; error?: string }> {
  const config = STORAGE_BUCKETS[bucket];
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(config.name)
    .createSignedUrl(path, expiresIn);

  if (error) return { url: '', error: error.message };
  return { url: data.signedUrl };
}

/** Delete a file from storage */
export async function deleteFile(
  bucket: BucketName,
  path: string
): Promise<{ error?: string }> {
  const config = STORAGE_BUCKETS[bucket];
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(config.name)
    .remove([path]);

  if (error) return { error: error.message };
  return {};
}

/** Compute SHA-256 hash of a file (client-side) */
export async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Generate a unique storage path */
export function getStoragePath(
  campaignId: string,
  entityId: string,
  filename: string
): string {
  const ext = filename.split('.').pop() ?? '';
  const timestamp = Date.now();
  return `${campaignId}/${entityId}/${timestamp}.${ext}`;
}
