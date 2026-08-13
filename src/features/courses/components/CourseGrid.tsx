import { Skeleton } from '../../../design-system';
import { CourseCard, type CourseCardModel } from './CourseCard';

type CourseGridProps = {
  courses: CourseCardModel[];
  loading?: boolean;
  skeletonCount?: number;
};

function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <Skeleton variant="rect" className="aspect-video !h-auto w-full" />
      <div className="flex flex-col gap-4 p-6">
        <div className="flex gap-2">
          <Skeleton width="sm" height="sm" />
          <Skeleton width="sm" height="sm" />
        </div>
        <Skeleton width="full" height="md" />
        <Skeleton width="md" height="sm" />
        <Skeleton width="full" height="sm" />
        <Skeleton width="full" height="md" />
      </div>
    </div>
  );
}

export function CourseGrid({
  courses,
  loading = false,
  skeletonCount = 6,
}: CourseGridProps) {
  return (
    <div className="course-grid">
      {loading
        ? Array.from({ length: skeletonCount }, (_, index) => (
            <CourseCardSkeleton key={index} />
          ))
        : courses.map((course) => <CourseCard key={course.courseId} course={course} />)}
    </div>
  );
}
