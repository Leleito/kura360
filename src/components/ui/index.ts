// Shared UI Component Library — KURA360
// Re-exports for convenient importing: import { Button, Input, ... } from '@/components/ui';

export { Button, type ButtonProps } from './button';
export { Input, type InputProps } from './input';
export { Select, type SelectProps, type SelectOption } from './select';
export { Textarea, type TextareaProps } from './textarea';
export { Modal, type ModalProps } from './modal';
export {
  DataTable,
  type DataTableProps,
  type Column,
} from './data-table';
export { SearchInput, type SearchInputProps } from './search-input';
export {
  DropdownMenu,
  type DropdownMenuProps,
  type DropdownMenuItem,
  type DropdownMenuDivider,
  type DropdownMenuEntry,
} from './dropdown-menu';
export { ToastProvider, useToast } from './toast';
export { EmptyState, type EmptyStateProps } from './empty-state';
export { LoadingSpinner, type LoadingSpinnerProps } from './loading-spinner';
export { Avatar, type AvatarProps } from './avatar';
export {
  ConfirmationDialog,
  type ConfirmationDialogProps,
} from './confirmation-dialog';
export { FileUpload, type FileUploadProps } from './file-upload';
export { Tabs, type TabsProps, type Tab } from './tabs';

// Pre-existing components
export { Badge } from './badge';
export { StatCard } from './stat-card';
export { ProgressBar } from './progress-bar';
