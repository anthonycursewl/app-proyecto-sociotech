import { HttpClient } from "@/shared/http/http.client";
import type {
  AppointmentStatus,
  AppointmentCancellation,
  DoctorSummary,
  ServiceSummary,
  PatientSummaryDto,
  Appointment,
  AvailableSlotsResponse,
  MonthlyAvailabilityResponse,
  CreateAppointmentData,
  CancelAppointmentData,
  AppointmentFilter,
} from "@/shared/entities/Appointment";

export type {
  AppointmentStatus,
  AppointmentCancellation,
  DoctorSummary,
  ServiceSummary,
  PatientSummaryDto,
  Appointment,
  AvailableSlotsResponse,
  MonthlyAvailabilityResponse,
  CreateAppointmentData,
  CancelAppointmentData,
  AppointmentFilter,
};

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

  getAll: (filter: AppointmentFilter = "upcoming", doctorId?: string) =>
    HttpClient.get<Appointment[]>(
      "/appointments",
      { filter, ...(doctorId ? { doctorId } : {}) },
      { requireAuth: true },
    ),

  getById: (id: string) =>
    HttpClient.get<Appointment>(`/appointments/${id}`, {}, { requireAuth: true }),

  cancel: (id: string, data?: CancelAppointmentData) =>
    HttpClient.put<Appointment>(`/appointments/${id}/cancel`, data, { requireAuth: true }),

  doctorCancel: (id: string, data?: CancelAppointmentData) =>
    HttpClient.put<Appointment>(`/appointments/${id}/doctor-cancel`, data, { requireAuth: true }),

  confirm: (id: string) =>
    HttpClient.put<Appointment>(`/appointments/${id}/confirm`, undefined, { requireAuth: true }),

  complete: (id: string) =>
    HttpClient.put<Appointment>(`/appointments/${id}/complete`, undefined, { requireAuth: true }),

  markNoShow: (id: string) =>
    HttpClient.put<Appointment>(`/appointments/${id}/no-show`, undefined, { requireAuth: true }),

  reschedule: (id: string, scheduledAt: string) =>
    HttpClient.put<Appointment>(`/appointments/${id}/reschedule`, { scheduledAt }, { requireAuth: true }),
};
