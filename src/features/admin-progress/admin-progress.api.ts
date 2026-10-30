import { apiFetch } from '../../lib/apiClient';
import type { LearnerProgressDetail } from '../progress/progress.api';

export type AdminProgressRow = {
  userId: string;
  name: string;
  email: string;
  isActive: boolean;
  coursesStarted: number;
  coursesCompleted: number;
  lessonsCompleted: number;
  totalPoints: number;
  lastActivityAt: string | null;
};

export type AdminProgressListParams = {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: string;
  sort?: 'totalPoints' | '-totalPoints' | 'lastActivityAt' | '-lastActivityAt';
};

export type AdminProgressPage = {
  data: AdminProgressRow[];
  meta: { page: number; limit: number; total: number };
};

export function listAdminProgress(
  params: AdminProgressListParams,
): Promise<AdminProgressPage> {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.search) search.set('search', params.search);
  if (params.courseId) search.set('courseId', params.courseId);
  if (params.sort) search.set('sort', params.sort);
  const query = search.toString();
  return apiFetch<AdminProgressPage>(`/admin/progress${query ? `?${query}` : ''}`);
}

export function getAdminUserProgress(userId: string): Promise<LearnerProgressDetail> {
  return apiFetch<LearnerProgressDetail>(`/admin/progress/${userId}`);
}
