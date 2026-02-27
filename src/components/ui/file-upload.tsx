'use client';

import { useRef, useState, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  onFileSelect: (file: File) => void;
  preview?: boolean;
  className?: string;
  progress?: number;
}

export function FileUpload({
  accept,
  maxSizeMB = 10,
  onFileSelect,
  preview = false,
  className,
  progress,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setError(null);

      // Size check
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File exceeds ${maxSizeMB}MB limit`);
        return;
      }

      // Type check
      if (accept) {
        const acceptedTypes = accept.split(',').map((t) => t.trim());
        const matches = acceptedTypes.some((type) => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.replace('/*', '/'));
          }
          return file.type === type;
        });
        if (!matches) {
          setError(`File type not accepted. Allowed: ${accept}`);
          return;
        }
      }

      setSelectedFile(file);

      // Image preview
      if (preview && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }

      onFileSelect(file);
    },
    [accept, maxSizeMB, onFileSelect, preview]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const isUploading = progress !== undefined && progress >= 0 && progress < 100;

  return (
    <div className={cn('w-full', className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed p-6 cursor-pointer transition-colors',
          isDragging
            ? 'border-blue bg-blue/5'
            : 'border-surface-border hover:border-blue/50 hover:bg-surface-bg',
          error && 'border-red'
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        aria-label="Upload file"
      >
        {previewUrl ? (
          <div className="relative mb-3">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-24 w-24 rounded-[var(--radius-md)] object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="absolute -top-2 -right-2 bg-white border border-surface-border rounded-full p-0.5 shadow-sm hover:bg-surface-bg"
              aria-label="Remove file"
            >
              <X className="h-3 w-3 text-text-secondary" />
            </button>
          </div>
        ) : selectedFile ? (
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-8 w-8 text-blue" />
            <div className="text-left">
              <p className="text-sm font-medium text-text-primary truncate max-w-[200px]">
                {selectedFile.name}
              </p>
              <p className="text-xs text-text-tertiary">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 rounded text-text-tertiary hover:text-text-primary"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-text-tertiary mb-2" />
            <p className="text-sm font-medium text-text-primary">
              Drop file here or click to browse
            </p>
            <p className="text-xs text-text-tertiary mt-1">
              Max {maxSizeMB}MB{accept ? ` | ${accept}` : ''}
            </p>
          </>
        )}
      </div>

      {/* Progress bar */}
      {isUploading && (
        <div className="mt-2 w-full bg-surface-border-light rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-green transition-[width] duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red" role="alert">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
