import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN_ROLES_KEY } from '../decorators/admin-roles.decorator';
import { AdminRole } from '../types/admin-auth-user.type';
import { AdminAuthenticatedRequest } from '../types/admin-authenticated-request.type';

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(
      ADMIN_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AdminAuthenticatedRequest>();
    const role = request.adminUser?.role;

    if (!role || !requiredRoles.includes(role)) {
      throw new ForbiddenException('ADMIN_ROLE_FORBIDDEN');
    }

    return true;
  }
}
