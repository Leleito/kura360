import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg';

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
};

const dotSizeStyles: Record<AvatarSize, string> = {
  sm: 'h-2 w-2 border',
  md: 'h-2.5 w-2.5 border-2',
  lg: 'h-3 w-3 border-2',
};

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  online?: boolean;
  className?: string;
}

export function Avatar({ src, name, size = 'md', online, className }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-full object-cover bg-surface-border',
            sizeStyles[size]
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-semibold',
            'bg-navy text-white',
            sizeStyles[size]
          )}
          aria-label={name}
        >
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-white',
            online ? 'bg-green-light' : 'bg-text-tertiary',
            dotSizeStyles[size]
          )}
          aria-label={online ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}
