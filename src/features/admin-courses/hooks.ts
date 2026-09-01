import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../design-system';
import { ApiError } from '../../lib/apiClient';
import * as coursesApi from './api';
import type { CreateCourseInput, ListCoursesParams, UpdateCourseInput } from './types';

export const coursesQueryKey = ['admin-courses'] as const;

export function useCoursesQuery(params: ListCoursesParams) {
  return useQuery({
    queryKey: [...coursesQueryKey, params],
    queryFn: () => coursesApi.listCourses(params),
  });
}

export function useCourseQuery(id: string | undefined) {
  return useQuery({
    queryKey: [...coursesQueryKey, 'detail', id],
    queryFn: () => coursesApi.getCourse(id!),
    enabled: Boolean(id),
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: CreateCourseInput) => coursesApi.createCourse(input),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: coursesQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['catalog-courses'] }),
        queryClient.invalidateQueries({ queryKey: ['progress-summary'] }),
      ]);
      toast({
        variant: 'success',
        title: 'Course created',
        description: result.course.title,
      });
    },
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Could not create course',
        description: error instanceof ApiError ? error.message : 'Something went wrong',
      });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCourseInput }) =>
      coursesApi.updateCourse(id, input),
    onSuccess: async (result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: coursesQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['catalog-courses'] }),
        queryClient.invalidateQueries({ queryKey: ['progress-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['course-detail'] }),
        queryClient.invalidateQueries({
          queryKey: [...coursesQueryKey, 'detail', variables.id],
        }),
      ]);
      toast({
        variant: 'success',
        title:
          variables.input.status === 'published'
            ? 'Course published'
            : variables.input.status === 'archived'
              ? 'Course archived'
              : 'Course updated',
        description:
          variables.input.status === 'published' || variables.input.status === 'archived'
            ? result.course.title
            : undefined,
      });
    },
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Could not update course',
        description: error instanceof ApiError ? error.message : 'Something went wrong',
      });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => coursesApi.deleteCourse(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: coursesQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['catalog-courses'] }),
        queryClient.invalidateQueries({ queryKey: ['progress-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['course-detail'] }),
      ]);
      toast({ variant: 'success', title: 'Course deleted' });
    },
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Could not delete course',
        description: error instanceof ApiError ? error.message : 'Something went wrong',
      });
    },
  });
}

export function useCourseDeletionImpact(id: string, enabled: boolean) {
  return useQuery({
    queryKey: [...coursesQueryKey, 'deletion-impact', id],
    queryFn: () => coursesApi.getCourseDeletionImpact(id),
    enabled,
  });
}
