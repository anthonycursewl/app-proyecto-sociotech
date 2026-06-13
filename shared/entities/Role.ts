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
