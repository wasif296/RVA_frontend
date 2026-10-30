import { forwardRef, useId, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';

export type TextareaProps = ComponentPropsWithoutRef<'textarea'> & {
  label: string;
  hint?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, label, hint, error, id, disabled, ...props }, ref) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const hintId = `${textareaId}-hint`;
    const errorId = `${textareaId}-error`;
    const describedBy = error ? errorId : hint ? hintId : undefined;

    return (
      <div className="flex w-full flex-col gap-2">
        <label htmlFor={textareaId} className="text-sm font-medium text-fg">
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'w-full rounded-md border bg-surface px-3 py-2 text-base text-fg shadow-sm',
            'placeholder:text-fg-muted',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
            'disabled:cursor-not-allowed disabled:border-disabled-border disabled:bg-disabled-bg disabled:text-disabled-fg',
            error ? 'border-danger' : 'border-border',
            className,
          )}
          {...props}
        />
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
  },
);
