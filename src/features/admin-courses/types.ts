import type { CourseLevel, CourseStatus, Paginated } from '@shared';

export type AdminCourse = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  thumbnailPublicId: string | null;
  category: string;
  level: CourseLevel;
  status: CourseStatus;
  lessonCount: number;
  totalDurationSec: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ListCoursesParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  level?: CourseLevel | '';
  status?: CourseStatus | '';
};

export type CourseFormValues = {
  title: string;
  description: string;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  category: string;
  level: CourseLevel;
  status: CourseStatus;
};

export type CreateCourseInput = {
  title: string;
  description: string;
  thumbnailUrl?: string;
  thumbnailPublicId?: string;
  category: string;
  level: CourseLevel;
  status?: CourseStatus;
};

export type UpdateCourseInput = {
  title?: string;
  description?: string;
  thumbnailUrl?: string | null;
  thumbnailPublicId?: string | null;
  category?: string;
  level?: CourseLevel;
  status?: CourseStatus;
};

export type CoursesPage = Paginated<AdminCourse>;
