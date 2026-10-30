import { Link } from 'react-router-dom';
import { formatDateTime, formatPoints } from '../../../lib/format';
import type { AttemptHistoryItem } from '../quiz.api';

type AttemptHistoryProps = {
  attempts: AttemptHistoryItem[];
  resultPathFor: (attemptId: string) => string;
};

export function AttemptHistory({ attempts, resultPathFor }: AttemptHistoryProps) {
  if (attempts.length === 0) {
    return (
      <section aria-label="Attempt history">
        <h2 className="font-display text-2xl text-fg">Previous attempts</h2>
        <p className="mt-2 text-sm text-fg-muted">
          No attempts yet. Submit the quiz to see your history here.
        </p>
      </section>
    );
  }

  const sorted = [...attempts].sort((a, b) => b.attemptNumber - a.attemptNumber);

  return (
    <section className="flex flex-col gap-3" aria-label="Attempt history">
      <h2 className="font-display text-2xl text-fg">Previous attempts</h2>
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {sorted.map((attempt) => (
          <li key={attempt.id}>
            <Link
              to={resultPathFor(attempt.id)}
              className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div>
                <p className="font-medium text-fg">Attempt {attempt.attemptNumber}</p>
                <p className="text-sm text-fg-muted">{formatDateTime(attempt.createdAt)}</p>
              </div>
              <div className="text-right text-sm text-fg">
                <p>
                  {attempt.score}/{attempt.maxScore}
                </p>
                <p className="text-fg-muted">+{formatPoints(attempt.pointsDelta)} pts</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
