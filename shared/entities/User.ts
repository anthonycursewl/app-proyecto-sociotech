export enum UserRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    DOCTOR = 'DOCTOR',
    SECRETARY = 'SECRETARY',
    PATIENT = 'PATIENT',
}

export interface User {
    id: string;
    email: string;
    passwordHash?: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}


export interface UserProfile {
    user: User
}