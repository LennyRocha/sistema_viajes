import { SetMetadata } from '@nestjs/common';

export const REQUIRED_PRIVILEGES = 'requiredPrivileges';
export const Privileges = (...privileges: string[]) =>
  SetMetadata(REQUIRED_PRIVILEGES, privileges);
