import { apiFetch } from '../../lib/apiClient';
import type {
  ChangePasswordInput,
  InviteInfo,
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

export function getInvite(token: string): Promise<InviteInfo> {
  return apiFetch<InviteInfo>(`/auth/invite/${encodeURIComponent(token)}`);
}

export function acceptInvite(token: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>(`/auth/invite/${encodeURIComponent(token)}/accept`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}
