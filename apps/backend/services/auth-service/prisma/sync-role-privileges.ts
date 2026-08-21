import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { privilegiosSeeds } from '../seeds/privilegiosSeed';
import { rolesSeeds } from '../seeds/rolesSeed';
import { rolePrivilegesSeed } from '../seeds/rolePrivilegesSeed';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const role of rolesSeeds) {
    await prisma.rol.upsert({
      where: { nombre: role.nombre },
      update: { descripcion: role.descripcion, estatus: true },
      create: role,
    });
  }

  for (const privilege of privilegiosSeeds) {
    await prisma.privilegio.upsert({
      where: { nombre: privilege.nombre },
      update: { descripcion: privilege.descripcion, estatus: true },
      create: privilege,
    });
  }

  const roles = await prisma.rol.findMany({ select: { id: true, nombre: true } });
  const privileges = await prisma.privilegio.findMany({ select: { id: true, nombre: true } });
  const privilegeIds = new Map(privileges.map((item) => [item.nombre, item.id]));

  const links = roles.flatMap((role) => {
    const names = rolePrivilegesSeed[role.nombre] ?? [];
    const selected = names.includes('*') ? privileges.map((item) => item.nombre) : names;
    return selected.flatMap((name) => {
      const privilegeId = privilegeIds.get(name);
      return privilegeId ? [{ roleId: role.id, privilegeId }] : [];
    });
  });

  await prisma.$transaction([
    prisma.rolePrivilege.deleteMany(),
    prisma.rolePrivilege.createMany({ data: links, skipDuplicates: true }),
  ]);

  const clientRole = roles.find((role) => role.nombre === 'ROLE_CLIENTE');
  const usersWithoutRole = await prisma.usuario.findMany({
    where: { roles: { none: {} } },
    select: { id: true },
  });
  if (clientRole && usersWithoutRole.length > 0) {
    await prisma.userRole.createMany({
      data: usersWithoutRole.map((user) => ({
        userId: user.id,
        roleId: clientRole.id,
      })),
      skipDuplicates: true,
    });
  }

  const [roleSummary, users, userRoles, remainingUsersWithoutRole] = await Promise.all([
    prisma.rol.findMany({
      where: { nombre: { in: Object.keys(rolePrivilegesSeed) } },
      select: {
        nombre: true,
        _count: { select: { privilegios: true, usuarios: true } },
      },
      orderBy: { nombre: 'asc' },
    }),
    prisma.usuario.count(),
    prisma.userRole.count(),
    prisma.usuario.count({ where: { roles: { none: {} } } }),
  ]);

  console.log(`Permisos sincronizados: ${links.length} relaciones, usuarios conservados.`);
  console.log(
    `Usuarios sin rol reparados con ROLE_CLIENTE: ${usersWithoutRole.length}.`,
  );
  for (const role of roleSummary) {
    console.log(
      `${role.nombre}: ${role._count.privilegios} privilegios, ${role._count.usuarios} usuarios.`,
    );
  }
  console.log(
    `Usuarios: ${users}; asignaciones de rol: ${userRoles}; sin rol: ${remainingUsersWithoutRole}.`,
  );
}

main()
  .catch((error) => {
    console.error('No se pudieron sincronizar los permisos:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
