/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { tiposAutobusSeeds } from '../seeds/tiposAutobusSeeds';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpieza opcional (útil en dev para reseedar sin duplicar)
  await prisma.tipoAutobus.deleteMany();

  // Inserción de datos de prueba
  const buses = await prisma.tipoAutobus.createMany({
    data: tiposAutobusSeeds,
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
