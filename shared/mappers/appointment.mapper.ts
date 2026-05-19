import { AppointmentData } from "@/components/appointments/AppointmentCard";
import { AdminAppointmentData } from "@/components/appointments/AdminAppointmentCard";
import {
  AppointmentResponse,
  AppointmentStatus,
} from "@/shared/services/appointment.service";

const VALID_STATUSES: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

function normalizeStatus(status: string): AppointmentStatus {
  const lower = status.toLowerCase() as AppointmentStatus;
  return VALID_STATUSES.includes(lower) ? lower : "pending";
}

function splitScheduledAt(scheduledAt: string, date?: string, time?: string) {
  if (date && time) return { date, time };
  const d = new Date(scheduledAt);
  if (Number.isNaN(d.getTime())) {
    return { date: scheduledAt.slice(0, 10), time: "00:00" };
  }
  const isoDate = d.toISOString().slice(0, 10);
  const isoTime = d.toTimeString().slice(0, 5);
  return { date: isoDate, time: isoTime };
}

function personName(ref?: { firstName?: string; lastName?: string; name?: string }, fallback = "—") {
  if (!ref) return fallback;
  if (ref.name) return ref.name;
  const full = [ref.firstName, ref.lastName].filter(Boolean).join(" ");
  return full || fallback;
}

export function mapToAppointmentData(
  item: AppointmentResponse,
  defaultPatientName = "Paciente",
): AppointmentData {
  const { date, time } = splitScheduledAt(item.scheduledAt, item.date, item.time);
  return {
    id: item.id,
    patientName: item.patientName ?? personName(item.patient, defaultPatientName),
    serviceName: item.serviceName ?? item.service?.name ?? "Servicio",
    doctorName: item.doctorName ?? personName(item.doctor, "Profesional"),
    date,
    time,
    durationMin: item.durationMin,
    status: normalizeStatus(String(item.status)),
    location: item.location,
  };
}

export function mapToAdminAppointmentData(item: AppointmentResponse): AdminAppointmentData {
  const base = mapToAppointmentData(item);
  return {
    ...base,
    patientId: item.patient?.cedula ?? item.patientId ?? "—",
    phone: item.patient?.phone,
  };
}
