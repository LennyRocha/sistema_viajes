export const privilegiosSeeds = [
  { nombre: 'usuarios:crear', descripcion: 'Crear cuentas y asignar roles.' },
  { nombre: 'usuarios:consultar', descripcion: 'Consultar cuentas de usuario.' },
  { nombre: 'usuarios:editar', descripcion: 'Editar datos de usuario.' },
  { nombre: 'usuarios:estado', descripcion: 'Activar o desactivar usuarios.' },
  { nombre: 'usuarios:eliminar', descripcion: 'Eliminar cuentas de usuario.' },
  { nombre: 'roles:consultar', descripcion: 'Consultar roles y sus privilegios.' },
  { nombre: 'privilegios:consultar', descripcion: 'Consultar el catalogo de privilegios.' },
  { nombre: 'salida:consultar', descripcion: 'Consultar salidas programadas.' },
  { nombre: 'autobus:consultar', descripcion: 'Consultar autobuses.' },
  {
    nombre: 'ruta:crear',
    descripcion: 'Definir origen, destino y paradas..',
  },
  {
    nombre: 'viaje:editar',
    descripcion: 'Modificar rutas o servicios asociados.',
  },
  {
    nombre: 'viaje:abrir',
    descripcion: 'Generar salidas en calendario.',
  },
  {
    nombre: 'salida:cancelar',
    descripcion: 'Cancelar una instancia específica.',
  },
  {
    nombre: 'salida:reasignar',
    descripcion: 'Cambiar unidad o conductor en una salida.',
  },
  {
    nombre: 'calendario:consultar',
    descripcion: 'Consultar todos los viajes.',
  },
  {
    nombre: 'conductores:consultar',
    descripcion: 'Conductor solo ve lo suyo.',
  },
];
