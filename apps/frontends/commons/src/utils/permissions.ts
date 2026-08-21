type UserRoles = string[] | string | undefined;

function normalizeRoles(roles: UserRoles): string[] {
  if (Array.isArray(roles)) return roles;
  return roles ? [roles] : [];
}

export function hasPrivilege(
  userPrivileges: string[] | undefined,
  userRoles: UserRoles,
  privilege: string,
) {
  const roles = normalizeRoles(userRoles);
  return (
    roles.includes("ROLE_ADMIN") ||
    Boolean(userPrivileges?.includes("*")) ||
    Boolean(userPrivileges?.includes(privilege))
  );
}

export function hasAnyPrivilege(
  userPrivileges: string[] | undefined,
  userRoles: UserRoles,
  privileges: string[],
) {
  return privileges.some((privilege) =>
    hasPrivilege(userPrivileges, userRoles, privilege),
  );
}
