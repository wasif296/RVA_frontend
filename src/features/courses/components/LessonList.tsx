import type { CourseDetailLesson } from '../course-detail.api';
import { LessonListItem } from './LessonListItem';

type LessonListProps = {
  courseId: string;
  lessons: CourseDetailLesson[];
};

export function LessonList({ courseId, lessons }: LessonListProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-2xl text-fg">Lessons</h2>
      <ol className="divide-y divide-border rounded-lg border border-border bg-surface">
        {lessons.map((lesson, index) => (
          <LessonListItem
            key={lesson.id}
            courseId={courseId}
            lesson={lesson}
            index={index + 1}
          />
        ))}
      </ol>
    </section>
  );
}
