import { useQuery } from '@tanstack/react-query';
import * as learningApi from './learning.api';

export const learningLessonQueryKey = (lessonId: string) =>
  ['learning-lesson', lessonId] as const;

export function useLearningLessonQuery(lessonId: string) {
  return useQuery({
    queryKey: learningLessonQueryKey(lessonId),
    queryFn: () => learningApi.getLearningLesson(lessonId),
    enabled: Boolean(lessonId),
  });
}
