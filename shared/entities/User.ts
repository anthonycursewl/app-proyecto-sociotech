export enum UserRole {
    PATIENT = 'PATIENT',
    DOCTOR = 'DOCTOR',
    ASSISTANT = 'ASSISTANT',
    ADMIN = 'ADMIN',
    SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface User {
    id: string;
    email: string;
    passwordHash?: string;
    role: UserRole;
    roleId: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    permissions: string[];
}


export interface UserProfile {
    user: User
}