import { HttpClient } from "@/shared/http/http.client";

export interface PatientUserRef {
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface PatientResponse {
  id: string;
  userId: string;
  cedula?: string;
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
  createdAt: string;
  updatedAt: string;
}

/** Item en listado admin GET /patients */
export interface AdminPatientResponse extends PatientResponse {
  user?: PatientUserRef;
  firstName?: string;
  lastName?: string;
  email?: string;
  medicalId?: string;
  isActive?: boolean;
  lastVisitAt?: string;
  lastVisit?: string;
  totalAppointments?: number;
}

export interface PaginatedPatientsResponse {
  data: AdminPatientResponse[];
  nextCursor: string | null;
}

export interface PatientsQuery {
  cursor?: string;
  limit?: number;
  search?: string;
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

export const patientService = {
  getAll: (params?: PatientsQuery) =>
    HttpClient.get<PaginatedPatientsResponse>(
      "/patients",
      params as Record<string, unknown>,
      { requireAuth: true },
    ),

  getMyProfile: () =>
    HttpClient.get<PatientResponse>("/patients/me", {}, { requireAuth: true }),

  createMyProfile: (data: CreatePatientData) =>
    HttpClient.post<PatientResponse>("/patients/me", data, { requireAuth: true }),

  updateMyProfile: (data: UpdatePatientData) =>
    HttpClient.put<PatientResponse>("/patients/me", data, { requireAuth: true }),
};
