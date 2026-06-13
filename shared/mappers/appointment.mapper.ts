import { AppointmentData } from "@/components/appointments/AppointmentCard";
import { AdminAppointmentData } from "@/components/appointments/AdminAppointmentCard";
import { Appointment, AppointmentCancellation } from "@/shared/services/appointment.service";

const STATUS_MAP: Record<string, "pending" | "confirmed" | "completed" | "cancelled"> = {
  SCHEDULED: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "cancelled",
};

function normalizeStatus(status: string) {
  return STATUS_MAP[status] ?? "pending";
}

function splitScheduledAt(scheduledAt: string | null | undefined, timeSlot?: string) {
  if (!scheduledAt || typeof scheduledAt !== "string") {
    return { date: "—", time: timeSlot ?? "—" };
  }
  const d = new Date(scheduledAt);
  if (Number.isNaN(d.getTime())) {
    const sliced = scheduledAt.length >= 10 ? scheduledAt.slice(0, 10) : scheduledAt;
    return { date: sliced, time: timeSlot ?? "00:00" };
  }
  const date = d.toISOString().slice(0, 10);
  const time = timeSlot ?? d.toTimeString().slice(0, 5);
  return { date, time };
}

export function mapToAppointmentData(item: Appointment): AppointmentData {
  const { date, time } = splitScheduledAt(item.scheduledAt, item.timeSlot);
  const durationMin = item.service?.durationMin ?? item.durationMinutes;
  return {
    id: item.id,
    patientName: "Tú",
    doctorName: item.doctor?.fullName ?? "Profesional no disponible",
    doctorSpecialty: item.doctor?.specialty ?? null,
    doctorPhone: item.doctor?.phoneNumber ?? null,
    serviceName: item.service?.name ?? "Servicio no disponible",
    serviceDescription: item.service?.description ?? null,
    servicePrice: item.service?.price ?? null,
    date,
    time,
    durationMin,
    reason: item.reason,
    notes: item.notes,
    status: normalizeStatus(item.status),
  };
}

export function mapToAdminAppointmentData(item: Appointment): AdminAppointmentData {
  const base = mapToAppointmentData(item);
  return {
    ...base,
    patientId: item.patientId,
    patientName: item.patient?.fullName ?? "Paciente",
    patientPhone: item.patient?.phone ?? null,
    cancellation: item.cancellation as AppointmentCancellation | null,
  };
}
