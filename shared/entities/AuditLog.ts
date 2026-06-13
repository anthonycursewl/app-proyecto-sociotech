export interface AuditActor {
  userId: string;
  email: string;
  roleName: string;
}

export interface AuditResource {
  type: string;
  id: string;
}

export interface AuditContext {
  ip: string;
  userAgent: string;
  method: string;
  path: string;
}

export interface AuditChanges {
  old: Record<string, unknown> | null;
  new: Record<string, unknown> | null;
}

export interface AuditLog {
  _id: string;
  eventId: string;
  timestamp: string;
  actor: AuditActor | null;
  action: string;
  resource: AuditResource;
  context: AuditContext;
  changes: AuditChanges | null;
  result: "success" | "failure";
  errorMessage: string | null;
}

export interface AuditLogListResponse {
  data: AuditLog[];
  logs?: AuditLog[];
  nextCursor: string | null;
  hasNext: boolean;
}

export type AuditActionFilter =
  | "all"
  | "users:create"
  | "users:update"
  | "users:delete"
  | "users:assign-role"
  | "patients:create"
  | "patients:create:own"
  | "patients:update"
  | "patients:update:own"
  | "patients:delete"
  | "roles:create"
  | "roles:update"
  | "roles:delete"
  | "roles:restore"
  | "roles:permanent-delete"
  | "services:create"
  | "services:update"
  | "services:delete"
  | "doctors:create"
  | "doctors:create:own"
  | "doctors:update"
  | "doctors:update:own"
  | "doctors:delete"
  | "appointments:create"
  | "appointments:create:own"
  | "appointments:confirm"
  | "appointments:complete"
  | "appointments:no-show"
  | "appointments:reschedule"
  | "appointments:cancel"
  | "appointments:delete"
  | "medical-records:create"
  | "medical-records:update"
  | "medical-records:sign"
  | "medical-records:delete"
  | "pdf:prescription"
  | "pdf:clinical-history"
  | "pdf:appointment";

export type AuditResourceFilter =
  | "all"
  | "User"
  | "Patient"
  | "Doctor"
  | "DoctorSchedule"
  | "Appointment"
  | "MedicalRecord"
  | "Service"
  | "Role";

export type AuditResultFilter = "all" | "success" | "failure";

export interface AuditQuery {
  cursor?: string;
  limit?: number;
  action?: string;
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  from?: string;
  to?: string;
  result?: "success" | "failure";
}
