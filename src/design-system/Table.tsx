import {
  forwardRef,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cn } from '../lib/cn';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';

export type TableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
};

export type TableProps<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  loading?: boolean;
  empty?: {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
  };
  className?: string;
  caption?: string;
};

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

function TableInner<T>(
  { columns, rows, loading = false, empty, className, caption }: TableProps<T>,
  ref: Ref<HTMLDivElement>,
) {
  const colCount = columns.length;

  return (
    <div ref={ref} className={cn('w-full', className)}>
      {loading ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-left text-sm">
            {caption ? <caption className="sr-only">{caption}</caption> : null}
            <thead className="bg-neutral-100">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      'sticky top-0 whitespace-nowrap px-4 py-3 font-medium text-fg',
                      alignClasses[column.align ?? 'left'],
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-t border-border">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3">
                      <Skeleton variant="text" width="full" height="sm" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={empty?.icon}
          title={empty?.title ?? 'No results'}
          description={empty?.description}
          action={empty?.action}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-left text-sm">
            {caption ? <caption className="sr-only">{caption}</caption> : null}
            <thead className="bg-neutral-100">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      'sticky top-0 whitespace-nowrap px-4 py-3 font-medium text-fg',
                      alignClasses[column.align ?? 'left'],
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-border bg-surface">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-4 py-3 text-fg',
                        alignClasses[column.align ?? 'left'],
                      )}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <span className="sr-only" aria-live="polite">
        {loading ? `Loading table with ${colCount} columns` : null}
      </span>
    </div>
  );
}

export const Table = forwardRef(TableInner) as <T>(
  props: TableProps<T> & { ref?: Ref<HTMLDivElement> },
) => ReactElement;
