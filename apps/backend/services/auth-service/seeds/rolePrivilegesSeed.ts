export const rolePrivilegesSeed: Record<string, string[]> = {
  ROLE_ADMIN: ['*'],
  ROLE_OPERADOR: [
    'viaje:abrir', 'salida:cancelar', 'salida:reasignar',
    'salida:consultar', 'calendario:consultar', 'viaje-base:consultar',
    'ruta:consultar', 'autobus:consultar', 'conductores:consultar',
    'servicio:consultar', 'catalogo:consultar',
  ],
  ROLE_SUPERVISOR: [
    'calendario:consultar', 'salida:consultar', 'conductores:consultar',
    'autobus:consultar', 'ruta:consultar', 'viaje-base:consultar',
    'servicio:consultar', 'catalogo:consultar', 'reportes:consultar',
  ],
  ROLE_CONDUCTOR: ['calendario:consultar-propio', 'salida:consultar-propias'],
  ROLE_CLIENTE: [],
};
