import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessToken } from '@subdomain/auth/application/dtos/access-token.dto';

export const Context = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AccessToken => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
