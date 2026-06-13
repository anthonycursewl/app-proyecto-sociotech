import { HttpClient } from "@/shared/http/http.client";
import type {
  ServiceResponse,
  ServiceDetailResponse,
  PaginatedServiceResponse,
  ServiceQuery,
  ServiceStatusFilter,
} from "@/shared/entities/Service";

export type {
  ServiceResponse,
  ServiceDetailResponse,
  PaginatedServiceResponse,
  ServiceQuery,
  ServiceStatusFilter,
};

export const serviceService = {
  getAll: (params?: ServiceQuery) =>
    HttpClient.get<PaginatedServiceResponse>("/services", params as any, { requireAuth: true }),

  getByDoctorId: (doctorId: string) =>
    HttpClient.get<ServiceResponse[]>(`/services/doctor/${doctorId}`, {}, { requireAuth: true }),

  getAllPublic: (params?: { cursor?: string; limit?: number }) =>
    HttpClient.get<PaginatedServiceResponse>(
      "/public/services",
      params as Record<string, unknown>,
      { requireAuth: true },
    ),

  getByDoctorPublic: (doctorId: string) =>
    HttpClient.get<ServiceResponse[]>(
      "/public/services",
      { doctorId },
      { requireAuth: true },
    ),

  getById: (id: string) =>
    HttpClient.get<ServiceDetailResponse>(`/services/${id}`, {}, { requireAuth: true }),

  create: (data: {
    name: string;
    description?: string;
    durationMin?: number;
    price?: number;
  }) => HttpClient.post<ServiceDetailResponse>("/services", data, { requireAuth: true }),

  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      durationMin?: number;
      price?: number;
      isActive?: boolean;
    }
  ) => HttpClient.put<ServiceDetailResponse>(`/services/${id}`, data, { requireAuth: true }),

  deactivate: (id: string) =>
    HttpClient.delete<{ message: string }>(`/services/${id}`, { requireAuth: true }),

  restore: (id: string) =>
    HttpClient.post<ServiceDetailResponse>(`/services/${id}/restore`, {}, { requireAuth: true }),
};
