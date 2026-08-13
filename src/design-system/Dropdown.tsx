import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from '../lib/cn';

export type DropdownProps = {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Dropdown({
  trigger,
  children,
  align = 'end',
  open,
  onOpenChange,
}: DropdownProps) {
  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <span className="inline-flex w-fit">
        <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      </span>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={4}
          className={cn(
            'z-50 min-w-48 overflow-hidden rounded-md border border-border bg-surface p-1 text-fg shadow-md',
            'focus:outline-none',
          )}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export type DropdownItemProps = ComponentPropsWithoutRef<typeof DropdownMenu.Item> & {
  destructive?: boolean;
};

export const DropdownItem = forwardRef<HTMLDivElement, DropdownItemProps>(
  function DropdownItem({ className, destructive = false, disabled, ...props }, ref) {
    return (
      <DropdownMenu.Item
        ref={ref}
        disabled={disabled}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none',
          'focus:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
          destructive ? 'text-danger focus:bg-danger-subtle' : 'text-fg',
          'data-[disabled]:pointer-events-none data-[disabled]:bg-neutral-100 data-[disabled]:text-neutral-600',
          className,
        )}
        {...props}
      />
    );
  },
);

export type DropdownSeparatorProps = ComponentPropsWithoutRef<typeof DropdownMenu.Separator>;

export const DropdownSeparator = forwardRef<HTMLDivElement, DropdownSeparatorProps>(
  function DropdownSeparator({ className, ...props }, ref) {
    return (
      <DropdownMenu.Separator
        ref={ref}
        className={cn('my-1 h-px bg-border', className)}
        {...props}
      />
    );
  },
);

export type DropdownLabelProps = ComponentPropsWithoutRef<typeof DropdownMenu.Label>;

export const DropdownLabel = forwardRef<HTMLDivElement, DropdownLabelProps>(
  function DropdownLabel({ className, ...props }, ref) {
    return (
      <DropdownMenu.Label
        ref={ref}
        className={cn('px-3 py-2 text-xs font-medium text-fg-muted', className)}
        {...props}
      />
    );
  },
);
