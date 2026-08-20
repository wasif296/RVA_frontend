import rvaMark from '../assets/rva-mark.png';
import { cn } from '../lib/cn';

type RvaMarkProps = {
  className?: string;
  /** Kept for call-site compatibility. The graphic mark no longer renders a wordmark. */
  withWordmark?: boolean;
  /** Compact mark for tight headers. */
  size?: 'sm' | 'md' | 'lg';
};

const sizeMap = {
  sm: 'h-9 w-auto',
  md: 'h-12 w-auto',
  lg: 'h-14 w-auto',
} as const;

/**
 * RVA graphic mark. Accessible name stays on the image so the brand is
 * announced even without visible “RVA” text.
 */
export function RvaMark({ className, size = 'md' }: RvaMarkProps) {
  return (
    <span
      className={cn('inline-flex items-center', className)}
      aria-label="RVA — Remote VA's Academy"
    >
      <img
        src={rvaMark}
        alt="RVA — Remote VA's Academy"
        className={cn('shrink-0 object-contain', sizeMap[size])}
      />
    </span>
  );
}
