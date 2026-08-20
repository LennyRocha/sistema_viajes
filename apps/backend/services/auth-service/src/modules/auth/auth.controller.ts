import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AccessTokenClaims } from '../usuarios/types/auth-user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Body() dto: Partial<RefreshTokenDto>, @Headers('authorization') authorization?: string) {
    const accessToken = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : undefined;
    return this.auth.logout(dto.refreshToken, accessToken);
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
