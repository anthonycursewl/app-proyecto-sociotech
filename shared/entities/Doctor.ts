export interface DoctorBase {
  id: string;
  userId: string;
  specialty: string;
  licenseNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  consultationPrice: number | null;
  phoneNumber: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorProfileResponse extends DoctorBase {
  biography: string | null;
}

export interface DoctorScheduleBrief {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorDetailResponse extends DoctorBase {
  biography: string | null;
  schedules: DoctorScheduleBrief[];
}

export interface ListDoctorResponse {
  doctors: DoctorBase[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface DoctorMetrics {
  totalActive: number;
  totalInactive: number;
  totalPatients: number;
  updatedAt: string;
}

export interface DoctorListQuery {
  cursor?: string;
  limit?: number;
  isActive?: boolean;
}

export interface CreateDoctorData {
  specialty?: string;
  licenseNumber?: string;
  consultationPrice: number | null;
  biography?: string;
  phoneNumber?: string;
}

export interface UpdateDoctorData {
  specialty?: string;
  licenseNumber?: string;
  consultationPrice?: number;
  biography?: string;
  phoneNumber?: string;
}

export interface CreateScheduleData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export interface UpdateScheduleData {
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}
