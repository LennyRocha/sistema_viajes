export const rolePrivilegesSeed: Record<string, string[]> = {
  ROLE_ADMIN: ['*'],
  ROLE_OPERADOR: [
    'viaje:abrir', 'salida:cancelar', 'salida:reasignar',
    'salida:consultar', 'calendario:consultar', 'viaje-base:consultar',
    'ruta:consultar', 'reportes:consultar',
  ],
  ROLE_SUPERVISOR: [
    'calendario:consultar', 'salida:consultar', 'conductores:consultar',
    'autobus:consultar', 'ruta:consultar', 'viaje-base:consultar',
    'reportes:consultar',
  ],
  ROLE_CONDUCTOR: ['calendario:consultar', 'salida:consultar'],
};
