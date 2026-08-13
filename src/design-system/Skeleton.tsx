import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/cn';

const widthClasses = {
  xs: 'w-8',
  sm: 'w-12',
  md: 'w-16',
  lg: 'w-full',
  xl: 'w-full',
  full: 'w-full',
} as const;

const heightClasses = {
  xs: 'h-3',
  sm: 'h-4',
  md: 'h-6',
  lg: 'h-8',
  xl: 'h-12',
} as const;

const variantClasses = {
  text: 'rounded-sm',
  circle: 'rounded-full aspect-square',
  rect: 'rounded-md',
} as const;

export type SkeletonProps = ComponentPropsWithoutRef<'div'> & {
  variant?: keyof typeof variantClasses;
  width?: keyof typeof widthClasses;
  height?: keyof typeof heightClasses;
};

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { className, variant = 'text', width = 'full', height = 'sm', ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        'bg-neutral-200 motion-safe:animate-pulse motion-reduce:animate-none',
        variantClasses[variant],
        variant === 'circle'
          ? heightClasses[height]
          : [widthClasses[width], heightClasses[height]],
        className,
      )}
      {...props}
    />
  );
});
