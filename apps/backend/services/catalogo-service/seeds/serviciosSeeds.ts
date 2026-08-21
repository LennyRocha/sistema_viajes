import slugify from 'slugify';

export const serviciosSeeds = [
  {
    nombre: 'WiFi a bordo',
    icono_nombre: 'wifi',
    descripcion: 'Conexion inalambrica para pasajeros durante el trayecto.',
    propiedades: {
      velocidad: 'media',
      incluido: true,
    },
    slug: slugify('WiFi a bordo', { lower: true }),
  },
  {
    nombre: 'Aire acondicionado',
    icono_nombre: 'ac_unit',
    descripcion: 'Climatizacion disponible en toda la unidad.',
    propiedades: {
      zonas: 1,
      incluido: true,
    },
    slug: slugify('Aire acondicionado', { lower: true }),
  },
  {
    nombre: 'Pantallas',
    icono_nombre: 'tv',
    descripcion: 'Entretenimiento visual para viajes largos.',
    propiedades: {
      cantidad: 2,
      incluido: true,
    },
    slug: slugify('Pantallas', { lower: true }),
  },
  {
    nombre: 'Toma corriente',
    icono_nombre: 'power',
    descripcion: 'Contacto electrico o USB para cargar dispositivos.',
    propiedades: {
      usb: true,
      incluido: true,
    },
    slug: slugify('Toma corriente', { lower: true }),
  },
];
