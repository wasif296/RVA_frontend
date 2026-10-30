import { Check, X } from 'lucide-react';
import { cn } from '../../../lib/cn';
import type { LearnerQuestion, QuestionResult } from '../quiz.api';

type ResultBreakdownProps = {
  questions: LearnerQuestion[];
  breakdown: QuestionResult[];
};

export function ResultBreakdown({ questions, breakdown }: ResultBreakdownProps) {
  const byId = new Map(breakdown.map((item) => [item.questionId, item]));

  return (
    <section className="flex flex-col gap-4" aria-label="Answer breakdown">
      <h2 className="font-display text-2xl text-fg">Review</h2>
      <ol className="flex flex-col gap-4">
        {questions.map((question, index) => {
          const result = byId.get(question.id);
          if (!result) return null;

          const selectedLabel =
            result.selectedIndex == null
              ? 'No answer'
              : (question.options[result.selectedIndex] ?? 'Unknown');
          const correctLabel = question.options[result.correctIndex] ?? 'Unknown';

          return (
            <li
              key={question.id}
              className={cn(
                'rounded-lg border px-4 py-3',
                result.isCorrect
                  ? 'border-success/40 bg-success-subtle'
                  : 'border-danger/30 bg-danger-subtle',
              )}
            >
              <div className="flex items-start gap-2">
                {result.isCorrect ? (
                  <Check className="mt-1 size-4 shrink-0 text-success" aria-hidden />
                ) : (
                  <X className="mt-1 size-4 shrink-0 text-danger" aria-hidden />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-fg">
                    {index + 1}. {question.text}
                  </p>
                  <p className="mt-2 text-sm text-fg">
                    <span className="text-fg-muted">Your answer: </span>
                    {selectedLabel}
                    {!result.isCorrect ? (
                      <span className="ml-2 text-danger">(incorrect)</span>
                    ) : (
                      <span className="ml-2 text-success">(correct)</span>
                    )}
                  </p>
                  {!result.isCorrect ? (
                    <p className="mt-1 text-sm text-fg">
                      <span className="text-fg-muted">Correct answer: </span>
                      {correctLabel}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
