import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthenticatedRequest } from '../types/authenticated-request.type';
import { MockTokenService } from './mock-token.service';

@Injectable()
export class OptionalMockAuthGuard implements CanActivate {
  constructor(private readonly mockTokenService: MockTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization) {
      return true;
    }

    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return true;
    }

    const authUser = this.mockTokenService.parseToken(token);
    if (authUser?.tokenType === 'access') {
      request.user = authUser;
    }

    return true;
  }
}
