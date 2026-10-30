import { Link } from 'react-router-dom';
import { ProgressBar } from '../../../design-system';
import { formatDuration, formatPoints } from '../../../lib/format';
import { RULES } from '@shared';
import { cn } from '../../../lib/cn';

type PlayerStatePanelProps = {
  watchedSec: number;
  requiredWatchSec: number;
  completed: boolean;
  videoPointsAwarded: number;
  rejectedMessage?: string | null;
  flushError?: string | null;
  /** True only when video became complete during this page visit. */
  justCompleted?: boolean;
  quizExists: boolean;
  quizTitle?: string | null;
  quizPath: string;
  nextLessonPath: string | null;
  /** When last lesson completes and a final exam exists, show this CTA. */
  finalExamPath?: string | null;
  finalExamUnlocked?: boolean;
};

export function PlayerStatePanel({
  watchedSec,
  requiredWatchSec,
  completed,
  videoPointsAwarded,
  rejectedMessage,
  flushError,
  justCompleted = false,
  quizExists,
  quizTitle,
  quizPath,
  nextLessonPath,
  finalExamPath = null,
  finalExamUnlocked = false,
}: PlayerStatePanelProps) {
  const pct =
    requiredWatchSec > 0
      ? Math.min(100, (watchedSec / requiredWatchSec) * 100)
      : 0;
  const pointsShown = videoPointsAwarded > 0 ? videoPointsAwarded : RULES.VIDEO_POINTS;
  const showFinalExamCta =
    justCompleted && !nextLessonPath && Boolean(finalExamPath) && finalExamUnlocked;

  return (
    <section aria-label="Watch progress" className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-4 shadow-sm">
        <ProgressBar value={pct} label="Watch progress" size="md" />

        <dl className="grid gap-2 text-sm text-fg sm:grid-cols-3">
          <div>
            <dt className="text-fg-muted">Watched</dt>
            <dd className="font-medium">{formatDuration(watchedSec)}</dd>
          </div>
          <div>
            <dt className="text-fg-muted">Target</dt>
            <dd className="font-medium">{formatDuration(requiredWatchSec)}</dd>
          </div>
          <div>
            <dt className="text-fg-muted">Status</dt>
            <dd className="font-medium">
              {completed
                ? `Complete${videoPointsAwarded > 0 ? ` · +${formatPoints(videoPointsAwarded)} pts` : ''}`
                : 'In progress'}
            </dd>
          </div>
        </dl>

        {rejectedMessage ? (
          <p className="text-sm text-fg-muted" role="status">
            {rejectedMessage}
          </p>
        ) : null}
        {flushError && !rejectedMessage ? (
          <p className="text-sm text-fg-muted" role="status">
            {flushError}
          </p>
        ) : null}
      </div>

      {justCompleted ? (
        <div
          className={cn(
            'card-highlight overflow-hidden rounded-xl border bg-linear-to-br',
            'from-success-subtle via-surface-raised to-accent-50 points-pop',
          )}
          role="status"
        >
          <div className="flex flex-col gap-4 p-5">
            <div>
              <p className="font-display text-xl tracking-tight text-fg">Video complete</p>
              <p
                className={cn(
                  'mt-2 inline-flex items-center rounded-full bg-accent-100 px-3 py-1',
                  'font-display text-sm font-semibold tracking-tight text-accent-800',
                )}
              >
                +{formatPoints(pointsShown)} points
              </p>
            </div>
            {quizExists ? (
              <Link
                to={quizPath}
                className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-base font-medium text-inverse shadow-sm transition-[background-color,box-shadow] duration-fast hover:bg-brand-700 hover:shadow-md motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Take the quiz{quizTitle ? `: ${quizTitle}` : ''}
              </Link>
            ) : null}
            {!quizExists && nextLessonPath ? (
              <Link
                to={nextLessonPath}
                className="inline-flex h-11 items-center justify-center rounded-md bg-brand-600 px-5 text-base font-medium text-inverse shadow-sm transition-[background-color,box-shadow] duration-fast hover:bg-brand-700 hover:shadow-md motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Continue to next lesson
              </Link>
            ) : null}
            {showFinalExamCta && finalExamPath ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-fg-muted">
                  You finished every lesson video. The final exam is unlocked.
                </p>
                <Link
                  to={finalExamPath}
                  className={cn(
                    'inline-flex h-11 items-center justify-center rounded-md px-5 text-base font-semibold shadow-sm transition-[background-color,box-shadow] duration-fast hover:shadow-md motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    quizExists
                      ? 'border border-brand-600 bg-surface text-brand-800 hover:bg-brand-50'
                      : 'bg-brand-600 text-inverse hover:bg-brand-700',
                  )}
                >
                  Take the final exam
                </Link>
              </div>
            ) : null}
            {!quizExists && !nextLessonPath && !showFinalExamCta ? (
              <p className="text-sm text-fg-muted">This lesson has no quiz.</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {!justCompleted && quizExists ? (
        <div className="rounded-xl border border-border bg-surface px-4 py-4 shadow-sm">
          {quizTitle ? <p className="font-medium text-fg">{quizTitle}</p> : null}
          <p className="mt-1 text-sm text-fg-muted">
            Available anytime — before, during, or after the video.
          </p>
          <Link
            to={quizPath}
            className="mt-3 inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-base font-medium text-inverse shadow-sm transition-[background-color,box-shadow] duration-fast hover:bg-brand-700 hover:shadow-md motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Take quiz
          </Link>
        </div>
      ) : null}

      {!justCompleted && !quizExists ? (
        <p className="text-sm text-fg-muted">This lesson has no quiz.</p>
      ) : null}
    </section>
  );
}
