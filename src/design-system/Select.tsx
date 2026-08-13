import { forwardRef, useId, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';

export type SelectProps = ComponentPropsWithoutRef<'select'> & {
  label: string;
  hint?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, hint, error, id, disabled, children, ...props },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hintId = `${selectId}-hint`;
  const errorId = `${selectId}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={selectId} className="text-sm font-medium text-fg">
        {label}
      </label>
      <select
        ref={ref}
        id={selectId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'h-10 w-full rounded-md border bg-surface px-3 text-base text-fg shadow-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          'disabled:cursor-not-allowed disabled:border-disabled-border disabled:bg-disabled-bg disabled:text-disabled-fg',
          error ? 'border-danger' : 'border-border',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {hint && !error ? (
        <p id={hintId} className="text-sm text-fg-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
