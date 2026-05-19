import { useRouter, Href } from "expo-router";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { MODULE_PERMISSIONS } from "@/shared/permissions/permissions.config";
import { hasAnyPermission } from "@/shared/permissions/checkPermission";

export interface ModuleItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  route: Href;
}

export const useModuleGrid = () => {
  const router = useRouter();
  const permissions = useAuthStore((state) => state.permissions);

  const effectivePermissions = permissions;

  const modules: ModuleItem[] = [
    { id: "services", title: "Servicios", icon: "Stethoscope", color: "#4CB1B1", description: "Gestionar servicios", route: "/services" },
    { id: "managePatients", title: "Pacientes", icon: "Users", color: "#5D9B9B", description: "Ver todos los pacientes", route: "/patients" },
    { id: "myPatientData", title: "Mis Datos", icon: "UserPen", color: "#06B6D4", description: "Crear y editar mis datos de paciente", route: "/patient/edit" },
    { id: "myAppointments", title: "Mis Citas", icon: "Calendar", color: "#6B8E8E", description: "Ver mis citas", route: "/appointments" },
    { id: "manageAppointments", title: "Administrar Citas", icon: "CalendarClock", color: "#5D9B9B", description: "Gestionar todas las citas", route: "/admin/appointments" },
    { id: "myRecords", title: "Mi Historia", icon: "FileText", color: "#7BA3A3", description: "Mi historia clínica", route: "/records" },
    { id: "records", title: "Historias Clínicas", icon: "ClipboardList", color: "#6B8E8E", description: "Gestionar historias clínicas", route: "/admin/records" },
    { id: "exams", title: "Exámenes", icon: "Microscope", color: "#8DB8B8", description: "Resultados de exámenes", route: "/exams" },
    { id: "reports", title: "Reportes", icon: "FileText", color: "#9FCDCD", description: "Reportes y documentos", route: "/reports" },
    { id: "audit", title: "Auditoría", icon: "ShieldCheck", color: "#B1E2E2", description: "Control de procesos", route: "/audit" },
    { id: "doctors", title: "Doctores", icon: "Stethoscope", color: "#8B5CF6", description: "Gestionar doctores", route: "/admin/doctors" },
    { id: "myDoctorProfile", title: "Mi Perfil Doctor", icon: "User", color: "#3B82F6", description: "Editar mi perfil de doctor", route: "/doctor/edit-profile" },
    { id: "schedules", title: "Horarios", icon: "Clock", color: "#F59E0B", description: "Gestionar horarios", route: "/schedules" },
    { id: "roles", title: "Roles", icon: "Shield", color: "#EF4444", description: "Gestionar roles", route: "/roles" },
    { id: "users", title: "Usuarios", icon: "UserCog", color: "#64748B", description: "Gestionar usuarios", route: "/users" },
  ];

  const accessibleModules = modules.filter((module) => {
    const requiredPerms = MODULE_PERMISSIONS[module.id];
    if (!requiredPerms) return false;
    return hasAnyPermission(effectivePermissions, requiredPerms);
  });

  const handleModulePress = (id: string) => {
    const module = modules.find((m) => m.id === id);
    if (module) router.push(module.route);
  };

  return { modules: accessibleModules, handleModulePress };
};