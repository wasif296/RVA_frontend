import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../design-system';
import { invalidateLearnerProgressCaches } from '../../lib/invalidateProgress';
import * as gradingApi from './grading.api';
import type {
  ExamSubmissionsListParams,
  GradeExamSubmissionInput,
} from './grading.api';

export const examSubmissionsListKey = (params: ExamSubmissionsListParams) =>
  ['admin-exam-submissions', 'list', params] as const;

export const examSubmissionDetailKey = (id: string) =>
  ['admin-exam-submissions', 'detail', id] as const;

export const ungradedExamCountKey = ['admin-exam-submissions', 'ungraded-count'] as const;

export function useExamSubmissionsQuery(params: ExamSubmissionsListParams) {
  return useQuery({
    queryKey: examSubmissionsListKey(params),
    queryFn: () => gradingApi.listExamSubmissions(params),
  });
}

export function useUngradedExamCountQuery() {
  return useQuery({
    queryKey: ungradedExamCountKey,
    queryFn: async () => {
      const result = await gradingApi.listExamSubmissions({
        status: 'submitted',
        page: 1,
        limit: 1,
      });
      return result.meta.ungradedCount;
    },
    refetchInterval: 60_000,
  });
}

export function useExamSubmissionQuery(id: string) {
  return useQuery({
    queryKey: examSubmissionDetailKey(id),
    queryFn: () => gradingApi.getExamSubmission(id),
    enabled: Boolean(id),
  });
}

export function useGradeExamSubmissionMutation(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: GradeExamSubmissionInput) =>
      gradingApi.gradeExamSubmission(id, input),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-exam-submissions'] }),
        queryClient.invalidateQueries({ queryKey: examSubmissionDetailKey(id) }),
        queryClient.invalidateQueries({ queryKey: ['badges'] }),
        invalidateLearnerProgressCaches(queryClient),
      ]);
      toast({
        variant: 'success',
        title: 'Submission graded',
        description: result.submission.passed
          ? `Pass · ${result.pointsAwarded} points awarded`
          : `Did not pass · ${result.pointsAwarded} points awarded`,
      });
    },
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Could not grade submission',
        description: error instanceof Error ? error.message : 'Try again.',
      });
    },
  });
}
