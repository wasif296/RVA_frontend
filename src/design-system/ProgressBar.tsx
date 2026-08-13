import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
} as const;

export type ProgressBarProps = ComponentPropsWithoutRef<'div'> & {
  value: number;
  size?: keyof typeof sizeClasses;
  label?: string;
};

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  function ProgressBar({ className, value, size = 'md', label, ...props }, ref) {
    const clamped = Math.min(100, Math.max(0, value));

    return (
      <div ref={ref} className={cn('flex w-full flex-col gap-2', className)} {...props}>
        {label ? (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-fg">{label}</span>
            <span className="text-fg-muted">{Math.round(clamped)}%</span>
          </div>
        ) : null}
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(clamped)}
          aria-label={label ?? 'Progress'}
          className={cn(
            'w-full overflow-hidden rounded-full bg-surface-muted',
            sizeClasses[size],
          )}
        >
          <div
            className={cn(
              'h-full rounded-full bg-linear-to-r from-brand-700 via-brand-500 to-accent-400',
              'transition-[width] duration-slow ease-out motion-reduce:transition-none',
            )}
            style={{ width: `${clamped}%` }}
          />
        </div>
      </div>
    );
  },
);
