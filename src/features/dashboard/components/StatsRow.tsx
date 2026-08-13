import { formatPoints } from '../../../lib/format';
import { cn } from '../../../lib/cn';

type StatsRowProps = {
  totalPoints: number;
  coursesInProgress: number;
  coursesCompleted: number;
  lessonsCompleted: number;
};

function Stat({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string | number;
  emphasize?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface px-5 py-6 shadow-sm',
        emphasize &&
          'border-accent-200 bg-linear-to-br from-surface-raised to-accent-50 shadow-md',
      )}
    >
      <p className="text-sm font-medium tracking-wide text-fg-muted uppercase">
        {label}
      </p>
      <p
        className={cn(
          'mt-3 font-display text-3xl tracking-tight text-fg',
          emphasize && 'text-accent-800',
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function StatsRow({
  totalPoints,
  coursesInProgress,
  coursesCompleted,
  lessonsCompleted,
}: StatsRowProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Total points" value={formatPoints(totalPoints)} emphasize />
      <Stat label="Courses in progress" value={coursesInProgress} />
      <Stat label="Courses completed" value={coursesCompleted} />
      <Stat label="Lessons completed" value={lessonsCompleted} />
    </div>
  );
}
