import { HttpClient } from "@/shared/http/http.client";
import type {
  VitalSignsData,
  PrescriptionData,
  PrescriptionResponse,
  MedicalRecordResponse,
  CreateMedicalRecordData,
  UpdateMedicalRecordData,
} from "@/shared/entities/MedicalRecord";

export type {
  VitalSignsData,
  PrescriptionData,
  PrescriptionResponse,
  MedicalRecordResponse,
  CreateMedicalRecordData,
  UpdateMedicalRecordData,
};

export const medicalRecordService = {
  create: (data: CreateMedicalRecordData) =>
    HttpClient.post<MedicalRecordResponse>("/medical-records", data, { requireAuth: true }),

  update: (id: string, data: UpdateMedicalRecordData) =>
    HttpClient.put<MedicalRecordResponse>(`/medical-records/${id}`, data, { requireAuth: true }),

  getById: (id: string) =>
    HttpClient.get<MedicalRecordResponse>(`/medical-records/${id}`, {}, { requireAuth: true }),

  getAll: () =>
    HttpClient.get<MedicalRecordResponse[]>("/medical-records", {}, { requireAuth: true }),

  getByPatient: (patientId: string) =>
    HttpClient.get<MedicalRecordResponse[]>(`/medical-records/patient/${patientId}`, {}, { requireAuth: true }),

  getByDoctor: (doctorId: string) =>
    HttpClient.get<MedicalRecordResponse[]>(`/medical-records/doctor/${doctorId}`, {}, { requireAuth: true }),

  getByAppointment: (appointmentId: string) =>
    HttpClient.get<MedicalRecordResponse | null>(`/medical-records/appointment/${appointmentId}`, {}, { requireAuth: true }),

  getMyRecords: () =>
    HttpClient.get<MedicalRecordResponse[]>("/medical-records/me", {}, { requireAuth: true }),

  sign: (id: string) =>
    HttpClient.put<MedicalRecordResponse>(`/medical-records/${id}/sign`, { signed: true }, { requireAuth: true }),

  delete: (id: string) =>
    HttpClient.delete<void>(`/medical-records/${id}`, { requireAuth: true }),
};
