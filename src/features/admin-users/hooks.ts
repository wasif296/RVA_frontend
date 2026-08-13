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

export function useResetUserPassword() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => usersApi.resetUserPassword(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKey });
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
