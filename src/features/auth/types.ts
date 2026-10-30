import type { Role } from '@shared';
import type { Badge } from '../badges/badges.api';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  mustChangePassword: boolean;
  totalPoints: number;
  badges: Badge[];
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  user: AuthUser;
  accessToken: string;
};

export type MeResponse = {
  user: AuthUser;
};

export type RefreshResponse = {
  accessToken: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type InviteInfo = {
  name: string;
  email: string;
};

export type AcceptInviteInput = {
  password: string;
};
