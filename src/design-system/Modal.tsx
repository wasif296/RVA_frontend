import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
} as const;

export type ModalProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: keyof typeof sizeClasses;
  children: ReactNode;
};

export function Modal({ open, onOpenChange, size = 'md', children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-neutral-950/45 transition-opacity duration-normal motion-reduce:transition-none data-[state=open]:opacity-100" />
        <Dialog.Content
          className={cn(
            'fixed top-1/2 right-4 left-4 z-50 mx-auto -translate-y-1/2',
            'rounded-xl border border-border bg-surface-raised text-fg shadow-lg',
            'transition-transform duration-normal ease-out motion-reduce:transition-none',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            sizeClasses[size],
          )}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type ModalHeaderProps = ComponentPropsWithoutRef<'div'> & {
  title: string;
  description?: string;
  showClose?: boolean;
};

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  function ModalHeader(
    { className, title, description, showClose = true, children, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between gap-4 border-b border-border-subtle px-6 py-5',
          className,
        )}
        {...props}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <Dialog.Title className="font-display text-xl tracking-tight text-fg">
            {title}
          </Dialog.Title>
          {description ? (
            <Dialog.Description className="text-sm leading-body text-fg-muted">
              {description}
            </Dialog.Description>
          ) : (
            <Dialog.Description className="sr-only">{title}</Dialog.Description>
          )}
          {children}
        </div>
        {showClose ? (
          <Dialog.Close asChild>
            <button
              type="button"
              className={cn(
                'inline-flex size-8 shrink-0 items-center justify-center rounded-md text-fg-muted',
                'transition-colors duration-fast motion-reduce:transition-none',
                'hover:bg-neutral-100 hover:text-fg',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
                'disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-fg',
              )}
              aria-label="Close"
            >
              <X className="size-4" aria-hidden />
            </button>
          </Dialog.Close>
        ) : null}
      </div>
    );
  },
);

export type ModalBodyProps = ComponentPropsWithoutRef<'div'>;

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(function ModalBody(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn('px-6 py-5', className)} {...props} />;
});

export type ModalFooterProps = ComponentPropsWithoutRef<'div'>;

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  function ModalFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-wrap items-center justify-end gap-3 border-t border-border-subtle px-6 py-5',
          className,
        )}
        {...props}
      />
    );
  },
);
