import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { privilegiosSeeds } from '../seeds/privilegiosSeed';
import { rolePrivilegesSeed } from '../seeds/rolePrivilegesSeed';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
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

  await prisma.rolePrivilege.deleteMany();

  const links = roles.flatMap((role) => {
    const names = rolePrivilegesSeed[role.nombre] ?? [];
    const selected = names.includes('*') ? privileges.map((item) => item.nombre) : names;
    return selected.flatMap((name) => {
      const privilegeId = privilegeIds.get(name);
      return privilegeId ? [{ roleId: role.id, privilegeId }] : [];
    });
  });

  await prisma.rolePrivilege.createMany({ data: links, skipDuplicates: true });
  console.log(`Permisos sincronizados: ${links.length} relaciones, usuarios conservados.`);
}

main()
  .catch((error) => {
    console.error('No se pudieron sincronizar los permisos:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
