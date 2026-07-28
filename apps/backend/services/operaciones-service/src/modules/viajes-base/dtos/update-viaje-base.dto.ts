import { PartialType } from '@nestjs/swagger';
import { CreateViajeBaseDto } from './create-viaje-base.dto';

export class UpdateViajeBaseDto extends PartialType(CreateViajeBaseDto) {}
