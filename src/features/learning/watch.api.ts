import { apiFetch } from '../../lib/apiClient';
import type { LearningProgress } from './learning.api';

export type WatchHeartbeatResult = {
  progress: LearningProgress;
  completed: boolean;
  pointsAwarded: number;
};

export function postHeartbeat(
  lessonId: string,
  body: { deltaSec: number; playerPositionSec: number },
): Promise<WatchHeartbeatResult> {
  return apiFetch<WatchHeartbeatResult>(`/lessons/${lessonId}/heartbeat`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function completeVideo(lessonId: string): Promise<WatchHeartbeatResult> {
  return apiFetch<WatchHeartbeatResult>(`/lessons/${lessonId}/complete-video`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
