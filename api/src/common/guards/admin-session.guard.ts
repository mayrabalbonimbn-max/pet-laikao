import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";

import { AuthService, type AdminIdentity } from "../../modules/auth/auth.service";

export type RequestWithAdmin = Request & { admin?: AdminIdentity };

@Injectable()
export class AdminSessionGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAdmin>();
    const cookieName = this.config.get<string>("ADMIN_SESSION_COOKIE", "laikao_admin_session");
    const token = (request.cookies as Record<string, string> | undefined)?.[cookieName];

    const admin = await this.authService.getSessionUser(token);
    if (!admin) {
      throw new UnauthorizedException("Nao autenticado.");
    }

    request.admin = admin;
    return true;
  }
}
