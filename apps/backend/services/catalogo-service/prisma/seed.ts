import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { tiposAutobusSeeds } from '../seeds/tiposAutobusSeeds';
import { institucionesSeeds } from '../seeds/institucionesSeed';
import { serviciosSeeds } from '../seeds/serviciosSeeds';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function createSeatLayout(capacity: number) {
  return Array.from({ length: capacity }, (_, index) => {
    const seat = index + 1;
    return {
      id: `A${seat}`,
      label: String(seat),
      x: index % 4,
      y: Math.floor(index / 4),
      estado: 'DISPONIBLE',
    };
  });
}

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

  const servicios = await Promise.all(
    serviciosSeeds.map((servicio) =>
      prisma.servicio.upsert({
        where: { slug: servicio.slug },
        update: servicio,
        create: servicio,
      }),
    ),
  );

  const defaultInstitucion = inst[0];

  const disponibilidad = await Promise.all(
    buses.flatMap((tipo) =>
      servicios.map((servicio) =>
        prisma.disponibilidadServicio.upsert({
          where: {
            tipo_autobus_id_servicio_id_institucion_id: {
              tipo_autobus_id: tipo.id,
              servicio_id: servicio.id,
              institucion_id: defaultInstitucion.id,
            },
          },
          update: { activo: true },
          create: {
            tipo_autobus_id: tipo.id,
            servicio_id: servicio.id,
            institucion_id: defaultInstitucion.id,
            activo: true,
          },
        }),
      ),
    ),
  );

  const autobusSeeds = [
    {
      codigo_interno: 'BUS-001',
      marca: 'Mercedes-Benz',
      alias: 'Ejecutivo Norte 01',
      modelo: 'Tourismo',
      ano: 2024,
      capacidad: buses[0]?.capacidad ?? 36,
      color: 'Blanco',
      descripcion: 'Unidad premium para salidas demo.',
      slug: 'ejecutivo-norte-01',
      tipo_autobus_id: buses[0].id,
    },
    {
      codigo_interno: 'BUS-002',
      marca: 'Volkswagen',
      alias: 'Shuttle Express 02',
      modelo: 'Crafter',
      ano: 2023,
      capacidad: buses[2]?.capacidad ?? 24,
      color: 'Azul',
      descripcion: 'Unidad shuttle para rutas cortas demo.',
      slug: 'shuttle-express-02',
      tipo_autobus_id: buses[2]?.id ?? buses[0].id,
    },
  ];

  const autobuses = await Promise.all(
    autobusSeeds.map((autobus) =>
      prisma.autobus.upsert({
        where: { codigo_interno: autobus.codigo_interno },
        update: {
          ...autobus,
          institucion_id: defaultInstitucion.id,
          asientos: createSeatLayout(autobus.capacidad),
          estatus: true,
        },
        create: {
          ...autobus,
          institucion_id: defaultInstitucion.id,
          asientos: createSeatLayout(autobus.capacidad),
          estatus: true,
        },
      }),
    ),
  );

  const autobusServicios = await Promise.all(
    autobuses.flatMap((autobus) =>
      servicios.slice(0, 3).map((servicio) =>
        prisma.autobusServicio.upsert({
          where: {
            autobus_id_servicio_id: {
              autobus_id: autobus.id,
              servicio_id: servicio.id,
            },
          },
          update: {
            activo: true,
            config_servicio: { incluido: true },
          },
          create: {
            autobus_id: autobus.id,
            servicio_id: servicio.id,
            activo: true,
            config_servicio: { incluido: true },
          },
        }),
      ),
    ),
  );

  const conductorUsers = await prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id FROM auth."Usuario"
    WHERE email = 'conductor@nexoroute.local'
    LIMIT 1
  `;

  let conductorCount = 0;
  let licenciaCount = 0;
  const conductorUser = conductorUsers[0];

  if (conductorUser) {
    const conductor = await prisma.conductor.upsert({
      where: { usuario_id: conductorUser.id },
      update: {
        institucion_id: defaultInstitucion.id,
        estatus: true,
      },
      create: {
        usuario_id: conductorUser.id,
        institucion_id: defaultInstitucion.id,
        estatus: true,
      },
    });
    conductorCount = 1;

    const licencia = await prisma.licencia.findFirst({
      where: {
        conductor_id: conductor.id,
        numero_licencia: 'DEM-0001',
      },
    });

    const licenciaData = {
      conductor_id: conductor.id,
      numero_licencia: 'DEM-0001',
      categoria: 'Federal A',
      fecha_expedicion: new Date('2026-01-01T00:00:00.000Z'),
      fecha_vencimiento: new Date('2028-01-01T00:00:00.000Z'),
      estado_emisor: 'Morelos',
      imagen_licencia:
        'https://ui-avatars.com/api/?name=Licencia+Demo&background=0E5A84&color=fff',
      vigente: true,
    };

    if (licencia) {
      await prisma.licencia.update({
        where: { id: licencia.id },
        data: licenciaData,
      });
    } else {
      await prisma.licencia.create({ data: licenciaData });
    }
    licenciaCount = 1;
  } else {
    console.warn(
      'No se encontro conductor@nexoroute.local en auth.Usuario; se omite seed de conductor.',
    );
  }

  console.log('Seed de catalogo completado:');
  console.log(`   - Tipos de autobus sincronizados: ${buses.length}`);
  console.log(`   - Instituciones sincronizadas: ${inst.length}`);
  console.log(`   - Servicios sincronizados: ${servicios.length}`);
  console.log(`   - Disponibilidades sincronizadas: ${disponibilidad.length}`);
  console.log(`   - Autobuses sincronizados: ${autobuses.length}`);
  console.log(`   - Servicios por autobus sincronizados: ${autobusServicios.length}`);
  console.log(`   - Conductores sincronizados: ${conductorCount}`);
  console.log(`   - Licencias sincronizadas: ${licenciaCount}`);
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
