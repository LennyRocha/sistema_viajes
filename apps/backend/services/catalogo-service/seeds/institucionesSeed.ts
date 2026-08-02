import slugify from 'slugify';
export const institucionesSeeds = [
  {
    nombre: 'Transportes del Norte',
    descripcion: 'Servicio regional de transporte',
    slug: slugify('Transportes del Norte', { lower: true }),
    imagen_url:
      'https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-original-577x577/s3/092010/estrelladeoro.png?itok=LhInlmU8',
  },
  {
    nombre: 'Movilidad Express',
    descripcion: 'Transporte ejecutivo y turístico',
    slug: slugify('Movilidad Express', { lower: true }),
    imagen_url:
      'https://onibusbrasil.com/img/emp_logo/pullman-de-morelos-26798.png',
  },
  {
    nombre: 'Autobuses Sierra',
    descripcion: 'Rutas de montaña',
    slug: slugify('Autobuses Sierra', { lower: true }),
    imagen_url:
      'https://www.horariodeautobuses.com.mx/images/logo-empresas/au-autobuses-logo.jpg',
  },
  {
    nombre: 'Viajes Premium',
    descripcion: 'Servicio de lujo',
    slug: slugify('Viajes Premium', { lower: true }),
    imagen_url:
      'https://vectorseek.com/wp-content/uploads/2023/05/Ado-Logo-PNG-Vector.jpg',
  },
  {
    nombre: 'Ruta Escolar',
    descripcion: 'Transporte escolar',
    slug: slugify('Ruta Escolar', { lower: true }),
    imagen_url:
      'https://d1yjjnpx0p53s8.cloudfront.net/styles/logo-original-577x577/s3/032014/cristobal_colon-1.png?itok=hF3hYrre',
  },
];
