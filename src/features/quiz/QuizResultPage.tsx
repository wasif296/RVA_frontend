import { Link, useLocation, useParams } from 'react-router-dom';
import { ErrorState, Skeleton } from '../../design-system';
import { AttemptHistory } from './components/AttemptHistory';
import { ResultBreakdown } from './components/ResultBreakdown';
import type { QuizResultLocationState, SubmitQuizResult } from './quiz.api';
import {
  useLessonQuizAttemptsQuery,
  useLessonQuizQuery,
} from './quiz.hooks';

function ResultSkeleton() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4" aria-busy="true">
      <Skeleton width="lg" height="lg" className="max-w-sm" />
      <Skeleton variant="rect" height="xl" className="h-28" />
      <Skeleton variant="rect" height="xl" className="h-40" />
    </div>
  );
}

export function QuizResultPage() {
  const { courseId = '', lessonId = '', attemptId = '' } = useParams<{
    courseId: string;
    lessonId: string;
    attemptId: string;
  }>();
  const location = useLocation();
  const state = location.state as QuizResultLocationState | null;
  const submitResult: SubmitQuizResult | undefined = state?.submitResult;

  const quizQuery = useLessonQuizQuery(lessonId);
  const attemptsQuery = useLessonQuizAttemptsQuery(lessonId);

  if (quizQuery.isLoading || attemptsQuery.isLoading) {
    return <ResultSkeleton />;
  }

  if (quizQuery.isError || attemptsQuery.isError) {
    return (
      <ErrorState
        title="Could not load results"
        description="Check your connection and try again."
        onRetry={() => {
          void quizQuery.refetch();
          void attemptsQuery.refetch();
        }}
      />
    );
  }

  const quiz = quizQuery.data?.quiz;
  const attempts = attemptsQuery.data?.attempts ?? [];
  const attempt = attempts.find((a) => a.id === attemptId);

  if (!quiz || !attempt) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4 py-10 text-center">
        <h1 className="font-display text-3xl text-fg">Result not found</h1>
        <Link
          to={`/learn/${courseId}/${lessonId}`}
          className="text-brand-700 hover:underline"
        >
          Back
        </Link>
      </div>
    );
  }

  const score = submitResult?.score ?? attempt.score;
  const maxScore = submitResult?.maxScore ?? attempt.maxScore;
  const pointsDelta = submitResult?.pointsDelta ?? attempt.pointsDelta;
  const passed = submitResult?.passed ?? (maxScore > 0
    ? (score / maxScore) * 100 >= quiz.passingScorePct
    : false);
  const bestScore = attempts.reduce((best, a) => Math.max(best, a.score), 0);

  const retakeTo = `/learn/${courseId}/${lessonId}/quiz`;
  const backTo = `/learn/${courseId}/${lessonId}`;
  const resultPathFor = (id: string) =>
    `/learn/${courseId}/${lessonId}/quiz/result/${id}`;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div>
        <Link
          to={backTo}
          className="text-sm font-medium text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back
        </Link>
        <h1 className="mt-2 font-display text-3xl text-fg sm:text-4xl">
          {passed ? 'Passed' : 'Completed'}
        </h1>
        <p className="mt-1 text-fg-muted">{quiz.title}</p>
      </div>

      <section
        className="rounded-xl border border-border bg-surface-raised px-6 py-6 shadow-sm"
        aria-label="Score summary"
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-fg-muted">Score</dt>
            <dd className="font-display text-2xl tracking-tight text-fg">
              {score}/{maxScore}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-fg-muted">Points this attempt</dt>
            <dd
              className={
                pointsDelta > 0
                  ? 'inline-flex items-center rounded-full bg-accent-100 px-3 py-1 font-display text-xl tracking-tight text-accent-800 points-pop'
                  : 'font-display text-2xl tracking-tight text-fg'
              }
            >
              +{pointsDelta}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-fg-muted">Best score so far</dt>
            <dd className="text-xl font-medium text-fg">
              {bestScore}/{maxScore}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-fg-muted">Result</dt>
            <dd className="text-xl font-medium text-fg">
              {passed ? 'Passed' : 'Did not pass'}
              <span className="ml-2 text-sm font-normal text-fg-muted">
                ({quiz.passingScorePct}% to pass)
              </span>
            </dd>
          </div>
        </dl>

        {pointsDelta === 0 && attempts.length > 1 ? (
          <p className="mt-4 text-sm text-fg-muted" role="status">
            No new points this time — your best score so far is already {bestScore}/
            {maxScore}. Only improvements above that best earn more points.
          </p>
        ) : null}
      </section>

      {submitResult?.breakdown ? (
        <ResultBreakdown
          questions={quiz.questions}
          breakdown={submitResult.breakdown}
        />
      ) : (
        <p className="text-sm text-fg-muted">
          A full question-by-question review is shown right after you submit. Open a
          fresh attempt result from submit to see correct answers.
        </p>
      )}

      <AttemptHistory attempts={attempts} resultPathFor={resultPathFor} />

      <div className="flex flex-wrap gap-3">
        <Link
          to={retakeTo}
          className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-base font-medium text-inverse hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Retake quiz
        </Link>
        <Link
          to={backTo}
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-base font-medium text-fg hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to lesson
        </Link>
      </div>
    </div>
  );
}
