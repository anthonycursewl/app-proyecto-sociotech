import { HttpClient } from "@/shared/http/http.client";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface AppointmentPersonRef {
  firstName?: string;
  lastName?: string;
  name?: string;
}

export interface AppointmentPatientRef extends AppointmentPersonRef {
  id?: string;
  cedula?: string;
  phone?: string;
}

export interface AppointmentResponse {
  id: string;
  patientId?: string;
  patient?: AppointmentPatientRef;
  patientName?: string;
  service?: { id?: string; name?: string };
  serviceName?: string;
  doctor?: AppointmentPersonRef;
  doctorName?: string;
  scheduledAt: string;
  date?: string;
  time?: string;
  durationMin: number;
  status: AppointmentStatus | string;
  location?: string;
}

export interface PaginatedAppointmentsResponse {
  data: AppointmentResponse[];
  nextCursor: string | null;
}

export interface AppointmentQuery {
  cursor?: string;
  limit?: number;
  status?: AppointmentStatus;
}

export const appointmentService = {
  getMyAppointments: (params?: AppointmentQuery) =>
    HttpClient.get<PaginatedAppointmentsResponse>(
      "/appointments/me",
      params as Record<string, unknown>,
      { requireAuth: true },
    ),

  getAll: (params?: AppointmentQuery) =>
    HttpClient.get<PaginatedAppointmentsResponse>(
      "/appointments",
      params as Record<string, unknown>,
      { requireAuth: true },
    ),
};
