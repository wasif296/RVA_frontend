import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { formatDuration, formatPoints } from '../../../lib/format';
import type { CourseDetailLesson } from '../course-detail.api';

type LessonListItemProps = {
  courseId: string;
  lesson: CourseDetailLesson;
  index: number;
};

export function LessonListItem({ courseId, lesson, index }: LessonListItemProps) {
  const videoDone = lesson.videoCompletedAt != null;
  const points =
    lesson.videoPointsAwarded + (lesson.hasQuiz ? lesson.quizPointsAwarded : 0);

  let quizLabel: string | null = null;
  if (lesson.hasQuiz) {
    if (lesson.quizAttempts <= 0 || lesson.bestQuizScore == null) {
      quizLabel = 'Quiz available';
    } else {
      const max = lesson.quizMaxPoints ?? lesson.bestQuizScore;
      quizLabel = `Best quiz: ${lesson.bestQuizScore}/${max}`;
    }
  } else {
    quizLabel = 'No quiz';
  }

  return (
    <li>
      <Link
        to={`/learn/${courseId}/${lesson.id}`}
        className={cn(
          'flex gap-3 rounded-lg px-3 py-3 transition-colors',
          'hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        <span
          className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-medium text-fg-muted"
          aria-hidden
        >
          {index}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-medium text-fg">{lesson.title}</span>
            {lesson.isOptional ? (
              <span className="text-xs text-fg-muted">Optional</span>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-fg-muted">
            {formatDuration(lesson.durationSec)}
            {points > 0 ? ` · ${formatPoints(points)} pts` : null}
          </p>
          {quizLabel ? (
            <p className="mt-1 text-sm text-fg-muted">{quizLabel}</p>
          ) : null}
        </div>

        {videoDone ? (
          <span
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-success-subtle text-success"
            title="Video complete"
          >
            <Check className="size-4" aria-label="Video complete" />
          </span>
        ) : (
          <span className="size-7 shrink-0" aria-hidden />
        )}
      </Link>
    </li>
  );
}
