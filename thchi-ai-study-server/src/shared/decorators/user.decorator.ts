import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenPayload } from '../interfaces/IUser';

export const User = createParamDecorator(
  (field: keyof AccessTokenPayload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return field ? request.user[field] : request.user;
  },
);
