import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';

const variantClasses = {
  neutral: 'bg-neutral-100 text-neutral-800',
  brand: 'bg-brand-100 text-brand-800',
  accent: 'bg-accent-100 text-accent-800',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
} as const;

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
} as const;

export type BadgeProps = ComponentPropsWithoutRef<'span'> & {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant = 'neutral', size = 'md', ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
});
