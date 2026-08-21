import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AccessTokenClaims } from '../usuarios/types/auth-user.entity';
import type { ReportRequestContext } from './report-activity.publisher';

function getRequestContext(request: Request): ReportRequestContext {
  const forwardedFor = request.headers['x-forwarded-for'];
  const requestId = request.headers['x-request-id'];

  return {
    ip:
      (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0])?.trim() ??
      request.ip,
    userAgent: request.headers['user-agent'],
    metodo: request.method,
    ruta: request.originalUrl,
    requestId: Array.isArray(requestId) ? requestId[0] : requestId,
  };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() request: Request) {
    return this.auth.register(dto, getRequestContext(request));
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.auth.login(dto, getRequestContext(request));
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshTokenDto, @Req() request: Request) {
    return this.auth.refresh(dto.refreshToken, getRequestContext(request));
  }

  @Post('logout')
  @HttpCode(200)
  logout(
    @Body() dto: Partial<RefreshTokenDto>,
    @Req() request: Request,
    @Headers('authorization') authorization?: string,
  ) {
    const accessToken = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : undefined;
    return this.auth.logout(dto.refreshToken, accessToken, getRequestContext(request));
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() claims: AccessTokenClaims) {
    return this.auth.me(claims);
  }

  @Get('introspect')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  introspect(@CurrentUser() claims: AccessTokenClaims) {
    return claims;
  }

  @Get('jwks.json')
  jwks() {
    return this.auth.jwks();
  }
}
