import { HttpClient } from "@/shared/http/http.client";

export interface AdminUserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUserListItem {
  updatedAt: string;
  permissions: string[];
}

export interface AdminUsersListResponse {
  users: AdminUserListItem[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface AdminUsersListQuery {
  cursor?: string;
  limit?: number;
  isActive?: boolean;
}

export const userService = {
  listAdmin: (params?: AdminUsersListQuery) =>
    HttpClient.get<AdminUsersListResponse>(
      "/users/admin/list",
      params as Record<string, unknown>,
      { requireAuth: true },
    ),

  toggleActive: (userId: string) =>
    HttpClient.put<{ user: AdminUserDetail }>(
      `/users/admin/${userId}/toggle-active`,
      {},
      { requireAuth: true },
    ),

  assignRole: (userId: string, roleId: string) =>
    HttpClient.put<{ user: AdminUserDetail }>(
      `/users/admin/${userId}/role`,
      { roleId },
      { requireAuth: true },
    ),
};
