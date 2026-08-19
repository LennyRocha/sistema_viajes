export const rolePrivilegesSeed: Record<string, string[]> = {
  ROLE_ADMIN: ['*'],
  ROLE_OPERADOR: [
    'ruta:crear', 'viaje:editar', 'viaje:abrir', 'salida:cancelar',
    'salida:reasignar', 'salida:consultar', 'calendario:consultar',
    'conductores:consultar', 'autobus:consultar',
  ],
  ROLE_SUPERVISOR: [
    'calendario:consultar', 'salida:consultar', 'conductores:consultar',
    'autobus:consultar', 'roles:consultar',
  ],
  ROLE_CONDUCTOR: ['calendario:consultar', 'salida:consultar'],
};
