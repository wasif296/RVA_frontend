import type { Paginated, Role } from '@shared';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  mustChangePassword: boolean;
  totalPoints: number;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role | '';
  isActive?: '' | 'true' | 'false';
};

export type CreateUserInput = {
  name: string;
  email: string;
  role: Role;
};

export type UpdateUserInput = {
  name?: string;
  isActive?: boolean;
};

export type CreateUserResponse = {
  user: AdminUser;
  temporaryPassword: string;
};

export type ResetPasswordResponse = {
  user: AdminUser;
  temporaryPassword: string;
};

export type UsersPage = Paginated<AdminUser>;
