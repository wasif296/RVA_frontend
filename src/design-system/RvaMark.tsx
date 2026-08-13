import { cn } from '../lib/cn';

type RvaMarkProps = {
  className?: string;
  /** Show wordmark text beside the monogram. Default true. */
  withWordmark?: boolean;
  /** Compact mark for tight headers. */
  size?: 'sm' | 'md' | 'lg';
};

const sizeMap = {
  sm: { box: 'size-7', text: 'text-lg' },
  md: { box: 'size-9', text: 'text-2xl' },
  lg: { box: 'size-11', text: 'text-3xl' },
} as const;

/**
 * RVA monogram + wordmark — original SVG, no external brand assets.
 * Soft rounded tile + letterforms; honey dot as a quiet accent of progress.
 */
export function RvaMark({
  className,
  withWordmark = true,
  size = 'md',
}: RvaMarkProps) {
  const dims = sizeMap[size];

  return (
    <span
      className={cn('inline-flex items-center gap-2 text-brand-700', className)}
      aria-label="RVA — Remote VA's Academy"
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className={cn('shrink-0', dims.box)}
      >
        <rect x="1" y="1" width="38" height="38" rx="12" className="fill-brand-600" />
        <path
          d="M12 26V14h6.2c2.9 0 4.7 1.55 4.7 3.9 0 1.55-.75 2.75-2.05 3.35L26 26h-3.15l-4.55-4.55H15.1V26H12Zm3.1-7.15h2.85c1.35 0 2.15-.7 2.15-1.8s-.8-1.75-2.15-1.75H15.1v3.55Z"
          className="fill-inverse"
        />
        <circle cx="29.5" cy="12.5" r="2.25" className="fill-accent-300" />
      </svg>
      {withWordmark ? (
        <span
          className={cn(
            'font-display font-semibold tracking-tight text-brand-800',
            dims.text,
          )}
        >
          RVA
        </span>
      ) : null}
    </span>
  );
}
