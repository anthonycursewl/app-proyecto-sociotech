import { hasAnyPermission } from "@/shared/permissions/checkPermission";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";

/**
 * Capacidades del usuario actual, derivadas de sus permisos (no del nombre del rol).
 * Esto evita acoplar la UI a nombres de rol hardcodeados: cualquier rol con
 * `appointments:read` (sin `:own`) puede gestionar todas las citas.
 */

export function useCanManageAppointments(): boolean {
  const permissions = useAuthStore((s) => s.permissions);
  return hasAnyPermission(permissions, ["appointments:read"]);
}

export function useCanCancelAnyAppointment(): boolean {
  const permissions = useAuthStore((s) => s.permissions);
  return hasAnyPermission(permissions, ["appointments:cancel"]);
}
