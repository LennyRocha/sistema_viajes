import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { privilegiosSeeds } from '../seeds/privilegiosSeed';
import { rolesSeeds } from '../seeds/rolesSeed';
import { rolePrivilegesSeed } from '../seeds/rolePrivilegesSeed';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpieza opcional (útil en dev para reseedar sin duplicar)
  await prisma.userRole.deleteMany();
  await prisma.rolePrivilege.deleteMany();
  await prisma.rol.deleteMany();
  await prisma.privilegio.deleteMany();

  //Reestablecer secuencias de IDs para evitar conflictos con seeds
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "auth"."UserRole", "auth"."RolePrivilege",
      "auth"."Rol", "auth"."Privilegio" RESTART IDENTITY CASCADE;
`);

  // Inserción de datos de prueba
  const roles = await prisma.rol.createMany({
    data: rolesSeeds,
  });
  const privilegios = await prisma.privilegio.createMany({
    data: privilegiosSeeds,
  });

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
  await prisma.rolePrivilege.createMany({ data: links, skipDuplicates: true });

  console.log(
    `✅ Seed completado: ${roles.count + privilegios.count} registros creados`,
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
