import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrivilegiosService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.privilegio.findMany({
      where: { estatus: true },
      orderBy: { nombre: 'asc' },
    });
  }
}
