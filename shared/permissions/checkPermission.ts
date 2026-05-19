/** True si el usuario tiene al menos uno de los permisos indicados */
export const hasAnyPermission = (
  userPermissions: string[],
  required: string[],
): boolean => required.some((p) => userPermissions.includes(p));

/** True si el usuario tiene todos los permisos indicados */
export const hasAllPermissions = (
  userPermissions: string[],
  required: string[],
): boolean => required.every((p) => userPermissions.includes(p));
