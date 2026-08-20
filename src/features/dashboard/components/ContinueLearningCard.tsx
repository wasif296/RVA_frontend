import { Link } from 'react-router-dom';
import { ProgressBar } from '../../../design-system';
import type { InProgressCourse } from '../types';

type ContinueLearningCardProps = {
  item: InProgressCourse;
};

export function ContinueLearningCard({ item }: ContinueLearningCardProps) {
  return (
    <article className="card-highlight overflow-hidden rounded-xl border">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-xl tracking-tight text-fg">{item.courseTitle}</h3>
          <p className="mt-1 text-sm leading-body text-fg-muted">
            Next up: {item.lessonTitle}
          </p>
          <div className="mt-4 max-w-md">
            <ProgressBar
              value={item.courseProgressPct}
              size="sm"
              label={`${item.completedLessonCount}/${item.lessonCount} lessons`}
            />
          </div>
        </div>
        <div className="shrink-0">
          <Link
            to={`/learn/${item.courseId}/${item.lessonId}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-inverse shadow-sm transition-[background-color,box-shadow] duration-fast hover:bg-brand-700 hover:shadow-md motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Resume lesson
          </Link>
        </div>
      </div>
    </article>
  );
}
