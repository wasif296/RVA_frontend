import rvaMark from '../assets/rva-mark.png';
import { cn } from '../lib/cn';

type RvaMarkProps = {
  className?: string;
  /** Show wordmark text beside the monogram. Default true. */
  withWordmark?: boolean;
  /** Compact mark for tight headers. */
  size?: 'sm' | 'md' | 'lg';
};

const sizeMap = {
  sm: { box: 'h-7 w-auto', text: 'text-lg' },
  md: { box: 'h-9 w-auto', text: 'text-2xl' },
  lg: { box: 'h-11 w-auto', text: 'text-3xl' },
} as const;

/**
 * RVA monogram + wordmark. Renders the real logo (transparent PNG derived
 * from `src/assets/RVA_Logo.jpeg`) so the off-white JPEG plate does not show.
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
      <img
        src={rvaMark}
        alt=""
        aria-hidden
        className={cn('shrink-0 object-contain', dims.box)}
      />
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
