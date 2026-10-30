import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../design-system';
import {
  applyPointsDeltaToSession,
  invalidateLearnerProgressCaches,
} from '../../lib/invalidateProgress';
import { getCourseDetail } from '../courses/course-detail.api';
import * as quizApi from './quiz.api';
import type { SubmitFinalExamInput } from './quiz.api';

export const lessonQuizQueryKey = (lessonId: string) =>
  ['lesson-quiz', lessonId] as const;

export const lessonQuizAttemptsQueryKey = (lessonId: string) =>
  ['lesson-quiz-attempts', lessonId] as const;

export const finalExamQueryKey = (courseId: string) =>
  ['final-exam', courseId] as const;

export const finalExamSubmissionQueryKey = (courseId: string) =>
  ['final-exam-submission', courseId] as const;

export const courseDetailForExamQueryKey = (courseId: string) =>
  ['course-detail-for-exam', courseId] as const;

export function useLessonQuizQuery(lessonId: string) {
  return useQuery({
    queryKey: lessonQuizQueryKey(lessonId),
    queryFn: () => quizApi.getLessonQuiz(lessonId),
    enabled: Boolean(lessonId),
  });
}

export function useLessonQuizAttemptsQuery(lessonId: string) {
  return useQuery({
    queryKey: lessonQuizAttemptsQueryKey(lessonId),
    queryFn: () => quizApi.listLessonQuizAttempts(lessonId),
    enabled: Boolean(lessonId),
  });
}

export function useSubmitLessonQuizMutation(lessonId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (answers: Array<number | null>) =>
      quizApi.submitLessonQuiz(lessonId, answers),
    onSuccess: async (result) => {
      applyPointsDeltaToSession(result.pointsDelta);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: lessonQuizAttemptsQueryKey(lessonId),
        }),
        invalidateLearnerProgressCaches(queryClient),
      ]);
      toast({
        variant: 'success',
        title: 'Quiz submitted',
        description:
          result.pointsDelta > 0
            ? `+${result.pointsDelta} points earned`
            : 'No new points this attempt',
      });
    },
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Could not submit quiz',
        description: error instanceof Error ? error.message : 'Try again.',
      });
    },
  });
}

export function useFinalExamQuery(courseId: string) {
  return useQuery({
    queryKey: finalExamQueryKey(courseId),
    queryFn: () => quizApi.getFinalExam(courseId),
    enabled: Boolean(courseId),
  });
}

export function useFinalExamSubmissionQuery(courseId: string) {
  return useQuery({
    queryKey: finalExamSubmissionQueryKey(courseId),
    queryFn: () => quizApi.getFinalExamSubmission(courseId),
    enabled: Boolean(courseId),
    refetchInterval: (query) =>
      query.state.data?.submission?.status === 'submitted' ? 30_000 : false,
    refetchIntervalInBackground: false,
  });
}

export function useCourseDetailForExamQuery(courseId: string) {
  return useQuery({
    queryKey: courseDetailForExamQueryKey(courseId),
    queryFn: () => getCourseDetail(courseId),
    enabled: Boolean(courseId),
  });
}

export function useSubmitFinalExamMutation(courseId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (input: SubmitFinalExamInput) =>
      quizApi.submitFinalExam(courseId, input),
    onSuccess: async (result) => {
      if (result.pointsAwarded > 0) {
        applyPointsDeltaToSession(result.pointsAwarded);
      }
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: finalExamSubmissionQueryKey(courseId),
        }),
        queryClient.invalidateQueries({ queryKey: finalExamQueryKey(courseId) }),
        queryClient.invalidateQueries({
          queryKey: courseDetailForExamQueryKey(courseId),
        }),
        queryClient.invalidateQueries({ queryKey: ['course-detail', courseId] }),
        invalidateLearnerProgressCaches(queryClient),
      ]);
      toast({
        variant: 'success',
        title: 'Exam submitted',
        description: 'Your tutor will review your work and award marks.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Could not submit exam',
        description: error instanceof Error ? error.message : 'Try again.',
      });
    },
  });
}
