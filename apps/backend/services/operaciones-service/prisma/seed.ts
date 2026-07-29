import { readFileSync, existsSync } from 'node:fs';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function loadLocalEnv() {
  if (!existsSync('.env')) return;

  const content = readFileSync('.env', 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^"|"$/g, '');

    process.env[key] ??= value;
  }
}

loadLocalEnv();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.configuracionOperacion.upsert({
    where: { clave: 'rutas.toleranciaConexionMetros' },
    update: {},
    create: {
      clave: 'rutas.toleranciaConexionMetros',
      valor: 100,
      descripcion:
        'Distancia maxima para considerar conectadas dos rutas consecutivas.',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
