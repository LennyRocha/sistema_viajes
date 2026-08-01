/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { Usuario } from './usuario.entity';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { CreateUsuarioDto } from './dtos/create-usuario.dto';
import { UpdateUsuarioDto } from './dtos/update-usuario.dto';
import { ArgonPasswordHasher } from 'src/infra/crypto/argon-password.hasher';
import { Prisma } from 'generated/prisma/edge';

const LIST_CACHE_KEY = 'usuarios:list';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly hasher: ArgonPasswordHasher,
    @InjectPinoLogger(UsuariosService.name)
    private readonly logger: PinoLogger,
  ) { }

  async create(dto: CreateUsuarioDto) {
    this.logger.info(
      {
        nombre: dto.nombres,
        correo: dto.email,
      },
      'Creando usuario',
    );

    const user = await this.prisma.usuario.create({
      data: {
        ...dto,
        contra: await this.hasher.hash(dto.contra),
      },
    });

    try {
      await this.redis.del(LIST_CACHE_KEY);
      this.logger.debug({ key: LIST_CACHE_KEY }, 'Caché eliminado');
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al limpiar caché',
      );
    }

    this.logger.info(
      {
        userId: user.id,
      },
      'Usuario creada',
    );
    return user;
  }

  async findAll(active: boolean) {
    this.logger.debug('Obteniendo todos los usuarios');

    // 1) ¿está en caché?
    try {
      const cached = await this.redis.get<Usuario[]>(LIST_CACHE_KEY);
      if (cached) {
        this.logger.debug(
          {
            key: LIST_CACHE_KEY,
            source: 'caché',
            count: cached.length,
          },
          'Usuarios obtenidos desde caché',
        );
        return active ? cached.filter((i) => i.estatus) : cached;
      }
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al obtener usuarios desde caché',
      );
    }

    const where: Prisma.UsuarioWhereInput = active
      ? {
        estatus: true,
      }
      : {};

    // 2) no está → base de datos
    const users = await this.prisma.usuario.findMany({
      orderBy: { createdAt: 'desc' },
      where,
      omit: {
        contra: false,
      },
      include: {
        refreshTokens: false,
        passwordResetCodes: false,
      },
    });

    // 3) guarda para la próxima (1 hora = 3600 segundos)
    try {
      await this.redis.set(LIST_CACHE_KEY, users, 60 * 60); // 1 hora
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al guardar usuarios en caché',
      );
    }

    this.logger.debug(
      {
        source: 'database',
        count: users.length,
      },
      'Usuarios  obtenidos desde base de datos y guardadas en caché',
    );
    return users;
  }

  async findOne(id: number) {
    this.logger.debug({ id }, 'Obteniendo usuario por ID');

    const user = await this.prisma.usuario.findUnique({
      where: { id },
      omit: {
        contra: false,
      },
      include: {
        refreshTokens: false,
        passwordResetCodes: false,
      },
    });

    if (!user) {
      this.logger.warn(
        {
          id,
        },
        'Usuario no encontrado',
      );
      throw new NotFoundException(`Usuario ${id} no existe`);
    }

    this.logger.info(
      {
        id,
        nombre: user.nombres,
      },
      'Usuario encontrado',
    );

    const { contra, ...userRest } = user;
    return userRest;
  }

  async findOneByEmail(email: string, includeSensitive = false) {
    this.logger.debug({ email }, 'Obteniendo usuario por correo electrónico');

    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        refreshTokens: includeSensitive,
        passwordResetCodes: includeSensitive,
      },
      omit: {
        contra: includeSensitive,
      },
    });

    if (!user) {
      this.logger.warn(
        {
          email,
        },
        'Usuario no encontrado',
      );
      throw new NotFoundException(`Usuario ${email} no existe`);
    }

    this.logger.info(
      {
        email: user.email,
        nombre: user.nombres,
      },
      'Usuario encontrado',
    );
    return user;
  }

  async findOneByCurp(curp: string) {
    this.logger.debug({ curp }, 'Obteniendo usuario por CURP');

    const user = await this.prisma.usuario.findUnique({
      where: { curp },
      include: {
        refreshTokens: false,
        passwordResetCodes: false,
      },
      omit: {
        contra: false,
      },
    });

    if (!user) {
      this.logger.warn(
        {
          curp,
        },
        'Usuario no encontrado',
      );
      throw new NotFoundException(`Usuario ${curp} no existe`);
    }

    this.logger.info(
      {
        curp: user.curp,
        nombre: user.nombres,
      },
      'Usuario encontrado',
    );
    return user;
  }

  async findOneByTelefono(telefono: string) {
    this.logger.debug({ telefono }, 'Obteniendo usuario por teléfono');

    const user = await this.prisma.usuario.findUnique({
      where: { telefono },
      include: {
        refreshTokens: false,
        passwordResetCodes: false,
      },
      omit: {
        contra: false,
      },
    });

    if (!user) {
      this.logger.warn(
        {
          telefono,
        },
        'Usuario no encontrado',
      );
      throw new NotFoundException(`Usuario ${telefono} no existe`);
    }

    this.logger.info(
      {
        telefono: user.telefono,
        nombre: user.nombres,
      },
      'Usuario encontrado',
    );
    return user;
  }

  async checkEmailExists(email: string) {
    this.logger.debug(
      { email },
      'Verificando existencia de usuario por correo electrónico',
    );
    const user = await this.prisma.usuario.findUnique({
      where: { email },
    });
    return !!user;
  }

  async checkCurpExists(curp: string) {
    this.logger.debug({ curp }, 'Verificando existencia de usuario por CURP');
    const user = await this.prisma.usuario.findUnique({
      where: { curp },
    });
    return !!user;
  }

  async checkTelefonoExists(telefono: string) {
    this.logger.debug(
      { telefono },
      'Verificando existencia de usuario por teléfono',
    );
    const user = await this.prisma.usuario.findUnique({
      where: { telefono },
    });
    return !!user;
  }

  async login(email: string, password: string) {
    this.logger.debug({ email }, 'Intentando iniciar sesión');
    const user = await this.findOneByEmail(email, true); // Incluye campos sensibles para la verificación de contraseña
    const isMatch = await this.hasher.verify(password, user.contra);
    if (!isMatch) {
      this.logger.warn({ email }, 'Contraseña incorrecta');
      throw new NotFoundException('Credenciales inválidas');
    }
    return user;
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    this.logger.info(
      {
        id,
        nombre: dto.nombres,
      },
      'Actualizando usuario',
    );

    await this.findOne(id); // 404 si no existe

    const user = await this.prisma.usuario.update({
      where: { id },
      data: {
        ...dto,
      },
    });

    this.logger.info(
      {
        id: user.id,
        nombre: user.nombres,
      },
      'Usuario actualizado',
    );

    try {
      await this.redis.del(LIST_CACHE_KEY);
      this.logger.debug({ key: LIST_CACHE_KEY }, 'Caché eliminado');
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al eliminar caché',
      );
    }

    return user;
  }

  async updatePassword(id: number, newPassword: string) {
    this.logger.info(
      {
        id,
      },
      'Actualizando contraseña de usuario',
    );

    await this.findOne(id); // 404 si no existe

    const hashedPassword = await this.hasher.hash(newPassword);

    await this.prisma.usuario.update({
      where: { id },
      data: { contra: hashedPassword },
    });

    this.logger.info(
      {
        id,
      },
      'Contraseña de usuario actualizada',
    );

    try {
      await this.redis.del(LIST_CACHE_KEY);
      this.logger.debug({ key: LIST_CACHE_KEY }, 'Caché eliminado');
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al eliminar caché',
      );
    }

    return { updated: true };
  }

  async shutdown(id: number) {
    this.logger.debug({ id }, 'Cambiando estado de usuario');

    const existing = await this.findOne(id); // 404 si no existe

    await this.prisma.usuario.update({
      where: { id },
      data: { estatus: !existing.estatus },
    });
    this.logger.info(
      { id, newStatus: !existing.estatus },
      'Estado de usuario cambiado',
    );

    try {
      await this.redis.del(LIST_CACHE_KEY);
      this.logger.debug({ key: LIST_CACHE_KEY }, 'Caché eliminado');
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al eliminar caché',
      );
    }

    return { updated: true };
  }

  async remove(id: number) {
    this.logger.debug({ id }, 'Eliminando usuario');

    await this.findOne(id); // 404 si no existe

    await this.prisma.usuario.delete({ where: { id } });
    this.logger.info({ id }, 'Usuario eliminado permanentemente');

    try {
      await this.redis.del(LIST_CACHE_KEY);
      this.logger.debug({ key: LIST_CACHE_KEY }, 'Caché eliminado');
    } catch (error) {
      this.logger.error(
        {
          key: LIST_CACHE_KEY,
          err: error,
        },
        'Error al eliminar caché',
      );
    }

    return { deleted: true };
  }
}
