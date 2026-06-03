import { HttpClient } from "@/shared/http/http.client";

// ── Shared doctor shape matching API responses ──

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

// ── Profile CRUD ──

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

// ── Schedules ──

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

// ── In-memory cache for getById ──

const getByIdCache = new Map<string, { data: DoctorDetailResponse; timestamp: number }>();
const GET_BY_ID_CACHE_TTL = 30_000;

export const doctorService = {
  // ── Profile ──

  getMyProfile: () =>
    HttpClient.get<DoctorProfileResponse>("/doctors/me/profile", {}, { requireAuth: true }),

  createMyProfile: (data: CreateDoctorData) =>
    HttpClient.post<DoctorProfileResponse>("/doctors/profile", data, { requireAuth: true }),

  updateMyProfile: (data: UpdateDoctorData) => {
    getByIdCache.clear();
    return HttpClient.put<DoctorProfileResponse>("/doctors/me/profile", data, { requireAuth: true });
  },

  // ── Schedules ──

  listMySchedules: () =>
    HttpClient.get<DoctorSchedule[]>("/doctors/me/schedules", {}, { requireAuth: true }),

  createSchedule: (data: CreateScheduleData) =>
    HttpClient.post<DoctorSchedule>("/doctors/me/schedules", data, { requireAuth: true }),

  updateSchedule: (id: string, data: UpdateScheduleData) =>
    HttpClient.put<DoctorSchedule>(`/doctors/me/schedules/${id}`, data, { requireAuth: true }),

  deleteSchedule: (id: string) =>
    HttpClient.delete<{ success: boolean }>(`/doctors/me/schedules/${id}`, { requireAuth: true }),

  // ── List / Detail ──

  listAll: () =>
    HttpClient.get<DoctorBase[]>("/doctors", {}, { requireAuth: true }),

  getAll: (params?: DoctorListQuery) =>
    HttpClient.get<ListDoctorResponse>(
      "/doctors/list",
      params as Record<string, unknown>,
      { requireAuth: true },
    ),

  getById: async (id: string): Promise<DoctorDetailResponse> => {
    const cached = getByIdCache.get(id);
    if (cached && Date.now() - cached.timestamp < GET_BY_ID_CACHE_TTL) {
      return cached.data;
    }
    const data = await HttpClient.get<DoctorDetailResponse>(`/doctors/${id}`, {}, { requireAuth: true });
    getByIdCache.set(id, { data, timestamp: Date.now() });
    return data;
  },

  invalidateGetByIdCache: () => getByIdCache.clear(),

  // ── Metrics ──

  getMetrics: () =>
    HttpClient.get<DoctorMetrics>("/doctors/metrics", {}, { requireAuth: true }),

  // ── Doctor Schedules (public view) ──

  getDoctorSchedules: (doctorId: string) =>
    HttpClient.get<DoctorSchedule[]>(`/doctor-schedules/doctor/${doctorId}`, {}, { requireAuth: true }),

  // ── Public endpoints (requieren token, sin permiso especial) ──

  getAllPublic: (params?: { cursor?: string; limit?: number }) =>
    HttpClient.get<ListDoctorResponse>(
      "/public/doctors",
      params as Record<string, unknown>,
      { requireAuth: true },
    ),

  getByIdPublic: (id: string) =>
    HttpClient.get<DoctorDetailResponse>(`/public/doctors/${id}`, {}, { requireAuth: true }),

  getSchedulesPublic: (doctorId: string) =>
    HttpClient.get<DoctorSchedule[]>(`/public/doctors/${doctorId}/schedules`, {}, { requireAuth: true }),
};
