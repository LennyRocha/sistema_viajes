/**
 * Argon2: resistente a GPU/ASIC mejor que bcrypt clásico para passwords nuevos.
 * El puerto permite sustituirlo en tests sin levantar crypto real.
 */
import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PasswordHasherPort } from '../../ports/tokens.ports';

@Injectable()
export class ArgonPasswordHasher implements PasswordHasherPort {
  hash(plain: string): Promise<string> {
    return argon2.hash(plain);
  }

  verify(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }
}
