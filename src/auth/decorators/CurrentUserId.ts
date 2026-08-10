import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../guards/AuthGuard';

export const CurrentUserId = createParamDecorator(
  (_: unknown, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.authGuard.userId;
  },
);
