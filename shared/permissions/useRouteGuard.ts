import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "expo-router";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { canAccessRoute, isPublicMainRoute } from "./routePermissions";

/**
 * Redirige a home si el usuario no tiene permiso para la ruta actual.
 * Usar en app/(main)/_layout.tsx (Fase 1).
 */
export function useRouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.permissions);
  const lastDeniedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !pathname) return;
    if (isPublicMainRoute(pathname)) {
      lastDeniedPath.current = null;
      return;
    }

    if (canAccessRoute(permissions, pathname, user.role)) {
      lastDeniedPath.current = null;
      return;
    }

    if (lastDeniedPath.current === pathname) return;
    lastDeniedPath.current = pathname;

    router.replace({
      pathname: "/(main)/access-denied",
      params: { from: pathname },
    });
  }, [pathname, permissions, user, router]);
}
