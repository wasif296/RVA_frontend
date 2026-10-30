import { useEffect, useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { CourseLevel } from '@shared';
import {
  EmptyState,
  ErrorState,
  Input,
  Select,
} from '../../design-system';
import { CourseGrid } from './components/CourseGrid';
import type { CourseCardModel } from './components/CourseCard';
import {
  useCatalogCoursesQuery,
  useProgressSummaryQuery,
} from '../dashboard/hooks';

export function CourseCatalogPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState<CourseLevel | ''>('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const catalogQuery = useCatalogCoursesQuery({
    page: 1,
    limit: 100,
    search: search || undefined,
    category: category || undefined,
    level: level || undefined,
  });
  const summaryQuery = useProgressSummaryQuery();

  const progressById = useMemo(() => {
    const map = new Map<string, CourseCardModel>();
    for (const course of summaryQuery.data?.courses ?? []) {
      map.set(course.courseId, {
        courseId: course.courseId,
        title: course.title,
        thumbnailUrl: course.thumbnailUrl,
        category: course.category,
        level: course.level,
        lessonCount: course.lessonCount,
        progressPct: course.progressPct,
        totalPointsEarned: course.totalPointsEarned,
        finalExamUnlocked: course.finalExamUnlocked,
        finalExamCompleted: course.finalExamCompleted,
      });
    }
    return map;
  }, [summaryQuery.data]);

  const cards: CourseCardModel[] = useMemo(() => {
    return (catalogQuery.data?.data ?? []).map((course) => {
      const progress = progressById.get(course.id);
      return {
        courseId: course.id,
        title: course.title,
        thumbnailUrl: course.thumbnailUrl,
        category: course.category,
        level: course.level,
        lessonCount: course.lessonCount,
        progressPct: progress?.progressPct ?? 0,
        totalPointsEarned: progress?.totalPointsEarned ?? 0,
        finalExamUnlocked: progress?.finalExamUnlocked ?? false,
        finalExamCompleted: progress?.finalExamCompleted ?? false,
      };
    });
  }, [catalogQuery.data, progressById]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const course of summaryQuery.data?.courses ?? []) {
      set.add(course.category);
    }
    for (const course of catalogQuery.data?.data ?? []) {
      set.add(course.category);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [catalogQuery.data, summaryQuery.data]);

  const loading = catalogQuery.isLoading || summaryQuery.isLoading;
  const isError = catalogQuery.isError || summaryQuery.isError;

  return (
    <div className="flex flex-col gap-8">
      <header className="page-header">
        <div className="page-header__copy">
          <h1 className="page-header__title">Courses</h1>
          <p className="page-header__subtitle">
            Browse every published course in the academy.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Input
          label="Search"
          placeholder="Title, description, or category"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <Select
          label="Category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
        <Select
          label="Level"
          value={level}
          onChange={(event) => setLevel(event.target.value as CourseLevel | '')}
        >
          <option value="">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </Select>
      </div>

      {isError ? (
        <ErrorState
          title="Could not load courses"
          description="Check your connection and try again."
          onRetry={() => {
            void catalogQuery.refetch();
            void summaryQuery.refetch();
          }}
        />
      ) : !loading && cards.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="size-5" aria-hidden />}
          title="No courses found"
          description="Try adjusting search or filters."
        />
      ) : (
        <CourseGrid courses={cards} loading={loading} />
      )}
    </div>
  );
}
