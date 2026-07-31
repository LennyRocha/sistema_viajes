import { PrismaClient } from 'generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { privilegiosSeeds } from '../seeds/privilegiosSeed';
import { rolesSeeds } from '../seeds/rolesSeed';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpieza opcional (útil en dev para reseedar sin duplicar)
  await prisma.rol.deleteMany();
  await prisma.privilegio.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePrivilege.deleteMany();

  //Reestablecer secuencias de IDs para evitar conflictos con seeds
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "rol" RESTART IDENTITY CASCADE;
    TRUNCATE TABLE "privilegio" RESTART IDENTITY CASCADE;
    TRUNCATE TABLE "user_role" RESTART IDENTITY CASCADE;
    TRUNCATE TABLE "role_privilege" RESTART IDENTITY CASCADE;
`);

  // Inserción de datos de prueba
  const roles = await prisma.rol.createMany({
    data: rolesSeeds,
  });
  const privilegios = await prisma.privilegio.createMany({
    data: privilegiosSeeds,
  });

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
