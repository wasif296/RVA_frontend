import type { Paginated, Role } from '@shared';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  /** 'pending' until the user accepts their invite and sets a password. */
  status: 'pending' | 'active';
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

export type UserEmailActionResponse = {
  user: AdminUser;
  emailSent: boolean;
  emailError?: string;
};

export type UsersPage = Paginated<AdminUser>;
