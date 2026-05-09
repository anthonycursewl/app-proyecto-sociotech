import { UserRole } from "../entities/User";

export const ModulePermission = {
    SERVICES: 'services',
    PATIENTS: 'patients',
    APPOINTMENTS: 'appointments',
    RECORDS: 'records',
    EXAMS: 'exams',
    REPORTS: 'reports',
    AUDIT: 'audit',
    SETTINGS: 'settings',
    USERS: 'users',
} as const;

export type ModulePermission = typeof ModulePermission[keyof typeof ModulePermission];

export const ROLE_PERMISSIONS: Record<UserRole, ModulePermission[]> = {
    [UserRole.PATIENT]: [
        ModulePermission.SERVICES,
    ],
    [UserRole.DOCTOR]: [
        ModulePermission.SERVICES,
        ModulePermission.PATIENTS,
        ModulePermission.APPOINTMENTS,
        ModulePermission.RECORDS,
        ModulePermission.EXAMS,
        ModulePermission.REPORTS,
    ],
    [UserRole.ASSISTANT]: [
        ModulePermission.SERVICES,
        ModulePermission.PATIENTS,
        ModulePermission.APPOINTMENTS,
        ModulePermission.RECORDS,
        ModulePermission.EXAMS,
    ],
    [UserRole.ADMIN]: [
        ModulePermission.SERVICES,
        ModulePermission.PATIENTS,
        ModulePermission.APPOINTMENTS,
        ModulePermission.RECORDS,
        ModulePermission.EXAMS,
        ModulePermission.REPORTS,
        ModulePermission.AUDIT,
        ModulePermission.USERS,
    ],
    [UserRole.SUPER_ADMIN]: [
        ModulePermission.SERVICES,
        ModulePermission.PATIENTS,
        ModulePermission.APPOINTMENTS,
        ModulePermission.RECORDS,
        ModulePermission.EXAMS,
        ModulePermission.REPORTS,
        ModulePermission.AUDIT,
        ModulePermission.SETTINGS,
        ModulePermission.USERS,
    ],
};

export const hasPermission = (role: UserRole, permission: ModulePermission): boolean => {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions?.includes(permission) ?? false;
};

export const getPermissionsForRole = (role: UserRole): ModulePermission[] => {
    return ROLE_PERMISSIONS[role] ?? [];
};