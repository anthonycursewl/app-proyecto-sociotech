export interface VitalSignsData {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
}

export interface PrescriptionData {
  medicationName: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface PrescriptionResponse {
  id: string;
  medicalRecordId: string;
  medicationName: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  createdAt: string;
}

export interface MedicalRecordResponse {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string | null;
  chiefComplaint: string;
  symptoms: string[];
  diagnosis: string;
  diagnosisCode: string | null;
  treatment: string;
  notes: string;
  isSigned: boolean;
  signedAt: string | null;
  bloodPressure: string | null;
  heartRate: number | null;
  temperature: number | null;
  weight: number | null;
  height: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
  prescriptions: PrescriptionResponse[];
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
  diagnosisCode?: string;
  treatment: string;
  notes: string;
  vitalSigns?: VitalSignsData;
  prescriptions?: PrescriptionData[];
}

export interface UpdateMedicalRecordData {
  chiefComplaint?: string;
  symptoms?: string[];
  diagnosis?: string;
  diagnosisCode?: string;
  treatment?: string;
  notes?: string;
  vitalSigns?: VitalSignsData;
  prescriptions?: PrescriptionData[];
}
