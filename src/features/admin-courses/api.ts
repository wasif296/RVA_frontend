import { ApiError, apiFetch, apiUrl, refreshAccessToken } from '../../lib/apiClient';
import { useAuthStore } from '../../store/auth';
import type {
  AdminCourse,
  CreateCourseInput,
  CoursesPage,
  ListCoursesParams,
  UpdateCourseInput,
} from './types';

export function listCourses(params: ListCoursesParams): Promise<CoursesPage> {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.search) search.set('search', params.search);
  if (params.category) search.set('category', params.category);
  if (params.level) search.set('level', params.level);
  if (params.status) search.set('status', params.status);

  const query = search.toString();
  return apiFetch<CoursesPage>(`/courses${query ? `?${query}` : ''}`);
}

export function getCourse(id: string): Promise<{ course: AdminCourse }> {
  return apiFetch<{ course: AdminCourse }>(`/courses/${id}`);
}

export function createCourse(input: CreateCourseInput): Promise<{ course: AdminCourse }> {
  return apiFetch<{ course: AdminCourse }>('/courses', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateCourse(
  id: string,
  input: UpdateCourseInput,
): Promise<{ course: AdminCourse }> {
  return apiFetch<{ course: AdminCourse }>(`/courses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteCourse(
  id: string,
): Promise<void | { course: AdminCourse; message: string }> {
  return apiFetch(`/courses/${id}`, {
    method: 'DELETE',
  });
}

type UploadThumbnailOptions = {
  onProgress?: (percent: number) => void;
};

/**
 * Multipart upload — must not set Content-Type (browser sets the boundary).
 * Uses XHR for upload progress; mirrors apiFetch auth/refresh behaviour.
 */
export function uploadCourseThumbnail(
  file: File,
  options: UploadThumbnailOptions = {},
): Promise<{ url: string; publicId: string | null }> {
  const send = (
    token: string | null,
    allowRefresh: boolean,
  ): Promise<{ url: string; publicId: string | null }> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', apiUrl('/uploads/thumbnail'));
      xhr.withCredentials = true;
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable || !options.onProgress) return;
        options.onProgress(Math.round((event.loaded / event.total) * 100));
      };

      xhr.onload = async () => {
        let body: {
          url?: string;
          publicId?: string | null;
          error?: { code?: string; message?: string; details?: unknown };
        } = {};
        try {
          body = JSON.parse(xhr.responseText) as typeof body;
        } catch {
          // keep empty
        }

        if (xhr.status === 401 && body.error?.code === 'TOKEN_EXPIRED' && allowRefresh) {
          const next = await refreshAccessToken();
          if (!next) {
            reject(
              new ApiError(
                body.error?.code ?? 'TOKEN_EXPIRED',
                body.error?.message ?? 'Session expired',
                xhr.status,
                body.error?.details,
              ),
            );
            return;
          }
          try {
            resolve(await send(next, false));
          } catch (error) {
            reject(error);
          }
          return;
        }

        if (xhr.status < 200 || xhr.status >= 300) {
          reject(
            new ApiError(
              body.error?.code ?? 'INTERNAL_ERROR',
              body.error?.message ?? (xhr.statusText || 'Upload failed'),
              xhr.status,
              body.error?.details,
            ),
          );
          return;
        }

        if (!body.url) {
          reject(new ApiError('INTERNAL_ERROR', 'Upload response missing url', xhr.status));
          return;
        }

        options.onProgress?.(100);
        resolve({ url: body.url, publicId: body.publicId ?? null });
      };

      xhr.onerror = () => {
        reject(new ApiError('NETWORK_ERROR', 'Network error during upload', 0));
      };

      const form = new FormData();
      form.append('file', file);
      xhr.send(form);
    });

  return send(useAuthStore.getState().accessToken, true);
}
