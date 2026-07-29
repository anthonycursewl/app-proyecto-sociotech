import type {
    Appointment,
    AppointmentCancellation,
    AppointmentFilter,
    AppointmentStatus,
    AvailableSlotsResponse,
    CancelAppointmentData,
    CreateAppointmentData,
    DoctorSummary,
    MonthlyAvailabilityResponse,
    PatientSummaryDto,
    ServiceSummary,
} from "@/shared/entities/Appointment";
import { HttpClient } from "@/shared/http/http.client";

export type {
    Appointment, AppointmentCancellation, AppointmentFilter, AppointmentStatus, AvailableSlotsResponse, CancelAppointmentData, CreateAppointmentData, DoctorSummary, MonthlyAvailabilityResponse, PatientSummaryDto, ServiceSummary
};

const buildAppointmentParams = (filter?: AppointmentFilter, doctorId?: string) => {
  const params: Record<string, unknown> = {};
  if (doctorId) params.doctorId = doctorId;

  switch (filter) {
    case "upcoming":
      params.filter = "upcoming";
      break;
    case "pending":
      params.filter = "pending";
      break;
  }

  return params;
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
      buildAppointmentParams(filter),
      { requireAuth: true },
    ),

  getAll: (filter: AppointmentFilter = "upcoming", doctorId?: string) =>
    HttpClient.get<Appointment[]>(
      "/appointments",
      buildAppointmentParams(filter, doctorId),
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
