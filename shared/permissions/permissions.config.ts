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
  exams: ["exams:read"],
  reports: ["reports:read", "reports:generate", "reports:export"],
  audit: ["audit:read"],
  doctors: ["doctors:read", "doctors:create", "doctors:create:own", "doctors:update", "doctors:delete"],
  myDoctorProfile: ["doctors:update:own"],
  schedules: ["schedules:manage", "schedules:create:own"],
  roles: ["roles:read", "roles:create", "roles:update", "roles:delete"],
  users: ["users:read", "users:create", "users:update", "users:assign-role", "users:delete"],
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
  "admin/appointments": MODULE_PERMISSIONS.manageAppointments,
  records: MODULE_PERMISSIONS.myRecords,
  "admin/records": MODULE_PERMISSIONS.records,
  exams: MODULE_PERMISSIONS.exams,
  reports: MODULE_PERMISSIONS.reports,
  audit: MODULE_PERMISSIONS.audit,
  "admin/doctors": MODULE_PERMISSIONS.doctors,
  doctors: MODULE_PERMISSIONS.doctors,
  "doctor/profile": MODULE_PERMISSIONS.myDoctorProfile,
  "doctor/edit-profile": MODULE_PERMISSIONS.myDoctorProfile,
  schedules: MODULE_PERMISSIONS.schedules,
  roles: MODULE_PERMISSIONS.roles,
  users: MODULE_PERMISSIONS.users,
};
