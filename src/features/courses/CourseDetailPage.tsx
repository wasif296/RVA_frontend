import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../../lib/apiClient';
import { ErrorState, Skeleton } from '../../design-system';
import { CourseHero } from './components/CourseHero';
import { FinalExamCard } from './components/FinalExamCard';
import { LessonList } from './components/LessonList';
import { useCourseDetailQuery } from './course-detail.hooks';

function CourseDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-label="Loading course">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <Skeleton variant="rect" className="aspect-video w-full lg:w-[min(42%,22rem)]" />
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton width="sm" height="sm" />
          <Skeleton width="lg" height="lg" className="max-w-md" />
          <Skeleton width="full" height="md" className="max-w-xl" />
          <Skeleton width="md" height="sm" />
          <Skeleton variant="rect" height="sm" className="max-w-md" />
          <Skeleton width="sm" height="lg" className="mt-2 h-11 w-40" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton width="sm" height="lg" />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} variant="rect" height="lg" className="h-16" />
        ))}
      </div>
    </div>
  );
}

export function CourseDetailPage() {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const detailQuery = useCourseDetailQuery(courseId);

  if (detailQuery.isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (detailQuery.isError) {
    const err = detailQuery.error;
    const isNotFound = err instanceof ApiError && err.status === 404;

    if (isNotFound) {
      return (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <h1 className="font-display text-3xl text-fg">Course not found</h1>
          <p className="max-w-md text-fg-muted">
            This course may be unpublished or the link is incorrect.
          </p>
          <Link
            to="/courses"
            className="text-brand-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back to catalog
          </Link>
        </div>
      );
    }

    return (
      <ErrorState
        title="Could not load this course"
        description="Check your connection and try again."
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  const detail = detailQuery.data;
  if (!detail) {
    return (
      <ErrorState
        title="Course not available"
        description="This course may be unpublished or the link is incorrect."
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  const firstLessonId = detail.lessons[0]?.id ?? null;

  return (
    <div className="flex flex-col gap-8">
      <CourseHero
        course={detail.course}
        summary={detail.summary}
        firstLessonId={firstLessonId}
      />

      <LessonList courseId={detail.course.id} lessons={detail.lessons} />

      {detail.finalExam ? (
        <FinalExamCard
          courseId={detail.course.id}
          finalExam={detail.finalExam}
          completedLessonCount={detail.summary.completedLessonCount}
          lessonCount={detail.course.lessonCount}
        />
      ) : null}
    </div>
  );
}
