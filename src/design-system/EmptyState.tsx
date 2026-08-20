import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export type EmptyStateProps = ComponentPropsWithoutRef<'div'> & {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

function EmptyIllustration() {
  return (
    <svg
      viewBox="0 0 80 64"
      className="size-14 text-accent-600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="8"
        y="12"
        width="48"
        height="40"
        rx="10"
        className="fill-accent-100 stroke-accent-300"
        strokeWidth="1.5"
      />
      <rect
        x="24"
        y="4"
        width="48"
        height="40"
        rx="10"
        className="fill-surface stroke-accent-600"
        strokeWidth="1.5"
      />
      <path
        d="M34 24h28M34 32h20"
        className="stroke-accent-700"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="62" cy="44" r="10" className="fill-accent-600" />
      <path
        d="M58 44h8M62 40v8"
        className="stroke-inverse"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState({ className, icon, title, description, action, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-surface-raised px-8 py-14 text-center shadow-sm',
          className,
        )}
        {...props}
      >
        {icon ? (
          <div className="flex size-14 items-center justify-center rounded-full bg-accent-50 text-accent-700 ring-4 ring-accent-100/70">
            {icon}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl bg-accent-50 px-4 py-3 ring-4 ring-accent-100/70">
            <EmptyIllustration />
          </div>
        )}
        <div className="flex max-w-md flex-col gap-2">
          <h3 className="font-display text-xl tracking-tight text-fg">{title}</h3>
          {description ? (
            <p className="text-base leading-body text-fg-muted">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
    );
  },
);
