import { apiFetch } from '../../lib/apiClient';

export type Badge = {
  id: string;
  courseId: string;
  courseTitle: string;
  examSubmissionId: string;
  marksAwarded: number;
  maxMarks: number;
  earnedAt: string;
};

export function listMyBadges(): Promise<{ badges: Badge[] }> {
  return apiFetch<{ badges: Badge[] }>('/badges');
}
