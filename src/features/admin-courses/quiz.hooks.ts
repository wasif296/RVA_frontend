import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../design-system';
import { ApiError } from '../../lib/apiClient';
import { coursesQueryKey } from './hooks';
import { lessonsQueryKey } from './lessons.hooks';
import * as quizApi from './quiz.api';
import type { UpsertFinalExamInput, UpsertQuizInput } from './quiz.api';

export const quizQueryKey = ['admin-quiz'] as const;
export const finalExamQueryKey = ['admin-final-exam'] as const;

export function useLessonQuizAdminQuery(lessonId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: [...quizQueryKey, lessonId],
    queryFn: () => quizApi.getLessonQuizAdmin(lessonId!),
    enabled: Boolean(lessonId) && enabled,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.code === 'NOT_FOUND') return false;
      return failureCount < 2;
    },
  });
}

export function useFinalExamAdminQuery(courseId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: [...finalExamQueryKey, courseId],
    queryFn: () => quizApi.getFinalExamAdmin(courseId!),
    enabled: Boolean(courseId) && enabled,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.code === 'NOT_FOUND') return false;
      return failureCount < 2;
    },
  });
}

export function useUpsertLessonQuiz(courseId: string, lessonId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: UpsertQuizInput) => quizApi.upsertLessonQuiz(lessonId, input),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...quizQueryKey, lessonId] }),
        queryClient.invalidateQueries({ queryKey: [...lessonsQueryKey, courseId] }),
      ]);
      toast({
        variant: result.warning ? 'warning' : 'success',
        title: 'Quiz saved',
        description: result.warning,
      });
    },
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Could not save quiz',
        description: error instanceof ApiError ? error.message : 'Something went wrong',
      });
    },
  });
}

export function useDeleteLessonQuiz(courseId: string, lessonId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => quizApi.deleteLessonQuiz(lessonId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...quizQueryKey, lessonId] }),
        queryClient.invalidateQueries({ queryKey: [...lessonsQueryKey, courseId] }),
      ]);
      toast({ variant: 'success', title: 'Quiz deleted' });
    },
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Could not delete quiz',
        description: error instanceof ApiError ? error.message : 'Something went wrong',
      });
    },
  });
}

export function useUpsertFinalExam(courseId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: UpsertFinalExamInput) => quizApi.upsertFinalExam(courseId, input),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...finalExamQueryKey, courseId] }),
        queryClient.invalidateQueries({ queryKey: coursesQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['course-detail'] }),
        queryClient.invalidateQueries({ queryKey: ['course-detail-for-exam'] }),
      ]);
      toast({
        variant: result.warning ? 'warning' : 'success',
        title: 'Final exam saved',
        description: result.warning,
      });
    },
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Could not save final exam',
        description: error instanceof ApiError ? error.message : 'Something went wrong',
      });
    },
  });
}

export function useDeleteFinalExam(courseId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => quizApi.deleteFinalExam(courseId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...finalExamQueryKey, courseId] }),
        queryClient.invalidateQueries({ queryKey: coursesQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['course-detail'] }),
        queryClient.invalidateQueries({ queryKey: ['course-detail-for-exam'] }),
      ]);
      toast({ variant: 'success', title: 'Final exam deleted' });
    },
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Could not delete final exam',
        description: error instanceof ApiError ? error.message : 'Something went wrong',
      });
    },
  });
}
