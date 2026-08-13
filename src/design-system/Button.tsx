import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Spinner } from './Spinner';

const variantClasses = {
  primary:
    'bg-brand-600 text-inverse shadow-sm hover:bg-brand-700 hover:shadow-md active:bg-brand-800',
  secondary:
    'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300',
  outline:
    'border border-border bg-surface text-fg shadow-sm hover:bg-neutral-50 hover:border-brand-300 active:bg-neutral-100',
  ghost:
    'bg-transparent text-fg hover:bg-neutral-100 focus-visible:bg-neutral-100 active:bg-neutral-200',
  danger: 'bg-danger text-inverse shadow-sm hover:bg-danger/90 active:bg-danger',
} as const;

const sizeClasses = {
  sm: 'h-8 gap-2 px-3 text-sm',
  md: 'h-10 gap-2 px-4 text-base',
  lg: 'h-12 gap-3 px-5 text-lg',
} as const;

export type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-sans font-medium',
          'transition-[color,background-color,box-shadow,transform,border-color] duration-normal ease-out',
          'motion-reduce:transition-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          variantClasses[variant],
          sizeClasses[size],
          'disabled:cursor-not-allowed disabled:border-disabled-border disabled:bg-disabled-bg disabled:text-disabled-fg disabled:shadow-none',
          'disabled:hover:bg-disabled-bg disabled:focus-visible:bg-disabled-bg disabled:active:bg-disabled-bg',
          className,
        )}
        {...props}
      >
        {loading ? (
          <Spinner size={size === 'lg' ? 'md' : 'sm'} label="Loading" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);
