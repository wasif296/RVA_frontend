import { forwardRef, useState, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';

const sizeClasses = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
} as const;

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '?';

  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return `${first}${last}`.toUpperCase() || '?';
}

export type AvatarProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  name: string;
  src?: string;
  alt: string;
  size?: keyof typeof sizeClasses;
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { className, name, src, alt, size = 'md', ...props },
  ref,
) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-medium text-brand-800',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-label={alt}>{getInitials(name)}</span>
      )}
    </div>
  );
});
