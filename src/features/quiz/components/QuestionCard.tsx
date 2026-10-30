import { useEffect, useId, useRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../../lib/cn';
import type { LearnerQuestion } from '../quiz.api';

type QuestionCardProps = {
  question: LearnerQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
};

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedIndex,
  onSelect,
}: QuestionCardProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const groupId = useId();
  const labelId = `${groupId}-label`;

  useEffect(() => {
    headingRef.current?.focus();
  }, [question.id]);

  return (
    <fieldset className="flex flex-col gap-4 border-0 p-0">
      <legend className="sr-only">
        Question {questionNumber} of {totalQuestions}
      </legend>

      <h2
        ref={headingRef}
        id={labelId}
        tabIndex={-1}
        className="font-display text-2xl text-fg outline-none"
      >
        <span className="mr-2 text-base font-sans font-medium text-fg-muted">
          {questionNumber}/{totalQuestions}
        </span>
        {question.text}
      </h2>

      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="flex flex-col gap-2"
      >
        {question.options.map((option, index) => {
          const optionId = `${groupId}-opt-${index}`;
          const selected = selectedIndex === index;

          return (
            <label
              key={optionId}
              htmlFor={optionId}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors',
                selected
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-border bg-surface hover:bg-neutral-50',
              )}
            >
              <input
                id={optionId}
                type="radio"
                name={groupId}
                value={index}
                checked={selected}
                onChange={() => onSelect(index)}
                className="mt-1 size-4 shrink-0 border-border text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <span className="flex-1 text-base text-fg">{option}</span>
              {selected ? (
                <Check
                  className="mt-0.5 size-4 shrink-0 text-brand-700"
                  aria-hidden
                />
              ) : null}
              <span className="sr-only">{selected ? 'Selected' : 'Not selected'}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
