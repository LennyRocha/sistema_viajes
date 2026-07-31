import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { tiposAutobusSeeds } from '../seeds/tiposAutobusSeeds';
import { institucionesSeeds } from '../seeds/institucionesSeed';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpieza opcional (útil en dev para reseedar sin duplicar)
  await prisma.tipoAutobus.deleteMany();
  await prisma.institucion.deleteMany();

  //Reestablecer secuencias de IDs para evitar conflictos con seeds
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "Institucion" RESTART IDENTITY CASCADE;
    TRUNCATE TABLE "TipoAutobus" RESTART IDENTITY CASCADE;
`);

  // Inserción de datos de prueba
  const buses = await prisma.tipoAutobus.createMany({
    data: tiposAutobusSeeds,
  });

  await prisma.institucion.createMany({
    data: institucionesSeeds,
  });

  console.log(`✅ Seed completado: ${buses.count} registros creados`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
