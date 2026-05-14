import { HttpClient } from "@/shared/http/http.client";

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
  getMyProfile: () =>
    HttpClient.get<PatientResponse>("/patients/me", {}, { requireAuth: true }),

  createMyProfile: (data: CreatePatientData) =>
    HttpClient.post<PatientResponse>("/patients/me", data, { requireAuth: true }),

  updateMyProfile: (data: UpdatePatientData) =>
    HttpClient.put<PatientResponse>("/patients/me", data, { requireAuth: true }),
};
