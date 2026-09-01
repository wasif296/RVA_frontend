import { Link } from 'react-router-dom';
import { Badge, ProgressBar } from '../../../design-system';
import { formatDuration, formatPoints, formatPercent } from '../../../lib/format';
import type { CourseDetailPayload } from '../course-detail.api';
import { CourseThumbnail } from './CourseThumbnail';

type CourseHeroProps = {
  course: CourseDetailPayload['course'];
  summary: CourseDetailPayload['summary'];
  firstLessonId: string | null;
};

export function CourseHero({ course, summary, firstLessonId }: CourseHeroProps) {
  const resumeId = summary.lastLessonId ?? firstLessonId;
  const ctaLabel =
    summary.lastLessonId != null ? 'Continue learning' : 'Start course';
  const ctaTo =
    resumeId != null ? `/learn/${course.id}/${resumeId}` : undefined;

  return (
    <section className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <CourseThumbnail
        src={course.thumbnailUrl}
        className="shrink-0 rounded-lg lg:w-[min(42%,22rem)]"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral" size="sm">
            {course.category}
          </Badge>
          <Badge variant="brand" size="sm">
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          </Badge>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl text-fg sm:text-4xl">{course.title}</h1>
          <p className="text-base text-fg-muted">{course.description}</p>
        </div>

        <p className="text-sm text-fg-muted">
          {course.lessonCount} lesson{course.lessonCount === 1 ? '' : 's'} ·{' '}
          {formatDuration(course.totalDurationSec)} · {formatPoints(summary.totalPointsEarned)}{' '}
          pts earned
        </p>

        <ProgressBar
          value={summary.progressPct}
          label={`Course progress ${formatPercent(summary.progressPct, 1)}`}
          size="md"
          className="max-w-md"
        />

        {ctaTo ? (
          <div>
            <Link
              to={ctaTo}
              className="inline-flex h-12 items-center justify-center rounded-md bg-brand-600 px-5 text-lg font-medium text-inverse hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {ctaLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
