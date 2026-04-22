import { useRouter } from "expo-router";

export interface ModuleItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  permissions: string[];
}

export const useModuleGrid = () => {
  const router = useRouter();

  const modules: ModuleItem[] = [
    {
      id: "services",
      title: "Servicios",
      icon: "Hospital",
      color: "#4CB1B1",
      description: "Información clínica",
      permissions: [''],
    },
    {
      id: "patients",
      title: "Pacientes",
      icon: "Users",
      color: "#4CB1B1",
      description: "Gestión de altas",
      permissions: [''],
    },
    {
      id: "appointments",
      title: "Citas",
      icon: "CalendarClock",
      color: "#4CB1B1",
      description: "Agenda on-line",
      permissions: [''],
    },
    {
      id: "records",
      title: "Historias",
      icon: "ClipboardList",
      color: "#4CB1B1",
      description: "Base de datos",
      permissions: [''],
    },
    {
      id: "exams",
      title: "Exámenes",
      icon: "Microscope",
      color: "#4CB1B1",
      description: "Resultados médicos",
      permissions: [''],
    },
    {
      id: "reports",
      title: "Reportes",
      icon: "FileText",
      color: "#4CB1B1",
      description: "Documentos PDF",
      permissions: [''],
    },
    {
      id: "audit",
      title: "Auditoría",
      icon: "ShieldCheck",
      color: "#4CB1B1",
      description: "Control de procesos",
      permissions: [''],
    },
  ];

  const handleModulePress = (id: string) => {
    console.log(`Navigating to module: ${id}`);
  };

  return {
    modules,
    handleModulePress,
  };
};
