import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError } from '../../lib/apiClient';
import { ErrorState, Skeleton } from '../../design-system';
import { useCourseDetailQuery } from '../courses/course-detail.hooks';
import { LessonNavigation } from './components/LessonNavigation';
import { LessonSidebar } from './components/LessonSidebar';
import { PlayerStatePanel } from './components/PlayerStatePanel';
import {
  YouTubePlayer,
  type YouTubePlayerHandle,
  type YTPlayerStateName,
} from './components/YouTubePlayer';
import { useLearningLessonQuery } from './learning.hooks';
import { useWatchTimer } from './useWatchTimer';

function LearningSkeleton() {
  return (
    <div
      className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-8"
      aria-busy="true"
      aria-label="Loading lesson"
    >
      <div className="flex flex-col gap-4">
        <Skeleton width="md" height="sm" />
        <Skeleton width="lg" height="lg" className="max-w-lg" />
        <Skeleton variant="rect" className="aspect-video w-full" />
        <Skeleton width="full" height="md" />
        <Skeleton width="full" height="lg" className="h-16" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton width="sm" height="lg" />
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} variant="rect" height="lg" className="h-14" />
        ))}
      </div>
    </div>
  );
}

function LearningSession({
  lessonId,
  detail,
  finalExamExists,
  finalExamUnlocked,
}: {
  lessonId: string;
  detail: NonNullable<ReturnType<typeof useLearningLessonQuery>['data']>;
  finalExamExists: boolean;
  finalExamUnlocked: boolean;
}) {
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const [playerState, setPlayerState] = useState<YTPlayerStateName>('unstarted');
  const { lesson, courseNav, progress, quiz } = detail;
  const completedOnArrival = progress.videoCompletedAt != null;

  const timer = useWatchTimer({
    lessonId,
    requiredWatchSec: lesson.requiredWatchSec,
    initialProgress: progress,
    playerRef,
    playerState,
  });

  const justCompleted = timer.completed && !completedOnArrival;
  const quizPath = `/learn/${courseNav.courseId}/${lesson.id}/quiz`;
  const nextLessonPath = courseNav.nextLessonId
    ? `/learn/${courseNav.courseId}/${courseNav.nextLessonId}`
    : null;
  const finalExamPath =
    finalExamExists && !nextLessonPath
      ? `/exam/${courseNav.courseId}`
      : null;

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-8">
      <div className="order-1 flex min-w-0 flex-col gap-4">
        <div>
          <Link
            to={`/courses/${courseNav.courseId}`}
            className="text-sm font-medium text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {courseNav.courseTitle}
          </Link>
          <h1 className="mt-1 font-display text-3xl text-fg sm:text-4xl">
            {lesson.title}
          </h1>
        </div>

        <YouTubePlayer
          ref={playerRef}
          videoId={lesson.youtubeVideoId}
          onStateChange={(state) => setPlayerState(state)}
        />

        <PlayerStatePanel
          watchedSec={timer.watchedSec}
          requiredWatchSec={timer.requiredWatchSec}
          completed={timer.completed}
          videoPointsAwarded={timer.videoPointsAwarded}
          rejectedMessage={timer.rejectedMessage}
          flushError={timer.flushError}
          justCompleted={justCompleted}
          quizExists={Boolean(quiz?.exists)}
          quizTitle={quiz?.title ?? null}
          quizPath={quizPath}
          nextLessonPath={nextLessonPath}
          finalExamPath={finalExamPath}
          finalExamUnlocked={finalExamUnlocked || justCompleted}
        />

        <div className="prose-none">
          <h2 className="sr-only">Description</h2>
          <p className="prose-readable whitespace-pre-wrap text-base text-fg-muted">
            {lesson.description}
          </p>
        </div>

        <LessonNavigation
          courseId={courseNav.courseId}
          prevLessonId={courseNav.prevLessonId}
          nextLessonId={courseNav.nextLessonId}
        />
      </div>

      <aside className="order-2 lg:sticky lg:top-4">
        <LessonSidebar
          courseId={courseNav.courseId}
          lessons={courseNav.lessons}
          currentLessonId={lesson.id}
        />
      </aside>
    </div>
  );
}

export function LearningPage() {
  const { courseId = '', lessonId = '' } = useParams<{
    courseId: string;
    lessonId: string;
  }>();
  const lessonQuery = useLearningLessonQuery(lessonId);
  const courseDetailQuery = useCourseDetailQuery(courseId);

  if (lessonQuery.isLoading) {
    return <LearningSkeleton />;
  }

  if (lessonQuery.isError) {
    const err = lessonQuery.error;
    const isNotFound = err instanceof ApiError && err.status === 404;

    if (isNotFound) {
      return (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <h1 className="font-display text-3xl text-fg">Lesson not found</h1>
          <p className="max-w-md text-fg-muted">
            This lesson may belong to an unpublished course, or the link is incorrect.
          </p>
          <Link
            to={courseId ? `/courses/${courseId}` : '/courses'}
            className="text-brand-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back to course
          </Link>
        </div>
      );
    }

    return (
      <ErrorState
        title="Could not load this lesson"
        description="Check your connection and try again."
        onRetry={() => void lessonQuery.refetch()}
      />
    );
  }

  const detail = lessonQuery.data;
  if (!detail) {
    return (
      <ErrorState
        title="Lesson not available"
        description="This lesson may belong to an unpublished course, or the link is incorrect."
        onRetry={() => void lessonQuery.refetch()}
      />
    );
  }

  const finalExam = courseDetailQuery.data?.finalExam ?? null;

  return (
    <LearningSession
      key={lessonId}
      lessonId={lessonId}
      detail={detail}
      finalExamExists={Boolean(finalExam?.exists)}
      finalExamUnlocked={Boolean(finalExam?.unlocked)}
    />
  );
}
