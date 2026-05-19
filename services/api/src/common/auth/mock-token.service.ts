import { Injectable } from '@nestjs/common';
import { AuthUser } from '../types/auth-user.type';

interface MockTokenPayload {
  userId: string;
  tokenType: 'access' | 'refresh';
}

@Injectable()
export class MockTokenService {
  private readonly prefix = 'mock.';

  createToken(userId: string, tokenType: 'access' | 'refresh'): string {
    const payload: MockTokenPayload = { userId, tokenType };
    return `${this.prefix}${Buffer.from(JSON.stringify(payload)).toString('base64url')}`;
  }

  parseToken(token: string): AuthUser | null {
    if (!token.startsWith(this.prefix)) {
      return null;
    }

    const encodedPayload = token.slice(this.prefix.length);
    try {
      const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      ) as Partial<MockTokenPayload>;

      if (
        typeof payload.userId !== 'string' ||
        (payload.tokenType !== 'access' && payload.tokenType !== 'refresh')
      ) {
        return null;
      }

      return {
        userId: payload.userId,
        tokenType: payload.tokenType,
      };
    } catch {
      return null;
    }
  }
}
