import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AdminAuthenticatedRequest } from '../types/admin-authenticated-request.type';

export const CurrentAdminUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<AdminAuthenticatedRequest>();
    return request.adminUser;
  },
);
