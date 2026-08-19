import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.rol.findMany({
      where: { estatus: true },
      orderBy: { nombre: 'asc' },
      include: {
        privilegios: { include: { privilege: true } },
      },
    });
  }
}
