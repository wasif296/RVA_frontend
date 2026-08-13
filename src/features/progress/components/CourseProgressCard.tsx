import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge, ProgressBar } from '../../../design-system';
import { cn } from '../../../lib/cn';
import { formatPercent, formatPoints } from '../../../lib/format';
import type { LearnerProgressCourse } from '../progress.api';

type CourseProgressCardProps = {
  course: LearnerProgressCourse;
};

export function CourseProgressCard({ course }: CourseProgressCardProps) {
  const [open, setOpen] = useState(false);
  const remaining = Math.max(0, course.pointsAvailable - course.pointsEarned);
  const isComplete =
    course.lessonCount > 0 && course.completedLessonCount === course.lessonCount;

  return (
    <article className="rounded-lg border border-border bg-surface">
      <button
        type="button"
        className="flex w-full flex-col gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:flex-row sm:items-center sm:justify-between"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            {open ? (
              <ChevronDown className="mt-1 size-4 shrink-0 text-fg-muted" aria-hidden />
            ) : (
              <ChevronRight className="mt-1 size-4 shrink-0 text-fg-muted" aria-hidden />
            )}
            <div className="min-w-0">
              <h3 className="font-display text-xl text-fg">{course.title}</h3>
              <p className="mt-1 text-sm text-fg-muted">
                {course.completedLessonCount}/{course.lessonCount} lessons ·{' '}
                {formatPoints(course.pointsEarned)}/{formatPoints(course.pointsAvailable)}{' '}
                points
                {remaining > 0 ? (
                  <span className="text-brand-800">
                    {' '}
                    · {formatPoints(remaining)} left
                  </span>
                ) : null}
              </p>
            </div>
          </div>
          <div className="mt-3 pl-6">
            <ProgressBar
              value={course.progressPct}
              size="sm"
              label={`Course progress ${formatPercent(course.progressPct, 1)}`}
            />
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 pl-6 sm:pl-0">
          {isComplete ? (
            <Badge variant="success" size="sm">
              Course complete
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">
              {formatPercent(course.progressPct, 1)}
            </Badge>
          )}
        </div>
      </button>

      {open ? (
        <div className="border-t border-border px-4 py-3">
          <ul className="flex flex-col gap-3">
            {course.lessons.map((lesson) => {
              const videoDone = lesson.videoCompletedAt != null;
              const quizRemaining = Math.max(
                0,
                (lesson.quizMaxScore ?? 0) - lesson.quizPointsAwarded,
              );
              return (
                <li
                  key={lesson.lessonId}
                  className="flex flex-col gap-1 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                >
                  <p className="text-sm font-medium text-fg">{lesson.title}</p>
                  <p className="text-xs text-fg-muted">
                    Video:{' '}
                    {videoDone
                      ? `complete (+${lesson.videoPointsAwarded} pts)`
                      : '5 pts available'}
                    {lesson.quizMaxScore != null ? (
                      <>
                        {' · '}
                        Quiz: {lesson.quizPointsAwarded}/{lesson.quizMaxScore}
                        {quizRemaining > 0 ? ` (${quizRemaining} left)` : ''}
                        {lesson.quizAttempts > 0
                          ? ` · best ${lesson.bestQuizScore ?? 0}`
                          : ' · not taken'}
                      </>
                    ) : (
                      ' · no quiz'
                    )}
                  </p>
                </li>
              );
            })}
          </ul>

          {course.finalExam ? (
            <div
              className={cn(
                'mt-4 rounded-md border border-border px-3 py-3 text-sm',
                course.finalExam.unlocked ? 'bg-brand-50' : 'bg-neutral-50',
              )}
            >
              <p className="font-medium text-fg">Final exam</p>
              <p className="mt-1 text-fg-muted">
                {!course.finalExam.unlocked
                  ? `Locked until all lesson videos are complete · ${course.finalExam.maxMarks} marks available`
                  : course.finalExam.submissionStatus === 'graded'
                    ? `${course.finalExam.passed ? 'Passed' : 'Graded'} · ${course.finalExam.marksAwarded ?? '—'}/${course.finalExam.maxMarks}`
                    : course.finalExam.submissionStatus === 'submitted'
                      ? `Submitted — waiting to be graded · ${course.finalExam.maxMarks} marks`
                      : `${course.finalExam.maxMarks} marks available · unlocked · pass at ${course.finalExam.passMark}`}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
