import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { tiposAutobusSeeds } from '../seeds/tiposAutobusSeeds';
import { institucionesSeeds } from '../seeds/institucionesSeed';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando seed de catalogo...');

  const buses = await Promise.all(
    tiposAutobusSeeds.map((tipo) =>
      prisma.tipoAutobus.upsert({
        where: { nombre: tipo.nombre },
        update: tipo,
        create: tipo,
      }),
    ),
  );

  const inst = await Promise.all(
    institucionesSeeds.map((institucion) =>
      prisma.institucion.upsert({
        where: { slug: institucion.slug },
        update: institucion,
        create: institucion,
      }),
    ),
  );

  console.log('Seed de catalogo completado:');
  console.log(`   - Tipos de autobus sincronizados: ${buses.length}`);
  console.log(`   - Instituciones sincronizadas: ${inst.length}`);
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
