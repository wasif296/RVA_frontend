import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle2, Info, Sparkles, TriangleAlert, X, XCircle } from 'lucide-react';
import { cn } from '../lib/cn';
import { Button } from './Button';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

type ToastAction = {
  label: string;
  onClick: () => void;
};

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
};

type ToastRecord = ToastInput & {
  id: string;
  variant: ToastVariant;
  duration: number;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantClasses: Record<ToastVariant, string> = {
  success:
    'border-success/25 bg-success-subtle text-success shadow-lg ring-1 ring-accent-200/50',
  error: 'border-danger/30 bg-danger-subtle text-danger shadow-md',
  info: 'border-info/30 bg-info-subtle text-info shadow-md',
  warning: 'border-warning/30 bg-warning-subtle text-warning shadow-md',
};

const variantIcon: Record<ToastVariant, typeof CheckCircle2> = {
  success: Sparkles,
  error: XCircle,
  info: Info,
  warning: TriangleAlert,
};

function isPointsCopy(title: string, description?: string): boolean {
  return (
    /\+\d+\s*points?/i.test(description ?? '') || /\+\d+\s*points?/i.test(title)
  );
}

function extractPointsLabel(title: string, description?: string): string | null {
  const fromDescription = description?.match(/\+\d+\s*points?/i)?.[0];
  if (fromDescription) return fromDescription;
  return title.match(/\+\d+\s*points?/i)?.[0] ?? null;
}

export type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID();
      const pointsMoment = isPointsCopy(input.title, input.description);
      const record: ToastRecord = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? 'info',
        action: input.action,
        duration:
          input.duration ??
          (input.action ? 12_000 : pointsMoment ? 5600 : 4000),
      };

      setToasts((current) => [...current, record]);

      window.setTimeout(() => {
        dismiss(id);
      }, record.duration);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-3"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

type ToastItemProps = {
  toast: ToastRecord;
  onDismiss: () => void;
};

const ToastItem = forwardRef<HTMLDivElement, ToastItemProps>(function ToastItem(
  { toast, onDismiss },
  ref,
) {
  const Icon = variantIcon[toast.variant];
  const isPointsMoment =
    toast.variant === 'success' && isPointsCopy(toast.title, toast.description);
  const pointsLabel = isPointsMoment
    ? extractPointsLabel(toast.title, toast.description)
    : null;

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-4 toast-enter',
        variantClasses[toast.variant],
        isPointsMoment &&
          'bg-linear-to-br from-success-subtle via-surface-raised to-accent-50 shadow-lg',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full',
          toast.variant === 'success' && 'bg-accent-100 text-accent-700',
          toast.variant === 'error' && 'bg-danger-subtle text-danger',
          toast.variant === 'info' && 'bg-info-subtle text-info',
          toast.variant === 'warning' && 'bg-warning-subtle text-warning',
          isPointsMoment && 'points-pop bg-accent-200 text-accent-800',
        )}
      >
        {isPointsMoment ? (
          <CheckCircle2 className="size-5" aria-hidden />
        ) : (
          <Icon className="size-5" aria-hidden />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-base font-semibold tracking-tight text-fg">
          {toast.title}
        </p>
        {pointsLabel ? (
          <p
            className={cn(
              'mt-2 inline-flex items-center rounded-full bg-accent-100 px-3 py-1',
              'font-display text-sm font-semibold tracking-tight text-accent-800 points-pop',
            )}
          >
            {pointsLabel}
          </p>
        ) : toast.description ? (
          <p className="mt-1 text-sm leading-body text-fg">{toast.description}</p>
        ) : null}
        {isPointsMoment && toast.description && pointsLabel ? (
          <p className="mt-2 text-sm leading-body text-fg-muted">
            {toast.description.replace(pointsLabel, '').trim() ||
              'Nice work — keep the momentum going.'}
          </p>
        ) : null}
        {toast.action ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => {
              toast.action?.onClick();
              onDismiss();
            }}
          >
            {toast.action.label}
          </Button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className={cn(
          'inline-flex size-8 shrink-0 items-center justify-center rounded-md text-fg-muted',
          'transition-colors duration-fast motion-reduce:transition-none',
          'hover:bg-surface hover:text-fg',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        )}
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
});
