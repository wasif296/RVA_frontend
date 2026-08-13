import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { Avatar } from '../../../design-system';
import { formatDate } from '../../../lib/format';
import { cn } from '../../../lib/cn';
import type { Badge } from '../badges.api';

export type BadgeListProps = {
  badges: Badge[];
  variant?: 'compact' | 'full';
  className?: string;
};

export function BadgeList({
  badges,
  variant = 'full',
  className,
}: BadgeListProps) {
  if (badges.length === 0) return null;

  if (variant === 'compact') {
    const count = badges.length;
    const label = count === 1 ? '1 badge earned' : `${count} badges earned`;

    return (
      <Link
        to="/progress"
        aria-label={label}
        className={cn(
          'inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1',
          'text-sm font-medium text-brand-800',
          'hover:bg-brand-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className,
        )}
      >
        <Award className="size-4 text-brand-700" aria-hidden />
        <span>{count}</span>
      </Link>
    );
  }

  return (
    <ul className={cn('flex flex-col gap-3', className)} aria-label="Badges earned">
      {badges.map((badge) => (
        <li
          key={badge.id}
          className="flex items-start gap-3 rounded-md border border-border bg-surface px-4 py-3"
        >
          <Avatar
            name={badge.courseTitle}
            alt={`Badge: ${badge.courseTitle}`}
            size="sm"
            title={badge.courseTitle}
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-fg">{badge.courseTitle}</p>
            <p className="mt-0.5 text-sm text-fg-muted">
              Earned {formatDate(badge.earnedAt)} · {badge.marksAwarded}/{badge.maxMarks}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
