import { useRouter, Href } from "expo-router";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { UserRole } from "@/shared/entities/User";
import { MODULE_PERMISSIONS } from "@/shared/permissions/permissions.config";
import { hasAnyPermission } from "@/shared/permissions/checkPermission";
import { useCallback, useMemo } from "react";

export type ModuleCategory = "appointments" | "clinical" | "management" | "admin";

export interface ModuleItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  route: Href;
  category: ModuleCategory;
}

export interface CategorySection {
  id: ModuleCategory;
  title: string;
  icon: string;
  modules: ModuleItem[];
}

export const CATEGORY_ORDER: ModuleCategory[] = [
  "appointments",
  "clinical",
  "management",
  "admin",
];

export const CATEGORY_META: Record<ModuleCategory, { title: string; icon: string }> = {
  appointments: { title: "Citas", icon: "CalendarCheck" },
  clinical: { title: "Clínica", icon: "HeartPulse" },
  management: { title: "Gestión Médica", icon: "BriefcaseMedical" },
  admin: { title: "Administración", icon: "Shield" },
};

const ALL_MODULES: ModuleItem[] = [
  { id: "myAppointments", title: "Mis Citas", icon: "Calendar", color: "#6B8E8E", description: "Ver mis citas", route: "/appointments", category: "appointments" },
  { id: "manageAppointments", title: "Administrar Citas", icon: "CalendarClock", color: "#5D9B9B", description: "Gestionar todas las citas", route: "/admin/appointments", category: "appointments" },
  { id: "managePatients", title: "Pacientes", icon: "Users", color: "#5D9B9B", description: "Ver todos los pacientes", route: "/patients", category: "clinical" },
  { id: "myPatientData", title: "Mis Datos", icon: "UserPen", color: "#06B6D4", description: "Crear y editar mis datos de paciente", route: "/patient/edit", category: "clinical" },
  { id: "myRecords", title: "Mi Historia", icon: "FileText", color: "#7BA3A3", description: "Mi historia clínica", route: "/records", category: "clinical" },
  { id: "records", title: "Historias Clínicas", icon: "ClipboardList", color: "#6B8E8E", description: "Gestionar historias clínicas", route: "/admin/records", category: "clinical" },
  { id: "services", title: "Servicios", icon: "Stethoscope", color: "#4CB1B1", description: "Gestionar servicios", route: "/services", category: "management" },
  { id: "doctors", title: "Doctores", icon: "Stethoscope", color: "#8B5CF6", description: "Gestionar doctores", route: "/admin/doctors", category: "management" },
  { id: "myDoctorProfile", title: "Mi Perfil Doctor", icon: "User", color: "#3B82F6", description: "Editar mi perfil de doctor", route: "/doctor/edit-profile", category: "management" },
  { id: "users", title: "Usuarios", icon: "UserCog", color: "#64748B", description: "Gestionar usuarios", route: "/users", category: "admin" },
  { id: "roles", title: "Roles", icon: "Shield", color: "#EF4444", description: "Gestionar roles", route: "/roles", category: "admin" },
  { id: "audit", title: "Auditoría", icon: "ShieldCheck", color: "#B1E2E2", description: "Control de procesos", route: "/audit", category: "admin" },
];

export const useModuleGrid = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);

  const isDoctor = user?.role === UserRole.DOCTOR;
  const effectivePermissions = permissions;

  const accessibleModules = useMemo(
    () => ALL_MODULES.filter((module) => {
      if (isDoctor && module.id === "doctors") return false;
      if (isDoctor && module.id === "myDoctorProfile") return true;

      const requiredPerms = MODULE_PERMISSIONS[module.id];
      if (!requiredPerms) return false;
      return hasAnyPermission(effectivePermissions, requiredPerms);
    }),
    [isDoctor, effectivePermissions],
  );

  const sections: CategorySection[] = useMemo(
    () => CATEGORY_ORDER
      .map((catId) => {
        const categoryModules = accessibleModules.filter((m) => m.category === catId);
        if (categoryModules.length === 0) return null;
        return {
          id: catId,
          title: CATEGORY_META[catId].title,
          icon: CATEGORY_META[catId].icon,
          modules: categoryModules,
        };
      })
      .filter((s): s is CategorySection => s !== null),
    [accessibleModules],
  );

  const handleModulePress = useCallback((id: string) => {
    const module = ALL_MODULES.find((m) => m.id === id);
    if (module) router.push(module.route);
  }, [router]);

  return { sections, handleModulePress };
};
