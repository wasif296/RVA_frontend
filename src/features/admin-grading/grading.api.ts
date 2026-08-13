import { apiFetch } from '../../lib/apiClient';
import type { Badge } from '../badges/badges.api';

export type ExamSubmissionStatus = 'submitted' | 'graded';

export type AdminExamSubmissionListItem = {
  id: string;
  status: ExamSubmissionStatus;
  submittedAt: string;
  learner: { id: string; name: string; email: string };
  course: { id: string; title: string };
  marksAwarded: number | null;
  passed: boolean | null;
};

export type AdminExamSubmissionDetail = {
  id: string;
  status: ExamSubmissionStatus;
  submittedAt: string;
  docUrl: string;
  loomUrl: string | null;
  marksAwarded: number | null;
  maxMarks: number;
  passed: boolean | null;
  feedback: string | null;
  gradedAt: string | null;
  gradedBy: { id: string; name: string } | null;
  learner: { id: string; name: string; email: string };
  course: { id: string; title: string };
  exam: {
    id: string;
    title: string;
    instructions: string;
    questions: Array<{ id: string; text: string; order: number }>;
    maxMarks: number;
    passPct: number;
    passMark: number;
  };
};

export type ExamSubmissionsListParams = {
  status?: ExamSubmissionStatus;
  courseId?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type ExamSubmissionsListResponse = {
  data: AdminExamSubmissionListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    ungradedCount: number;
  };
};

export type GradeExamSubmissionInput = {
  marksAwarded: number;
  feedback?: string;
};

export type GradeExamSubmissionResult = {
  submission: AdminExamSubmissionDetail;
  pointsAwarded: number;
  badgeCreated: boolean;
  badge: Badge | null;
};

export function listExamSubmissions(
  params: ExamSubmissionsListParams = {},
): Promise<ExamSubmissionsListResponse> {
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  if (params.courseId) search.set('courseId', params.courseId);
  if (params.search) search.set('search', params.search);
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  return apiFetch<ExamSubmissionsListResponse>(
    `/admin/exam-submissions${query ? `?${query}` : ''}`,
  );
}

export function getExamSubmission(
  id: string,
): Promise<{ submission: AdminExamSubmissionDetail }> {
  return apiFetch<{ submission: AdminExamSubmissionDetail }>(
    `/admin/exam-submissions/${id}`,
  );
}

export function gradeExamSubmission(
  id: string,
  input: GradeExamSubmissionInput,
): Promise<GradeExamSubmissionResult> {
  return apiFetch<GradeExamSubmissionResult>(`/admin/exam-submissions/${id}/grade`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
