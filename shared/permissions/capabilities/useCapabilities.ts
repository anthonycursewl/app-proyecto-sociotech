import { hasAnyPermission } from "@/shared/permissions/checkPermission";
import { UserRole } from "@/shared/entities/User";
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

export function useCanUpdateAppointments(): boolean {
  const permissions = useAuthStore((s) => s.permissions);
  return hasAnyPermission(permissions, ["appointments:update"]);
}

export function useCanCancelOwnAppointment(): boolean {
  const permissions = useAuthStore((s) => s.permissions);
  return hasAnyPermission(permissions, ["appointments:cancel:own"]);
}

export function useCanUpdateOwnAppointment(): boolean {
  const permissions = useAuthStore((s) => s.permissions);
  return hasAnyPermission(permissions, ["appointments:update:own"]);
}

export function useIsDoctor(): boolean {
  const user = useAuthStore((s) => s.user);
  return user?.role === UserRole.DOCTOR;
}

export function useCanCreateMedicalRecords(): boolean {
  const permissions = useAuthStore((s) => s.permissions);
  return hasAnyPermission(permissions, ["medical-records:create"]);
}

export function useCanUpdateMedicalRecords(): boolean {
  const permissions = useAuthStore((s) => s.permissions);
  return hasAnyPermission(permissions, ["medical-records:update"]);
}

export function useCanSignMedicalRecords(): boolean {
  const permissions = useAuthStore((s) => s.permissions);
  return hasAnyPermission(permissions, ["medical-records:sign"]);
}

export function useCanReadMedicalRecords(): boolean {
  const permissions = useAuthStore((s) => s.permissions);
  return hasAnyPermission(permissions, ["medical-records:read"]);
}
