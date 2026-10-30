import { forwardRef, useId, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';

export type CheckboxProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
  label: string;
  error?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ className, label, error, id, disabled, ...props }, ref) {
    const generatedId = useId();
    const checkboxId = id ?? generatedId;
    const errorId = `${checkboxId}-error`;

    return (
      <div className="flex flex-col gap-2">
        <label
          htmlFor={checkboxId}
          className={cn(
            'inline-flex cursor-pointer items-start gap-2 text-base text-fg',
            disabled && 'cursor-not-allowed',
          )}
        >
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'mt-1 size-4 shrink-0 rounded-sm border border-border bg-surface text-accent-600 accent-accent-600',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
              'disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:border-disabled-border',
              error && 'border-danger',
              className,
            )}
            {...props}
          />
          <span className={cn(disabled && 'text-disabled-fg')}>{label}</span>
        </label>
        {error ? (
          <p id={errorId} className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
