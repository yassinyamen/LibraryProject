export type UserRole = 'User' | 'Admin';

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}
