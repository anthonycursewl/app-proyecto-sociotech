import { HttpClient } from "@/shared/http/http.client";

export interface PatientResponse {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  medicalId?: string;
  cedula?: string | null;
  dateOfBirth: string;
  gender?: string | null;
  occupation?: string | null;
  civilStatus?: string | null;
  phone: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodType?: string | null;
  allergies?: string[];
  currentMedications?: string[];
  chronicDiseases?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ListPatientItem {
  id: string;
  userId: string;
  medicalId: string;
  firstName: string;
  lastName: string;
  email: string;
  cedula: string | null;
  dateOfBirth: string;
  gender: string | null;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientListResponse {
  patients: ListPatientItem[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface PatientsQuery {
  cursor?: string;
  limit?: number;
  isActive?: boolean;
}

export interface CreatePatientData {
  cedula: string;
  dateOfBirth: string;
  gender?: string;
  occupation?: string;
  civilStatus?: string;
  phone: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodType?: string;
  allergies?: string[];
  currentMedications?: string[];
  chronicDiseases?: string[];
}

export interface UpdatePatientData {
  cedula?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  civilStatus?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bloodType?: string;
  allergies?: string[];
  currentMedications?: string[];
  chronicDiseases?: string[];
}

export interface PatientMetrics {
  totalActive: number;
  totalInactive: number;
  totalNew: number;
  updatedAt: string;
}

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

  getMyProfile: () =>
    HttpClient.get<PatientResponse>("/patients/me", {}, { requireAuth: true }),

  createMyProfile: (data: CreatePatientData) =>
    HttpClient.post<PatientResponse>("/patients/me", data, { requireAuth: true }),

  updateMyProfile: (data: UpdatePatientData) =>
    HttpClient.put<PatientResponse>("/patients/me", data, { requireAuth: true }),
};
