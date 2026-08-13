import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';

export type CardProps = ComponentPropsWithoutRef<'div'>;

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-border bg-surface text-fg shadow-sm',
        className,
      )}
      {...props}
    />
  );
});

export type CardHeaderProps = ComponentPropsWithoutRef<'div'>;

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-2 border-b border-border-subtle px-6 py-5',
          className,
        )}
        {...props}
      />
    );
  },
);

export type CardBodyProps = ComponentPropsWithoutRef<'div'>;

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(function CardBody(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('px-6 py-6', className)} {...props} />;
});

export type CardFooterProps = ComponentPropsWithoutRef<'div'>;

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3 border-t border-border-subtle px-6 py-5',
          className,
        )}
        {...props}
      />
    );
  },
);
