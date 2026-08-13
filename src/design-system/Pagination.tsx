import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/cn';

export type PaginationProps = Omit<ComponentPropsWithoutRef<'nav'>, 'onChange'> & {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function getPageItems(page: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, 4, 'ellipsis', totalPages];
  }

  if (page >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages];
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { className, page, totalPages, onPageChange, ...props },
  ref,
) {
  const safeTotal = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotal);
  const items = getPageItems(safePage, safeTotal);

  return (
    <nav
      ref={ref}
      aria-label="Pagination"
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    >
      <button
        type="button"
        disabled={safePage <= 1}
        onClick={() => onPageChange(safePage - 1)}
        className={cn(
          'inline-flex h-10 items-center gap-1 rounded-md border border-border bg-surface px-3 text-sm text-fg',
          'hover:bg-neutral-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600',
        )}
      >
        <ChevronLeft className="size-4" aria-hidden />
        Previous
      </button>

      <ul className="flex flex-wrap items-center gap-1">
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <li key={`ellipsis-${index}`}>
              <span className="inline-flex h-10 w-10 items-center justify-center text-fg-muted">
                …
              </span>
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === safePage ? 'page' : undefined}
                className={cn(
                  'inline-flex h-10 w-10 items-center justify-center rounded-md text-sm',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
                  item === safePage
                    ? 'bg-brand-600 text-inverse'
                    : 'border border-border bg-surface text-fg hover:bg-neutral-100',
                )}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        disabled={safePage >= safeTotal}
        onClick={() => onPageChange(safePage + 1)}
        className={cn(
          'inline-flex h-10 items-center gap-1 rounded-md border border-border bg-surface px-3 text-sm text-fg',
          'hover:bg-neutral-100',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-600',
        )}
      >
        Next
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  );
});
