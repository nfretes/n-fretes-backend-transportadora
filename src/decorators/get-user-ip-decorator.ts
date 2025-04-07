import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ClientIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const ip = 
      request.headers['x-forwarded-for'] || 
      request.ip || 
      request.connection?.remoteAddress;

    if (Array.isArray(ip)) {
      return ip[0];
    }

    return ip;
  },
);
