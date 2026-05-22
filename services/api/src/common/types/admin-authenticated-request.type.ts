import { Request } from 'express';
import { AdminAuthUser } from './admin-auth-user.type';

export interface AdminAuthenticatedRequest extends Request {
  adminUser?: AdminAuthUser;
}
