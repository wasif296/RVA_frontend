import { useQuery } from '@tanstack/react-query';
import * as dashboardApi from './api';
import type { ListPublishedCoursesParams } from './api';

export const progressSummaryQueryKey = ['progress-summary'] as const;
export const catalogCoursesQueryKey = ['catalog-courses'] as const;

export function useProgressSummaryQuery() {
  return useQuery({
    queryKey: progressSummaryQueryKey,
    queryFn: () => dashboardApi.getProgressSummary(),
  });
}

export function useCatalogCoursesQuery(params: ListPublishedCoursesParams) {
  return useQuery({
    queryKey: [...catalogCoursesQueryKey, params],
    queryFn: () => dashboardApi.listPublishedCourses(params),
  });
}
