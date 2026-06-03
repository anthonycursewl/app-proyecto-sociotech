import { DoctorData } from "@/components/doctors/DoctorCard";
import { DoctorBase } from "@/shared/services/doctor.service";

export function mapToDoctorData(item: DoctorBase): DoctorData {
  const name = [item.firstName, item.lastName].filter(Boolean).join(" ") || "Doctor";

  return {
    id: item.id,
    name,
    specialty: item.specialty ?? "—",
    email: item.email ?? "—",
    phone: item.phoneNumber ?? "—",
    status: item.isActive ? "active" : "inactive",
    patientsCount: 0,
    todayAppointments: 0,
  };
}
