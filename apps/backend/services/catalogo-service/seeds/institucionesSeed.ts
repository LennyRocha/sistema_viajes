import slugify from 'slugify';
export const institucionesSeeds = [
  {
    nombre: 'Transportes del Norte',
    descripcion: 'Servicio regional de transporte',
    slug: slugify('Transportes del Norte', { lower: true }),
  },
  {
    nombre: 'Movilidad Express',
    descripcion: 'Transporte ejecutivo y turístico',
    slug: slugify('Movilidad Express', { lower: true }),
  },
  {
    nombre: 'Autobuses Sierra',
    descripcion: 'Rutas de montaña',
    slug: slugify('Autobuses Sierra', { lower: true }),
  },
  {
    nombre: 'Viajes Premium',
    descripcion: 'Servicio de lujo',
    slug: slugify('Viajes Premium', { lower: true }),
  },
  {
    nombre: 'Ruta Escolar',
    descripcion: 'Transporte escolar',
    slug: slugify('Ruta Escolar', { lower: true }),
  },
];
