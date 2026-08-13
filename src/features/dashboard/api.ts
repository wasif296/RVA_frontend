import { apiFetch } from '../../lib/apiClient';
import type { CatalogCourse, ProgressSummary } from './types';
import type { Paginated } from '@shared';

export function getProgressSummary(): Promise<ProgressSummary> {
  return apiFetch<ProgressSummary>('/progress/summary');
}

export type ListPublishedCoursesParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  level?: string;
};

export function listPublishedCourses(
  params: ListPublishedCoursesParams,
): Promise<Paginated<CatalogCourse>> {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.search) search.set('search', params.search);
  if (params.category) search.set('category', params.category);
  if (params.level) search.set('level', params.level);

  const query = search.toString();
  return apiFetch(`/courses${query ? `?${query}` : ''}`);
}
