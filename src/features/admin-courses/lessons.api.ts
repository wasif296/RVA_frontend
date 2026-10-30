import { apiFetch } from '../../lib/apiClient';

export type AdminLesson = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  youtubeVideoId: string;
  durationSec: number;
  requiredWatchSec: number;
  watchTargetOverridden?: boolean;
  order: number;
  isOptional: boolean;
  hasQuiz: boolean;
  createdAt: string;
  updatedAt: string;
  warning?: string;
};

export type CreateLessonInput = {
  title: string;
  description: string;
  youtubeVideoId: string;
  durationSec: number;
  /** Admin override; omit to use server 90% default. */
  requiredWatchSec?: number | null;
  isOptional?: boolean;
};

export type UpdateLessonInput = {
  title?: string;
  description?: string;
  youtubeVideoId?: string;
  durationSec?: number;
  /** Number sets override; `null` clears override back to 90%. */
  requiredWatchSec?: number | null;
  isOptional?: boolean;
};

const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

/** Client-side parse for form preview — server remains the source of truth. */
export function parseYouTubeVideoIdClient(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (YOUTUBE_ID_RE.test(trimmed)) return trimmed;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./i, '').toLowerCase();

  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0]?.split('?')[0];
    return id && YOUTUBE_ID_RE.test(id) ? id : null;
  }

  if (
    host === 'youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'music.youtube.com' ||
    host === 'youtube-nocookie.com'
  ) {
    const fromQuery = url.searchParams.get('v');
    if (fromQuery && YOUTUBE_ID_RE.test(fromQuery)) return fromQuery;

    const segments = url.pathname.split('/').filter(Boolean);
    const kind = segments[0]?.toLowerCase();
    if (kind === 'embed' || kind === 'shorts' || kind === 'v' || kind === 'live') {
      const id = segments[1]?.split('?')[0];
      return id && YOUTUBE_ID_RE.test(id) ? id : null;
    }
  }

  return null;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function listLessons(courseId: string): Promise<{ lessons: AdminLesson[] }> {
  return apiFetch(`/courses/${courseId}/lessons`);
}

export function createLesson(
  courseId: string,
  input: CreateLessonInput,
): Promise<{ lesson: AdminLesson }> {
  return apiFetch(`/courses/${courseId}/lessons`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateLesson(
  id: string,
  input: UpdateLessonInput,
): Promise<{ lesson: AdminLesson }> {
  return apiFetch(`/lessons/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteLesson(id: string): Promise<void> {
  return apiFetch(`/lessons/${id}`, { method: 'DELETE' });
}

export function reorderLessons(
  courseId: string,
  lessonIds: string[],
): Promise<{ lessons: AdminLesson[] }> {
  return apiFetch(`/courses/${courseId}/lessons/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ lessonIds }),
  });
}
