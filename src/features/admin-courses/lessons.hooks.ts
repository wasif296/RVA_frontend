import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../design-system';
import { ApiError } from '../../lib/apiClient';
import { coursesQueryKey } from './hooks';
import * as lessonsApi from './lessons.api';
import type { CreateLessonInput, UpdateLessonInput } from './lessons.api';

export const lessonsQueryKey = ['admin-lessons'] as const;

export function useLessonsQuery(courseId: string | undefined) {
  return useQuery({
    queryKey: [...lessonsQueryKey, courseId],
    queryFn: () => lessonsApi.listLessons(courseId!),
    enabled: Boolean(courseId),
  });
}

async function invalidateCourseAndLessons(
  queryClient: ReturnType<typeof useQueryClient>,
  courseId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [...lessonsQueryKey, courseId] }),
    queryClient.invalidateQueries({ queryKey: coursesQueryKey }),
    queryClient.invalidateQueries({ queryKey: ['catalog-courses'] }),
    queryClient.invalidateQueries({ queryKey: ['course-detail'] }),
    queryClient.invalidateQueries({ queryKey: ['learning-lesson'] }),
    queryClient.invalidateQueries({ queryKey: ['progress-summary'] }),
  ]);
}

export function useCreateLesson(courseId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: CreateLessonInput) => lessonsApi.createLesson(courseId, input),
    onSuccess: async () => {
      await invalidateCourseAndLessons(queryClient, courseId);
      toast({ variant: 'success', title: 'Lesson created' });
    },
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Could not create lesson',
        description: error instanceof ApiError ? error.message : 'Something went wrong',
      });
    },
  });
}

export function useUpdateLesson(courseId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLessonInput }) =>
      lessonsApi.updateLesson(id, input),
    onSuccess: async () => {
      await invalidateCourseAndLessons(queryClient, courseId);
      toast({ variant: 'success', title: 'Lesson updated' });
    },
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Could not update lesson',
        description: error instanceof ApiError ? error.message : 'Something went wrong',
      });
    },
  });
}

export function useDeleteLesson(courseId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => lessonsApi.deleteLesson(id),
    onSuccess: async () => {
      await invalidateCourseAndLessons(queryClient, courseId);
      toast({ variant: 'success', title: 'Lesson deleted' });
    },
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Could not delete lesson',
        description: error instanceof ApiError ? error.message : 'Something went wrong',
      });
    },
  });
}

export function useReorderLessons(courseId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (lessonIds: string[]) => lessonsApi.reorderLessons(courseId, lessonIds),
    onMutate: async (lessonIds) => {
      const key = [...lessonsQueryKey, courseId] as const;
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<{ lessons: lessonsApi.AdminLesson[] }>(key);

      if (previous) {
        const byId = new Map(previous.lessons.map((lesson) => [lesson.id, lesson]));
        const optimistic = lessonIds
          .map((id, index) => {
            const lesson = byId.get(id);
            if (!lesson) return null;
            return { ...lesson, order: (index + 1) * 10 };
          })
          .filter((row): row is lessonsApi.AdminLesson => row != null);
        queryClient.setQueryData(key, { lessons: optimistic });
      }

      return { previous, key };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.key, context.previous);
      }
      toast({
        variant: 'error',
        title: 'Could not reorder lessons',
        description: error instanceof ApiError ? error.message : 'Something went wrong',
      });
    },
    onSuccess: async (result) => {
      queryClient.setQueryData([...lessonsQueryKey, courseId], result);
      await queryClient.invalidateQueries({ queryKey: coursesQueryKey });
    },
  });
}
