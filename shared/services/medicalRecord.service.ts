import { HttpClient } from "@/shared/http/http.client";

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string | null;
  chiefComplaint: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  notes: string;
  isSigned: boolean;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalRecordData {
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  chiefComplaint: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  notes: string;
}

export interface UpdateMedicalRecordData {
  chiefComplaint?: string;
  symptoms?: string[];
  diagnosis?: string;
  treatment?: string;
  notes?: string;
}

export const medicalRecordService = {
  create: (data: CreateMedicalRecordData) =>
    HttpClient.post<MedicalRecord>("/medical-records", data, { requireAuth: true }),

  getByPatient: (patientId: string) =>
    HttpClient.get<MedicalRecord[]>(`/medical-records/patient/${patientId}`, {}, { requireAuth: true }),

  getByAppointment: (appointmentId: string) =>
    HttpClient.get<MedicalRecord | null>(`/medical-records/appointment/${appointmentId}`, {}, { requireAuth: true }),

  update: (id: string, data: UpdateMedicalRecordData) =>
    HttpClient.put<MedicalRecord>(`/medical-records/${id}`, data, { requireAuth: true }),

  sign: (id: string) =>
    HttpClient.put<MedicalRecord>(`/medical-records/${id}/sign`, {}, { requireAuth: true }),

  delete: (id: string) =>
    HttpClient.delete<void>(`/medical-records/${id}`, { requireAuth: true }),
};
