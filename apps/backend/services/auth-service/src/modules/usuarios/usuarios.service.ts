/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { CreateUsuarioDto } from './dtos/create-usuario.dto';
import { UpdateUsuarioDto } from './dtos/update-usuario.dto';
import { ArgonPasswordHasher } from 'src/infra/crypto/argon-password.hasher';

const LIST_CACHE_KEY = 'usuarios:list:v2:roles';

export interface UsuarioListItem {
  id: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  fecha_nacimiento: Date | string;
  telefono: string;
  email: string;
  foto_perfil: string;
  foto_base64: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  estatus: boolean;
  roles: string[];
}

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly hasher: ArgonPasswordHasher,
    @InjectPinoLogger(UsuariosService.name)
    private readonly logger: PinoLogger,
  ) { }

  async create(dto: CreateUsuarioDto, defaultRole = 'ROLE_CONDUCTOR') {
    this.logger.info(
      {
        nombre: dto.nombres,
        correo: dto.email,
      },
      'Creando usuario',
    );

    const { roleNames, ...userData } = dto;
    const requestedRoles = roleNames?.length ? roleNames : [defaultRole];
    const roles = await this.prisma.rol.findMany({
      where: { nombre: { in: requestedRoles }, estatus: true },
      select: { id: true, nombre: true },
    });
    if (roles.length !== requestedRoles.length) {
      throw new NotFoundException('Uno o mas roles no existen o estan inactivos');
    }

    const user = await this.prisma.usuario.create({
      data: {
        ...userData,
        contra: await this.hasher.hash(userData.contra),
        roles: {
          create: roles.map((role) => ({ roleId: role.id })),
        },
      },
      include: {
        roles: { include: { role: true } },
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
    return this.sanitizeUser(user);
  }

  private sanitizeUser<T extends object>(user: T) {
    const { contra: _contra, ...safeUser } = user as T & { contra?: string };
    return safeUser;
  }

  async findAll(active: boolean) {
    this.logger.debug('Obteniendo todos los usuarios');

    // 1) ¿está en caché?
    try {
      const cached = await this.redis.get<UsuarioListItem[]>(LIST_CACHE_KEY);
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

    // 2) no está → base de datos
    const usersFromDatabase = await this.prisma.usuario.findMany({
      orderBy: { createdAt: 'desc' },
      omit: { contra: true },
      include: {
        refreshTokens: false,
        passwordResetCodes: false,
        roles: {
          where: { role: { estatus: true } },
          select: { role: { select: { nombre: true } } },
        },
      },
    });

    const users: UsuarioListItem[] = usersFromDatabase.map(
      ({ roles, ...user }) => ({
        ...user,
        roles: roles
          .map(({ role }) => role.nombre)
          .sort((left, right) => left.localeCompare(right)),
      }),
    );

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
    return active ? users.filter((user) => user.estatus) : users;
  }

  async findOne(id: number) {
    this.logger.debug({ id }, 'Obteniendo usuario por ID');

    const user = await this.prisma.usuario.findUnique({
      where: { id },
      omit: { contra: true },
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

    return this.sanitizeUser(user);
  }

  async findOneByEmail(email: string, includeSensitive = false) {
    this.logger.debug({ email }, 'Obteniendo usuario por correo electrónico');

    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        refreshTokens: includeSensitive,
        passwordResetCodes: includeSensitive,
      },
      omit: { contra: !includeSensitive },
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
      omit: { contra: true },
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
    return this.sanitizeUser(user);
  }

  async findOneByTelefono(telefono: string) {
    this.logger.debug({ telefono }, 'Obteniendo usuario por teléfono');

    const user = await this.prisma.usuario.findUnique({
      where: { telefono },
      include: {
        refreshTokens: false,
        passwordResetCodes: false,
      },
      omit: { contra: true },
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
    return this.sanitizeUser(user);
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
    const isMatch = await this.hasher.verify(user.contra, password);
    if (!isMatch || !user.estatus) {
      this.logger.warn({ email }, 'Contraseña incorrecta');
      throw new NotFoundException('Credenciales inválidas');
    }
    return user;
  }

  async findAuthUser(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        roles: {
          where: { role: { estatus: true } },
          include: {
            role: {
              include: {
                privilegios: {
                  where: { privilege: { estatus: true } },
                  include: { privilege: true },
                },
              },
            },
          },
        },
      },
    });
    if (!user || !user.estatus) {
      throw new NotFoundException('Usuario no encontrado o inactivo');
    }
    return user;
  }

  async getAuthView(id: number) {
    const user = await this.findAuthUser(id);
    const roles = user.roles.map(({ role }) => role.nombre);
    const privileges = [
      ...new Set(
        user.roles.flatMap(({ role }) =>
          role.privilegios.map(({ privilege }) => privilege.nombre),
        ),
      ),
    ];
    return {
      id: user.id,
      email: user.email,
      nombres: user.nombres,
      apellido_paterno: user.apellido_paterno,
      apellido_materno: user.apellido_materno,
      estatus: user.estatus,
      roles,
      privileges,
    };
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

    return this.sanitizeUser(user);
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
