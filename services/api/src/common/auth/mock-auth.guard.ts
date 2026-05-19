import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { MockTokenService } from './mock-token.service';
import { AuthenticatedRequest } from '../types/authenticated-request.type';

@Injectable()
export class MockAuthGuard implements CanActivate {
  constructor(private readonly mockTokenService: MockTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    const authUser = this.mockTokenService.parseToken(token);
    if (!authUser || authUser.tokenType !== 'access') {
      throw new UnauthorizedException('Invalid mock access token');
    }

    request.user = authUser;
    return true;
  }
}
