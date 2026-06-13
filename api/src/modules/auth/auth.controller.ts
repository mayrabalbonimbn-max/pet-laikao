import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request, Response } from "express";

import { CurrentAdmin } from "../../common/decorators/current-admin.decorator";
import { AdminSessionGuard } from "../../common/guards/admin-session.guard";
import { AuthService, type AdminIdentity } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService
  ) {}

  private get cookieName() {
    return this.config.get<string>("ADMIN_SESSION_COOKIE", "laikao_admin_session");
  }

  private get cookieSecure() {
    return this.config.get<boolean>("COOKIE_SECURE", false);
  }

  @Post("login")
  @HttpCode(200)
  async login(@Body() body: LoginDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.authenticate(body.email, body.password);
    if (!result.ok) {
      throw new UnauthorizedException(
        result.reason === "temporarily_locked" ? "Acesso temporariamente bloqueado." : "Credenciais invalidas."
      );
    }

    const { token, expiresAt } = await this.authService.createSession(result.user.id, {
      ipAddress: request.headers["x-forwarded-for"]?.toString(),
      userAgent: request.headers["user-agent"]
    });

    response.cookie(this.cookieName, token, {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: "lax",
      path: "/",
      expires: expiresAt
    });

    return { user: result.user };
  }

  @Post("logout")
  @HttpCode(200)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const token = (request.cookies as Record<string, string> | undefined)?.[this.cookieName];
    if (token) {
      await this.authService.revokeSession(token);
    }
    response.clearCookie(this.cookieName, { path: "/" });
    return { ok: true };
  }

  @Get("me")
  @UseGuards(AdminSessionGuard)
  me(@CurrentAdmin() admin: AdminIdentity) {
    return { user: admin };
  }
}
