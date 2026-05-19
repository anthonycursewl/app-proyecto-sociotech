import { PatientData } from "@/components/patients/PatientCard";
import { AdminPatientResponse } from "@/shared/services/patient.service";

function formatLastVisit(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

export function mapToPatientData(item: AdminPatientResponse): PatientData {
  const firstName = item.user?.firstName ?? item.firstName ?? "";
  const lastName = item.user?.lastName ?? item.lastName ?? "";
  const name = [firstName, lastName].filter(Boolean).join(" ") || "Paciente";

  const isActive = item.user?.isActive ?? item.isActive ?? true;

  return {
    id: item.id,
    name,
    medicalId: item.cedula ?? item.medicalId ?? "—",
    email: item.user?.email ?? item.email ?? "—",
    phone: item.phone ?? "—",
    status: isActive ? "active" : "inactive",
    lastVisit: formatLastVisit(item.lastVisitAt ?? item.lastVisit),
    totalAppointments: item.totalAppointments ?? 0,
  };
}
