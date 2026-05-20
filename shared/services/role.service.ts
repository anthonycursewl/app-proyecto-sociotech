import { HttpClient } from "@/shared/http/http.client";

export interface RoleListItem {
  id: string;
  name: string;
  isSystem?: boolean;
  description?: string | null;
}

export interface AdminRolesListResponse {
  roles: RoleListItem[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface RoleArrayItem {
  id: string;
  name: string;
  isSystem?: boolean;
  description?: string | null;
}

export const roleService = {
  /** Roles asignables en el modal de cambio de rol */
  listAdmin: (params?: { cursor?: string; limit?: number }) =>
    HttpClient.get<AdminRolesListResponse | RoleArrayItem[]>(
      "/roles",
      params as Record<string, unknown>,
      { requireAuth: true },
    ),
};
