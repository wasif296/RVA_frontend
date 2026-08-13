import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import * as authApi from './api';
import type { AuthUser, ChangePasswordInput, LoginInput } from './types';

export function postLoginRedirect(user: AuthUser): string {
  if (user.mustChangePassword) return '/change-password';
  if (user.role === 'super_admin') return '/admin';
  return '/';
}

export function useLogin() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
      const params = new URLSearchParams(window.location.search);
      const from = params.get('from');
      if (data.user.mustChangePassword) {
        navigate('/change-password', { replace: true });
        return;
      }
      if (from && from.startsWith('/') && !from.startsWith('//')) {
        navigate(from, { replace: true });
        return;
      }
      navigate(postLoginRedirect(data.user), { replace: true });
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      clearSession();
      await queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
}

export function useChangePassword() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: (input: ChangePasswordInput) => authApi.changePassword(input),
    onSuccess: () => {
      clearSession();
      navigate('/login', { replace: true });
    },
  });
}
