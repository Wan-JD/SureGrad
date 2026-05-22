import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminTokenService } from './admin-token.service';
import { AdminAuthenticatedRequest } from '../types/admin-authenticated-request.type';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly adminTokenService: AdminTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<AdminAuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    const adminUser = this.adminTokenService.parseToken(token);
    if (!adminUser || adminUser.tokenType !== 'access') {
      throw new UnauthorizedException('Invalid admin access token');
    }

    request.adminUser = adminUser;
    return true;
  }
}
