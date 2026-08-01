import { PartialType } from '@nestjs/swagger';
import { CreateSalidaDto } from './create-salida.dto';

export class UpdateSalidaDto extends PartialType(CreateSalidaDto) {}