import { HttpClient } from "@/shared/http/http.client";

export interface RoleListItem {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface RoleDetail extends RoleListItem {
  permissions: Permission[];
}

export interface RolesListResponse {
  roles: RoleListItem[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface RolesListQuery {
  cursor?: string;
  limit?: number;
}

export interface CreateRoleData {
  name: string;
  description?: string;
}

export interface UpdateRoleData {
  description: string;
}

export interface AddPermissionData {
  permissionId: string;
}

export interface ReplacePermissionsData {
  permissionIds: string[];
}

export const roleService = {
  listAdmin: (params?: RolesListQuery) =>
    HttpClient.get<RolesListResponse>(
      "/roles",
      params as Record<string, unknown>,
      { requireAuth: true },
    ),

  getById: (id: string) =>
    HttpClient.get<RoleDetail>(
      `/roles/${id}`,
      undefined,
      { requireAuth: true },
    ),

  create: (data: CreateRoleData) =>
    HttpClient.post<RoleListItem>(
      "/roles",
      data,
      { requireAuth: true },
    ),

  update: (id: string, data: UpdateRoleData) =>
    HttpClient.put<RoleListItem>(
      `/roles/${id}`,
      data,
      { requireAuth: true },
    ),

  delete: (id: string) =>
    HttpClient.delete<void>(
      `/roles/${id}`,
      { requireAuth: true },
    ),

  getTrash: () =>
    HttpClient.get<RoleListItem[]>(
      "/roles/trash",
      undefined,
      { requireAuth: true },
    ),

  restore: (id: string) =>
    HttpClient.post<RoleListItem>(
      `/roles/trash/${id}/restore`,
      undefined,
      { requireAuth: true },
    ),

  deletePermanent: (id: string) =>
    HttpClient.delete<void>(
      `/roles/trash/${id}/permanent`,
      { requireAuth: true },
    ),

  addPermission: (id: string, data: AddPermissionData) =>
    HttpClient.post<RoleDetail>(
      `/roles/${id}/permissions`,
      data,
      { requireAuth: true },
    ),

  replacePermissions: (id: string, data: ReplacePermissionsData) =>
    HttpClient.put<RoleDetail>(
      `/roles/${id}/permissions`,
      data,
      { requireAuth: true },
    ),

  removePermission: (id: string, permissionId: string) =>
    HttpClient.delete<RoleDetail>(
      `/roles/${id}/permissions/${permissionId}`,
      { requireAuth: true },
    ),
};
