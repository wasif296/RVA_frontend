import { cn } from '../../../lib/cn';

type QuizProgressProps = {
  total: number;
  answers: Array<number | null>;
  currentIndex: number;
  onJump: (index: number) => void;
};

export function QuizProgress({
  total,
  answers,
  currentIndex,
  onJump,
}: QuizProgressProps) {
  return (
    <nav aria-label="Question progress" className="flex flex-wrap gap-2">
      {Array.from({ length: total }, (_, index) => {
        const answered = answers[index] != null;
        const current = index === currentIndex;

        return (
          <button
            key={index}
            type="button"
            onClick={() => onJump(index)}
            aria-current={current ? 'step' : undefined}
            aria-label={`Question ${index + 1}${answered ? ', answered' : ', unanswered'}`}
            className={cn(
              'flex size-9 items-center justify-center rounded-md text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              current && 'ring-2 ring-brand-600 ring-offset-2',
              answered
                ? 'bg-brand-600 text-inverse'
                : 'border border-border bg-surface text-fg-muted hover:bg-neutral-50',
            )}
          >
            {index + 1}
            {answered ? <span className="sr-only"> (answered)</span> : null}
          </button>
        );
      })}
    </nav>
  );
}
