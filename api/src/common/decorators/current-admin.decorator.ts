import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import type { RequestWithAdmin } from "../guards/admin-session.guard";

export const CurrentAdmin = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<RequestWithAdmin>();
  return request.admin;
});
