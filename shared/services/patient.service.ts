import { HttpClient } from "@/shared/http/http.client";
import type {
  PatientResponse,
  ListPatientItem,
  PatientListResponse,
  PatientsQuery,
  CreatePatientData,
  UpdatePatientData,
  PatientMetrics,
} from "@/shared/entities/Patient";

export type {
  PatientResponse,
  ListPatientItem,
  PatientListResponse,
  PatientsQuery,
  CreatePatientData,
  UpdatePatientData,
  PatientMetrics,
};

export const patientService = {
  getMetrics: () =>
    HttpClient.get<PatientMetrics>("/patients/metrics", {}, { requireAuth: true }),

  getAll: (params?: PatientsQuery) =>
    HttpClient.get<PatientListResponse>(
      "/patients/list",
      params as Record<string, unknown>,
      { requireAuth: true },
    ),

  getById: (id: string) =>
    HttpClient.get<PatientResponse>(`/patients/${id}`, {}, { requireAuth: true }),

  search: (q: string) =>
    HttpClient.get<ListPatientItem[]>(`/patients/search`, { q }, { requireAuth: true }),

  getMyProfile: () =>
    HttpClient.get<PatientResponse>("/patients/me", {}, { requireAuth: true }),

  createMyProfile: (data: CreatePatientData) =>
    HttpClient.post<PatientResponse>("/patients/me", data, { requireAuth: true }),

  updateMyProfile: (data: UpdatePatientData) =>
    HttpClient.put<PatientResponse>("/patients/me", data, { requireAuth: true }),
};
