import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { privilegiosSeeds } from '../seeds/privilegiosSeed';
import { rolesSeeds } from '../seeds/rolesSeed';
import { rolePrivilegesSeed } from '../seeds/rolePrivilegesSeed';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando sincronizacion de roles y privilegios...');

  // Este seed conserva las asignaciones existentes entre usuarios y roles.
  await Promise.all(
    rolesSeeds.map((role) =>
      prisma.rol.upsert({
        where: { nombre: role.nombre },
        update: { descripcion: role.descripcion, estatus: true },
        create: role,
      }),
    ),
  );
  await Promise.all(
    privilegiosSeeds.map((privilege) =>
      prisma.privilegio.upsert({
        where: { nombre: privilege.nombre },
        update: { descripcion: privilege.descripcion, estatus: true },
        create: privilege,
      }),
    ),
  );

  const rolesDb = await prisma.rol.findMany({ select: { id: true, nombre: true } });
  const privilegesDb = await prisma.privilegio.findMany({ select: { id: true, nombre: true } });
  const privilegeIds = new Map(privilegesDb.map((item) => [item.nombre, item.id]));
  const links = rolesDb.flatMap((role) => {
    const names = rolePrivilegesSeed[role.nombre] ?? [];
    const allNames = names.includes('*') ? privilegesDb.map((item) => item.nombre) : names;
    return allNames.flatMap((name) => {
      const privilegeId = privilegeIds.get(name);
      return privilegeId ? [{ roleId: role.id, privilegeId }] : [];
    });
  });
  await prisma.$transaction([
    prisma.rolePrivilege.deleteMany(),
    prisma.rolePrivilege.createMany({ data: links, skipDuplicates: true }),
  ]);

  console.log(
    `Permisos sincronizados: ${links.length} relaciones; usuarios conservados.`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
