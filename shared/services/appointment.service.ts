import { HttpClient } from "@/shared/http/http.client";

export type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

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
  createdAt: string;
  updatedAt: string;
}

export interface AvailableSlotsResponse {
  slots: string[];
}

export interface MonthlyAvailabilityResponse {
  days: Array<{
    date: string;
    availableSlots: number;
  }>;
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

export type AppointmentFilter = "all" | "pending" | "upcoming" | "history";

export const appointmentService = {
  getAvailableSlots: (doctorId: string, serviceId: string, date: string) =>
    HttpClient.get<AvailableSlotsResponse>(
      "/appointments/available-slots",
      { doctorId, serviceId, date },
      { requireAuth: true },
    ),

  getMonthlyAvailability: (doctorId: string, serviceId: string, year: number, month: number) =>
    HttpClient.get<MonthlyAvailabilityResponse>(
      "/appointments/available-slots/month",
      { doctorId, serviceId, year, month } as Record<string, unknown>,
      { requireAuth: true },
    ),

  create: (data: CreateAppointmentData) =>
    HttpClient.post<Appointment>("/appointments", data, { requireAuth: true }),

  getMyAppointments: (filter: AppointmentFilter = "upcoming") =>
    HttpClient.get<Appointment[]>(
      "/appointments/me",
      { filter },
      { requireAuth: true },
    ),

  getAll: (filter: AppointmentFilter = "upcoming") =>
    HttpClient.get<Appointment[]>(
      "/appointments",
      { filter },
      { requireAuth: true },
    ),

  getById: (id: string) =>
    HttpClient.get<Appointment>(`/appointments/${id}`, {}, { requireAuth: true }),

  cancel: (id: string, data?: CancelAppointmentData) =>
    HttpClient.put<Appointment>(`/appointments/${id}/cancel`, data, { requireAuth: true }),
};
