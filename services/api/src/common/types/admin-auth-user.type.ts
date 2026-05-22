export type AdminRole = 'super_admin' | 'admin';

export interface AdminAuthUser {
  adminUserId: string;
  username: string;
  displayName: string;
  role: AdminRole;
  tokenType: 'access' | 'refresh';
}
