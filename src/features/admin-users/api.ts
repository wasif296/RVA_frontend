import { apiFetch } from '../../lib/apiClient';
import type {
  CreateUserInput,
  CreateUserResponse,
  ListUsersParams,
  ResetPasswordResponse,
  UpdateUserInput,
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

export function createUser(input: CreateUserInput): Promise<CreateUserResponse> {
  return apiFetch<CreateUserResponse>('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<{ user: CreateUserResponse['user'] }> {
  return apiFetch(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function resetUserPassword(id: string): Promise<ResetPasswordResponse> {
  return apiFetch<ResetPasswordResponse>(`/users/${id}/reset-password`, {
    method: 'POST',
  });
}
