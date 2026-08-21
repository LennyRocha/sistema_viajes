import { OmitType } from '@nestjs/swagger';
import { CreateUsuarioDto } from '../../usuarios/dtos/create-usuario.dto';

export class RegisterDto extends OmitType(CreateUsuarioDto, ['roleNames'] as const) {}
