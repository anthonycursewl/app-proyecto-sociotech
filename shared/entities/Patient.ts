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
