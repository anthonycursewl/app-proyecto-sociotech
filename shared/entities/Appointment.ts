export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface AppointmentCancellation {
  cancelledAt: string;
  cancelledBy: string;
  cancellationReason: string | null;
}

export interface DoctorSummary {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  specialty: string;
  phoneNumber: string | null;
}

export interface ServiceSummary {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  price: number | null;
}

export interface PatientSummaryDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  medicalId: string;
  cedula: string | null;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId: string;
  scheduledAt: string;
  timeSlot: string;
  durationMinutes: number;
  status: AppointmentStatus;
  reason: string;
  notes: string | null;
  cancellation: AppointmentCancellation | null;
  doctor: DoctorSummary | null;
  service: ServiceSummary | null;
  patient: PatientSummaryDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableSlotsResponse {
  slots: string[];
}

export interface MonthlyAvailabilityResponse {
  days: {
    date: string;
    availableSlots: number;
  }[];
}

export interface CreateAppointmentData {
  doctorId: string;
  serviceId: string;
  scheduledAt: string;
  reason: string;
  notes?: string;
}

export interface CancelAppointmentData {
  reason?: string;
}

export type AppointmentFilter = "all" | "pending" | "upcoming" | "history" | undefined;
