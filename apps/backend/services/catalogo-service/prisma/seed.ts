import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { tiposAutobusSeeds } from '../seeds/tiposAutobusSeeds';
import { institucionesSeeds } from '../seeds/institucionesSeed';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed...');

  // 1. Limpieza total y reinicio de IDs usando SQL Nativo con CASCADE.
  // Esto elimina automáticamente registros dependientes (como Conductores) sin romper llaves foráneas.
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "Institucion" RESTART IDENTITY CASCADE;
    TRUNCATE TABLE "TipoAutobus" RESTART IDENTITY CASCADE;
  `);

  // 2. Inserción de datos de prueba
  const buses = await prisma.tipoAutobus.createMany({
    data: tiposAutobusSeeds,
  });

  const inst = await prisma.institucion.createMany({
    data: institucionesSeeds,
  });

  console.log(`✅ Seed completado:`);
  console.log(`   - Tipos de Autobús creados: ${buses.count}`);
  console.log(`   - Instituciones creadas: ${inst.count}`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
