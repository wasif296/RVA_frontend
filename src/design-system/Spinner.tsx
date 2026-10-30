import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';

const sizeClasses = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-8 border-2',
} as const;

export type SpinnerProps = ComponentPropsWithoutRef<'span'> & {
  size?: keyof typeof sizeClasses;
  label?: string;
};

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner({ className, size = 'md', label = 'Loading', ...props }, ref) {
    return (
      <span
        ref={ref}
        role="status"
        className={cn('inline-flex items-center justify-center', className)}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            'animate-spin rounded-full border-accent-200 border-t-accent-600',
            sizeClasses[size],
          )}
        />
        <span className="sr-only">{label}</span>
      </span>
    );
  },
);
