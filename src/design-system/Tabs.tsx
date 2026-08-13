import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../lib/cn';

export type TabsProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Root>;

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { className, ...props },
  ref,
) {
  return (
    <TabsPrimitive.Root
      ref={ref}
      className={cn('flex flex-col gap-4', className)}
      {...props}
    />
  );
});

export type TabsListProps = ComponentPropsWithoutRef<typeof TabsPrimitive.List>;

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, ...props },
  ref,
) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'inline-flex gap-1 rounded-lg border border-border bg-surface-muted p-1',
        className,
      )}
      {...props}
    />
  );
});

export type TabsTriggerProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>;

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger({ className, ...props }, ref) {
    return (
      <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-fg-muted',
          'transition-[color,background-color,box-shadow] duration-fast ease-out motion-reduce:transition-none',
          'hover:text-fg',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          'data-[state=active]:bg-surface data-[state=active]:text-fg data-[state=active]:shadow-sm',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-fg disabled:opacity-60',
          'data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60',
          className,
        )}
        {...props}
      />
    );
  },
);

export type TabsContentProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Content>;

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent({ className, ...props }, ref) {
    return (
      <TabsPrimitive.Content
        ref={ref}
        className={cn(
          'rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          className,
        )}
        {...props}
      />
    );
  },
);
