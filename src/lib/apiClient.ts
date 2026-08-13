import { useAuthStore } from '../store/auth';

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.message = message;
    this.status = status;
    this.details = details;
  }
}

let refreshPromise: Promise<string | null> | null = null;

function normalizePath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/api${normalized}`;
}

async function parseError(response: Response): Promise<ApiError> {
  let code = 'INTERNAL_ERROR';
  let message = response.statusText || 'Request failed';
  let details: unknown;

  try {
    const body = (await response.json()) as {
      error?: { code?: string; message?: string; details?: unknown };
    };
    if (body.error) {
      code = body.error.code ?? code;
      message = body.error.message ?? message;
      details = body.error.details;
    }
  } catch {
    // Non-JSON error body — keep defaults
  }

  return new ApiError(code, message, response.status, details);
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          return null;
        }

        const body = (await response.json()) as { accessToken?: string };
        if (!body.accessToken) {
          return null;
        }

        useAuthStore.getState().setAccessToken(body.accessToken);
        return body.accessToken;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

function hardLogoutToLogin(): void {
  useAuthStore.getState().clearSession();
  const next = `${window.location.pathname}${window.location.search}`;
  const search =
    next && next !== '/login' ? `?from=${encodeURIComponent(next)}` : '';
  window.location.assign(`/login${search}`);
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = normalizePath(path);
  const isRefreshCall = path === '/auth/refresh' || path === 'auth/refresh';

  const execute = async (token: string | null): Promise<Response> => {
    const headers = new Headers(init?.headers);
    if (init?.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(url, {
      ...init,
      credentials: 'include',
      headers,
    });
  };

  let response = await execute(useAuthStore.getState().accessToken);

  if (
    !isRefreshCall &&
    response.status === 401
  ) {
    const failed = await parseError(response.clone());
    if (failed.code === 'TOKEN_EXPIRED') {
      const nextToken = await refreshAccessToken();
      if (!nextToken) {
        hardLogoutToLogin();
        throw failed;
      }
      response = await execute(nextToken);
    }
  }

  if (!response.ok) {
    const error = await parseError(response);
    // PASSWORD_CHANGE_REQUIRED is a redirect condition (403), not an auth failure.
    // Never logout or refresh on it — only TOKEN_EXPIRED (401) may rotate/clear session.
    if (!isRefreshCall && error.status === 401 && error.code === 'TOKEN_EXPIRED') {
      hardLogoutToLogin();
    }
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export { refreshAccessToken };
