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

export interface ServiceDetailResponse extends ServiceResponse {
  doctorIds: string[];
}

export interface PaginatedServiceResponse {
  data: ServiceResponse[];
  nextCursor: string | null;
}

export type ServiceStatusFilter = "all" | "active" | "inactive";

export interface ServiceQuery {
  cursor?: string;
  limit?: number;
  status?: ServiceStatusFilter;
  includeInactive?: boolean;
}
