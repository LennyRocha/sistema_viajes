import { AccessTokenClaims } from '../../modules/usuarios/types/auth-user.entity';
import { Request } from 'express';

export type AuthenticatedRequest = Request & {
  user: AccessTokenClaims;
  accessToken?: string;
};
