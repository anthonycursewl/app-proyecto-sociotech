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
  const routerRef = useRef(router);
  routerRef.current = router;
  const user = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.permissions);
  const lastDeniedPath = useRef<string | null>(null);
  const wasAuthenticated = useRef<boolean>(false);

  useEffect(() => {
    if (user) {
      wasAuthenticated.current = true;
    }
  }, [user]);

  useEffect(() => {
    if (!pathname) return;

    const r = routerRef.current;

    if (!user) {
      if (wasAuthenticated.current && !isPublicMainRoute(pathname)) {
        wasAuthenticated.current = false;
        r.replace("/(auth)/login");
      }
      return;
    }

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

    r.replace({
      pathname: "/(main)/access-denied",
      params: { from: pathname },
    });
  }, [pathname, permissions, user]);
}
