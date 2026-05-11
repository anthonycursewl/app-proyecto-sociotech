import { HttpClient } from "@/shared/http/http.client";

export interface ServiceResponse {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  price: number | null;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedServiceResponse {
  data: ServiceResponse[];
  nextCursor: string | null;
}

export interface ServiceQuery {
  cursor?: string;
  limit?: number;
  includeInactive?: boolean;
}

export const serviceService = {
  getAll: (params?: ServiceQuery) =>
    HttpClient.get<PaginatedServiceResponse>("/services", params as any, { requireAuth: true }),

  getById: (id: string) =>
    HttpClient.get<ServiceResponse>(`/services/${id}`, {}, { requireAuth: true }),

  create: (data: {
    name: string;
    description?: string;
    durationMin?: number;
    price?: number;
  }) => HttpClient.post<ServiceResponse>("/services", data, { requireAuth: true }),

  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      durationMin?: number;
      price?: number;
      isActive?: boolean;
    }
  ) => HttpClient.put<ServiceResponse>(`/services/${id}`, data, { requireAuth: true }),

  delete: (id: string) =>
    HttpClient.delete<ServiceResponse>(`/services/${id}`, { requireAuth: true }),
};
