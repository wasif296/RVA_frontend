import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import { Badge, ProgressBar } from '../../../design-system';
import { cn } from '../../../lib/cn';
import { formatPoints, formatPercent } from '../../../lib/format';

export type CourseCardModel = {
  courseId: string;
  title: string;
  thumbnailUrl: string | null;
  category: string;
  level: string;
  lessonCount: number;
  progressPct: number;
  totalPointsEarned: number;
  finalExamUnlocked: boolean;
  finalExamCompleted: boolean;
};

function ctaLabel(progressPct: number): string {
  if (progressPct <= 0) return 'Start';
  if (progressPct >= 100) return 'Review';
  return 'Continue';
}

type CourseCardProps = {
  course: CourseCardModel;
};

export function CourseCard({ course }: CourseCardProps) {
  const [thumbBroken, setThumbBroken] = useState(false);
  const showImage = Boolean(course.thumbnailUrl) && !thumbBroken;

  return (
    <article
      className={cn(
        'card-interactive flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm',
      )}
    >
      <div className="aspect-video bg-surface-muted">
        {showImage ? (
          <img
            src={course.thumbnailUrl!}
            alt=""
            className="size-full object-cover"
            onError={() => setThumbBroken(true)}
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 bg-linear-to-br from-brand-50 via-surface to-accent-50 text-fg-muted">
            <ImageOff className="size-8 text-brand-500" aria-hidden />
            <span className="text-sm">No thumbnail</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral" size="sm">
            {course.category}
          </Badge>
          <Badge variant="brand" size="sm">
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          </Badge>
          {course.finalExamUnlocked && !course.finalExamCompleted ? (
            <Badge variant="warning" size="sm">
              Final exam available
            </Badge>
          ) : null}
        </div>

        <h3 className="font-display text-xl tracking-tight text-fg">
          <Link
            to={`/courses/${course.courseId}`}
            className="hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {course.title}
          </Link>
        </h3>

        <p className="text-sm leading-body text-fg-muted">
          {course.lessonCount} lesson{course.lessonCount === 1 ? '' : 's'} ·{' '}
          <span className="font-medium text-accent-700">
            {formatPoints(course.totalPointsEarned)} pts
          </span>{' '}
          earned
        </p>

        <ProgressBar
          value={course.progressPct}
          size="sm"
          label={`Progress ${formatPercent(course.progressPct, 1)}`}
        />

        <div className="mt-auto pt-1">
          <Link
            to={`/courses/${course.courseId}`}
            className={cn(
              'inline-flex h-10 w-full items-center justify-center rounded-md px-4 text-sm font-medium',
              'bg-brand-600 text-inverse shadow-sm hover:bg-brand-700 hover:shadow-md',
              'transition-[background-color,box-shadow] duration-fast motion-reduce:transition-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          >
            {ctaLabel(course.progressPct)}
          </Link>
        </div>
      </div>
    </article>
  );
}
