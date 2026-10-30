import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type LessonNavigationProps = {
  courseId: string;
  prevLessonId: string | null;
  nextLessonId: string | null;
};

export function LessonNavigation({
  courseId,
  prevLessonId,
  nextLessonId,
}: LessonNavigationProps) {
  const linkClass =
    'inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
  const disabledClass =
    'inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-fg-muted opacity-50';

  return (
    <nav
      aria-label="Lesson navigation"
      className="flex items-center justify-between gap-3 border-t border-border pt-4"
    >
      {prevLessonId ? (
        <Link to={`/learn/${courseId}/${prevLessonId}`} className={linkClass}>
          <ChevronLeft className="size-4" aria-hidden />
          Previous lesson
        </Link>
      ) : (
        <span className={disabledClass}>
          <ChevronLeft className="size-4" aria-hidden />
          Previous lesson
        </span>
      )}

      {nextLessonId ? (
        <Link to={`/learn/${courseId}/${nextLessonId}`} className={linkClass}>
          Next lesson
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span className={disabledClass}>
          Next lesson
          <ChevronRight className="size-4" aria-hidden />
        </span>
      )}
    </nav>
  );
}
