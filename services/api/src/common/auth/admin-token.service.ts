import { Injectable } from '@nestjs/common';
import { AdminAuthUser, type AdminRole } from '../types/admin-auth-user.type';

interface AdminTokenPayload {
  adminUserId: string;
  username: string;
  displayName: string;
  role: AdminRole;
  tokenType: 'access' | 'refresh';
}

@Injectable()
export class AdminTokenService {
  private readonly prefix = 'mock.admin.';

  createToken(
    adminUserId: string,
    username: string,
    displayName: string,
    role: AdminRole,
    tokenType: 'access' | 'refresh',
  ): string {
    const payload: AdminTokenPayload = {
      adminUserId,
      username,
      displayName,
      role,
      tokenType,
    };
    return `${this.prefix}${Buffer.from(JSON.stringify(payload)).toString('base64url')}`;
  }

  parseToken(token: string): AdminAuthUser | null {
    if (!token.startsWith(this.prefix)) {
      return null;
    }

    const encodedPayload = token.slice(this.prefix.length);
    try {
      const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      ) as Partial<AdminTokenPayload>;

      if (
        typeof payload.adminUserId !== 'string' ||
        typeof payload.username !== 'string' ||
        typeof payload.displayName !== 'string' ||
        (payload.role !== 'super_admin' && payload.role !== 'admin') ||
        (payload.tokenType !== 'access' && payload.tokenType !== 'refresh')
      ) {
        return null;
      }

      return {
        adminUserId: payload.adminUserId,
        username: payload.username,
        displayName: payload.displayName,
        role: payload.role,
        tokenType: payload.tokenType,
      };
    } catch {
      return null;
    }
  }
}
