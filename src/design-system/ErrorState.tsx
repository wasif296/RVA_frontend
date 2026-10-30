import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';
import { Button } from './Button';

export type ErrorStateProps = ComponentPropsWithoutRef<'div'> & {
  title: string;
  description?: string;
  onRetry?: () => void;
};

export const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(
  function ErrorState({ className, title, description, onRetry, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-lg border border-danger/30 bg-danger-subtle px-6 py-10 text-center',
          className,
        )}
        role="alert"
        {...props}
      >
        <div className="flex max-w-md flex-col gap-1">
          <h3 className="font-display text-xl text-danger">{title}</h3>
          {description ? <p className="text-sm text-fg">{description}</p> : null}
        </div>
        {onRetry ? (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    );
  },
);
