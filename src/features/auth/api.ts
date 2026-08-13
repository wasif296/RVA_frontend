import { apiFetch } from '../../lib/apiClient';
import type {
  ChangePasswordInput,
  LoginInput,
  LoginResponse,
  MeResponse,
  RefreshResponse,
} from './types';

export function login(input: LoginInput): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function refreshSession(): Promise<RefreshResponse> {
  return apiFetch<RefreshResponse>('/auth/refresh', {
    method: 'POST',
  });
}

export function logout(): Promise<void> {
  return apiFetch<void>('/auth/logout', {
    method: 'POST',
  });
}

export function getMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>('/auth/me');
}

export function changePassword(input: ChangePasswordInput): Promise<void> {
  return apiFetch<void>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
