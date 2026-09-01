import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../design-system';
import { ApiError } from '../../lib/apiClient';
import * as usersApi from './api';
import type { CreateUserInput, ListUsersParams, UpdateUserInput } from './types';

export const usersQueryKey = ['admin-users'] as const;

export function useUsersQuery(params: ListUsersParams) {
  return useQuery({
    queryKey: [...usersQueryKey, params],
    queryFn: () => usersApi.listUsers(params),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: CreateUserInput) => usersApi.createUser(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Could not create user',
        description: error instanceof ApiError ? error.message : 'Something went wrong',
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      usersApi.updateUser(id, input),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey });
      toast({
        variant: 'success',
        title: variables.input.isActive === false ? 'User deactivated' : 'User updated',
      });
    },
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Could not update user',
        description: error instanceof ApiError ? error.message : 'Something went wrong',
      });
    },
  });
}

function emailResultDescription(emailError?: string): string | undefined {
  return emailError || undefined;
}

export function useResendInvite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => usersApi.resendInvite(id),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey });
      if (result.emailSent) {
        toast({
          variant: 'success',
          title: 'Invite sent',
          description: `A new invite was emailed to ${result.user.email}.`,
        });
      } else {
        toast({
          variant: 'warning',
          title: 'Invite was not sent',
          description:
            emailResultDescription(result.emailError) ??
            `The user exists, but we could not email ${result.user.email}. Try again shortly.`,
        });
      }
    },
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Could not resend invite',
        description: error instanceof ApiError ? error.message : 'Something went wrong',
      });
    },
  });
}

export function useResetUserPassword() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => usersApi.resetUserPassword(id),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey });
      if (result.emailSent) {
        toast({
          variant: 'success',
          title: 'Reset link sent',
          description: `A password reset link was emailed to ${result.user.email}.`,
        });
      } else {
        toast({
          variant: 'warning',
          title: 'Reset email was not sent',
          description:
            emailResultDescription(result.emailError) ??
            `We could not email ${result.user.email}. Try again shortly.`,
        });
      }
    },
    onError: (error) => {
      toast({
        variant: 'error',
        title: 'Could not reset password',
        description: error instanceof ApiError ? error.message : 'Something went wrong',
      });
    },
  });
}
