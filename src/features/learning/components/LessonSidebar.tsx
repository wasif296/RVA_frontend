import { Link } from 'react-router-dom';
import { Check, HelpCircle } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { formatDuration } from '../../../lib/format';
import type { LearningNavLesson } from '../learning.api';

type LessonSidebarProps = {
  courseId: string;
  lessons: LearningNavLesson[];
  currentLessonId: string;
};

export function LessonSidebar({
  courseId,
  lessons,
  currentLessonId,
}: LessonSidebarProps) {
  return (
    <nav aria-label="Course lessons" className="flex flex-col gap-2">
      <h2 className="font-display text-xl text-fg">Lessons</h2>
      <ol className="divide-y divide-border rounded-lg border border-border bg-surface">
        {lessons.map((lesson, index) => {
          const active = lesson.id === currentLessonId;
          const done = lesson.videoCompletedAt != null;

          return (
            <li key={lesson.id}>
              <Link
                to={`/learn/${courseId}/${lesson.id}`}
                className={cn(
                  'flex gap-3 px-3 py-3 transition-colors',
                  'hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active && 'bg-brand-50 hover:bg-brand-50',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-medium',
                    active
                      ? 'bg-brand-600 text-inverse'
                      : 'bg-neutral-100 text-fg-muted',
                  )}
                  aria-hidden
                >
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className={cn('font-medium text-fg', active && 'text-brand-800')}>
                    {lesson.title}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-fg-muted">
                    <span>{formatDuration(lesson.durationSec)}</span>
                    {lesson.hasQuiz ? (
                      <span className="inline-flex items-center gap-1">
                        <HelpCircle className="size-3.5" aria-hidden />
                        Quiz
                      </span>
                    ) : null}
                  </p>
                </div>

                {done ? (
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-success-subtle text-success">
                    <Check className="size-4" aria-label="Video complete" />
                  </span>
                ) : (
                  <span className="size-7 shrink-0" aria-hidden />
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
