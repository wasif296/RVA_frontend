import { BookOpen } from 'lucide-react';
import { EmptyState, ErrorState, Skeleton } from '../../design-system';
import { CourseGrid } from '../courses/components/CourseGrid';
import type { CourseCardModel } from '../courses/components/CourseCard';
import { useAuthStore } from '../../store/auth';
import { ContinueLearningCard } from './components/ContinueLearningCard';
import { StatsRow } from './components/StatsRow';
import { useProgressSummaryQuery } from './hooks';

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const summaryQuery = useProgressSummaryQuery();

  if (summaryQuery.isError) {
    return (
      <ErrorState
        title="Could not load your dashboard"
        description="Check your connection and try again."
        onRetry={() => void summaryQuery.refetch()}
      />
    );
  }

  const summary = summaryQuery.data;
  const coursesInProgress = summary
    ? Math.max(0, summary.coursesStarted - summary.coursesCompleted)
    : 0;

  const cards: CourseCardModel[] =
    summary?.courses.map((course) => ({
      courseId: course.courseId,
      title: course.title,
      thumbnailUrl: course.thumbnailUrl,
      category: course.category,
      level: course.level,
      lessonCount: course.lessonCount,
      progressPct: course.progressPct,
      totalPointsEarned: course.totalPointsEarned,
      finalExamUnlocked: course.finalExamUnlocked,
      finalExamCompleted: course.finalExamCompleted,
    })) ?? [];

  return (
    <div className="section-stack">
      <header className="page-header">
        <div className="page-header__copy">
          <h1 className="page-header__title">
            {summaryQuery.isLoading ? (
              <Skeleton width="lg" height="lg" className="max-w-xs" />
            ) : (
              <>Welcome back{user ? `, ${firstName(user.name)}` : ''}</>
            )}
          </h1>
          <p className="page-header__subtitle">
            Pick up where you left off, or start something new. Your progress and points live
            here.
          </p>
        </div>
      </header>

      {summaryQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} variant="rect" height="xl" className="h-28" />
          ))}
        </div>
      ) : summary ? (
        <StatsRow
          totalPoints={summary.totalPoints}
          coursesInProgress={coursesInProgress}
          coursesCompleted={summary.coursesCompleted}
          lessonsCompleted={summary.lessonsCompleted}
        />
      ) : null}

      {!summaryQuery.isLoading && summary && summary.inProgress.length > 0 ? (
        <section className="flex flex-col gap-3" aria-label="Continue learning">
          <h2 className="font-display text-2xl tracking-tight text-fg">Continue learning</h2>
          <div className="flex flex-col gap-3">
            {summary.inProgress.map((item) => (
              <ContinueLearningCard key={item.courseId} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-5">
        <div className="page-header__copy">
          <h2 className="font-display text-2xl tracking-tight text-fg">Your courses</h2>
          <p className="text-base text-fg-muted">
            Everything published in the academy — open a card to keep learning.
          </p>
        </div>

        {!summaryQuery.isLoading && cards.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="size-6" aria-hidden />}
            title="No courses yet"
            description="When an admin publishes a course, it will appear here ready for you to start."
          />
        ) : (
          <CourseGrid courses={cards} loading={summaryQuery.isLoading} />
        )}
      </section>
    </div>
  );
}
