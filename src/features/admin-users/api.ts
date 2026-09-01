import { apiFetch } from '../../lib/apiClient';
import type {
  CreateUserInput,
  ListUsersParams,
  UpdateUserInput,
  UserEmailActionResponse,
  UsersPage,
} from './types';

export function listUsers(params: ListUsersParams): Promise<UsersPage> {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.search) search.set('search', params.search);
  if (params.role) search.set('role', params.role);
  if (params.isActive) search.set('isActive', params.isActive);

  const query = search.toString();
  return apiFetch<UsersPage>(`/users${query ? `?${query}` : ''}`);
}

export function createUser(input: CreateUserInput): Promise<UserEmailActionResponse> {
  return apiFetch<UserEmailActionResponse>('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<{ user: UserEmailActionResponse['user'] }> {
  return apiFetch(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function resetUserPassword(id: string): Promise<UserEmailActionResponse> {
  return apiFetch<UserEmailActionResponse>(`/users/${id}/reset-password`, {
    method: 'POST',
  });
}

export function resendInvite(id: string): Promise<UserEmailActionResponse> {
  return apiFetch<UserEmailActionResponse>(`/users/${id}/resend-invite`, {
    method: 'POST',
  });
}
