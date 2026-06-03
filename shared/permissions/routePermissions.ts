import {
  MODULE_PERMISSIONS,
  PUBLIC_MAIN_ROUTES,
  ROLE_BLOCKLIST,
  ROUTE_PERMISSIONS,
} from "./permissions.config";

export { MODULE_PERMISSIONS, PUBLIC_MAIN_ROUTES, ROLE_BLOCKLIST, ROUTE_PERMISSIONS };

/** Normaliza pathname de Expo Router → segmento relativo a (main) */
export function normalizeMainRoutePath(pathname: string): string {
  const withoutGroup = pathname.replace(/^\/\(main\)/, "");
  const path = withoutGroup || pathname;
  const trimmed = path.replace(/\/$/, "") || "/";
  if (trimmed === "/") return "/home";
  return trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
}

export function isPublicMainRoute(pathname: string): boolean {
  const key = normalizeMainRoutePath(pathname);
  const routeKey = key.startsWith("/") ? key : `/${key}`;
  return PUBLIC_MAIN_ROUTES.has(routeKey);
}

/**
 * Permisos requeridos para la ruta, o null si es pública.
 * undefined = ruta sin regla (se permite por compatibilidad).
 */
export function getRoutePermissionRequirements(
  pathname: string,
): string[] | null | undefined {
  if (isPublicMainRoute(pathname)) return null;

  const key = normalizeMainRoutePath(pathname);
  if (key in ROUTE_PERMISSIONS) return ROUTE_PERMISSIONS[key];

  return undefined;
}

export function canAccessRoute(
  userPermissions: string[],
  pathname: string,
  userRole?: string,
): boolean {
  const key = normalizeMainRoutePath(pathname);
  const normalizedKey = key.startsWith("/") ? key.slice(1) : key;

  if (userRole) {
    const blockedRoles = ROLE_BLOCKLIST[normalizedKey];
    if (blockedRoles?.includes(userRole)) return false;
  }

  const required = getRoutePermissionRequirements(pathname);
  if (required === null) return true;
  if (required === undefined) return true;
  if (required.length === 0) return false;
  return required.some((p) => userPermissions.includes(p));
}
