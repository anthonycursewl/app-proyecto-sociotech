/**
 * Fuente única de permisos por módulo y por ruta.
 * Fase 1: usado por dashboard, guards y (futuro) pantallas.
 */

export const MODULE_PERMISSIONS: Record<string, string[]> = {
  services: ["services:read", "services:create", "services:update", "services:delete"],
  managePatients: ["patients:read"],
  myPatientData: ["patients:read:own", "patients:create:own", "patients:update:own"],
  myAppointments: [
    "appointments:read:own",
    "appointments:create:own",
    "appointments:update:own",
    "appointments:cancel:own",
  ],
  manageAppointments: [
    "appointments:manage",
    "appointments:read",
    "appointments:create",
    "appointments:update",
    "appointments:cancel",
  ],
  myRecords: ["medical-records:read:own"],
  records: [
    "medical-records:read",
    "medical-records:create",
    "medical-records:update",
    "medical-records:sign",
    "medical-records:delete",
  ],
  myCreatedRecords: ["medical-records:read"],
  audit: ["audit:read"],
  doctors: ["doctors:read", "doctors:create", "doctors:create:own", "doctors:update", "doctors:delete"],
  myDoctorProfile: ["doctors:read:own", "doctors:create:own", "doctors:update:own"],
  roles: ["roles:read", "roles:create", "roles:update", "roles:delete", "roles:restore", "roles:delete:permanent"],
  users: ["users:read", "users:create", "users:update", "users:assign-role", "users:delete"],
};

/**
 * Rutas bloqueadas por rol (el usuario tiene el permiso pero el rol
 * no debería acceder). Anula cualquier permiso.
 */
export const ROLE_BLOCKLIST: Record<string, string[]> = {
  "admin/doctors": ["DOCTOR"],
  doctors: ["DOCTOR"],
};

/** Rutas accesibles para cualquier usuario autenticado */
export const PUBLIC_MAIN_ROUTES = new Set([
  "/home",
  "/profile",
  "/settings",
  "/access-denied",
]);

/**
 * Permisos requeridos por ruta (basta con tener uno de la lista).
 * Claves sin barra inicial; se normalizan en runtime.
 */
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  services: MODULE_PERMISSIONS.services,
  patients: MODULE_PERMISSIONS.managePatients,
  "patient/edit": MODULE_PERMISSIONS.myPatientData,
  appointments: MODULE_PERMISSIONS.myAppointments,
  "appointments/create": MODULE_PERMISSIONS.myAppointments,
  "admin/appointments": MODULE_PERMISSIONS.manageAppointments,
  "admin/appointments/[id]": MODULE_PERMISSIONS.manageAppointments,
  records: MODULE_PERMISSIONS.myRecords,
  "records/[id]": MODULE_PERMISSIONS.myRecords,
  "admin/records": MODULE_PERMISSIONS.records,
  "admin/records/create": MODULE_PERMISSIONS.records,
  "admin/records/[id]": MODULE_PERMISSIONS.records,
  "admin/records/me": MODULE_PERMISSIONS.records,
  "admin/patients/[id]": MODULE_PERMISSIONS.managePatients,
  audit: MODULE_PERMISSIONS.audit,
  "audit/[id]": MODULE_PERMISSIONS.audit,
  "admin/doctors": MODULE_PERMISSIONS.doctors,
  doctors: MODULE_PERMISSIONS.doctors,
  "doctor/[id]": MODULE_PERMISSIONS.doctors,
  "doctor/profile": MODULE_PERMISSIONS.myDoctorProfile,
  "doctor/edit-profile": MODULE_PERMISSIONS.myDoctorProfile,
  roles: MODULE_PERMISSIONS.roles,
  users: MODULE_PERMISSIONS.users,
};
