import { BookOpen } from 'lucide-react';
import { EmptyState, ErrorState, Skeleton } from '../../design-system';
import { BadgeList } from '../badges/components/BadgeList';
import { CourseProgressCard } from './components/CourseProgressCard';
import type { LearnerProgressDetail } from './progress.api';
import { useMyProgressQuery } from './progress.hooks';

function ProgressSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton width="lg" height="lg" className="max-w-xs" />
      <Skeleton variant="rect" height="xl" className="h-48" />
      <Skeleton variant="rect" height="xl" className="h-28" />
      <Skeleton variant="rect" height="xl" className="h-28" />
    </div>
  );
}

export function ProgressDetailView({
  detail,
  heading = 'My Progress',
  description = 'Track lesson progress, exam results, and badges across your courses.',
}: {
  detail: LearnerProgressDetail;
  heading?: string;
  description?: string;
}) {
  const hasCourses = detail.courses.length > 0;
  const badges = detail.badges ?? [];

  return (
    <div className="section-stack">
      <header className="page-header">
        <div className="page-header__copy">
          <h1 className="page-header__title">{heading}</h1>
          <p className="page-header__subtitle">{description}</p>
        </div>
      </header>

      {badges.length > 0 ? (
        <section className="flex flex-col gap-4" aria-label="Badges">
          <div>
            <h2 className="font-display text-2xl text-fg">Badges</h2>
            <p className="text-sm text-fg-muted">
              Earned by passing a written final exam.
            </p>
          </div>
          <BadgeList badges={badges} variant="full" />
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-2xl text-fg">Courses</h2>
          <p className="text-sm text-fg-muted">
            Expand a course for per-lesson video and quiz detail.
          </p>
        </div>

        {!hasCourses ? (
          <EmptyState
            icon={<BookOpen className="size-5" aria-hidden />}
            title="No published courses yet"
            description="When courses are published, your progress and available points will show up here."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {detail.courses.map((course) => (
              <CourseProgressCard key={course.courseId} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function ProgressPage() {
  const query = useMyProgressQuery();

  if (query.isLoading) {
    return <ProgressSkeleton />;
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        title="Could not load your progress"
        description="Check your connection and try again."
        onRetry={() => void query.refetch()}
      />
    );
  }

  return <ProgressDetailView detail={query.data} />;
}
