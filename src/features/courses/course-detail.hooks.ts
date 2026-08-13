import { useQuery } from '@tanstack/react-query';
import * as courseDetailApi from './course-detail.api';

export const courseDetailQueryKey = (courseId: string) =>
  ['course-detail', courseId] as const;

export function useCourseDetailQuery(courseId: string) {
  return useQuery({
    queryKey: courseDetailQueryKey(courseId),
    queryFn: () => courseDetailApi.getCourseDetail(courseId),
    enabled: Boolean(courseId),
  });
}
