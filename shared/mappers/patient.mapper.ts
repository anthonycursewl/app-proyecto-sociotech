import { PatientData } from "@/components/patients/PatientCard";
import { ListPatientItem } from "@/shared/services/patient.service";

export function mapToPatientData(item: ListPatientItem): PatientData {
  const name = [item.firstName, item.lastName].filter(Boolean).join(" ") || "Paciente";

  return {
    id: item.id,
    name,
    medicalId: item.medicalId ?? "—",
    email: item.email ?? "—",
    phone: item.phone ?? "—",
    status: "active",
    totalAppointments: 0,
  };
}
