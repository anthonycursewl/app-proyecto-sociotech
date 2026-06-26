import { User, UserRole } from "@/shared/entities/User";
import { HttpClient, SessionExpiredError } from "@/shared/http/http.client";
import { authService } from "@/shared/services/auth.service";
import { doctorService, DoctorProfileResponse } from "@/shared/services/doctor.service";
import { create } from "zustand";

interface AuthState {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
    permissions: string[];
    setPermissions: (permissions: string[]) => void;

    doctorProfile: DoctorProfileResponse | null;
    doctorProfileLoading: boolean;
    setDoctorProfile: (profile: DoctorProfileResponse | null) => void;
    loadDoctorProfile: () => Promise<void>;

    loading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
    sendVerificationCode: (email: string) => Promise<boolean>;
    verifyCode: (email: string, code: string) => Promise<boolean>;
    forgotPassword: (email: string) => Promise<boolean>;
    resetPassword: (email: string, code: string, password: string) => Promise<boolean>;
    updateUser: (data: { firstName: string; lastName: string }) => Promise<boolean>;
    logout: () => void;
    clearError: () => void;
    verifyToken: () => Promise<boolean>;
}

const mapAuthUser = (au: { id: string; email: string; firstName: string; lastName: string; roleId: string; roleName: string; permissions: string[] }): User => ({
    id: au.id,
    email: au.email,
    firstName: au.firstName,
    lastName: au.lastName,
    role: au.roleName.toUpperCase() as UserRole,
    roleId: au.roleId,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    permissions: au.permissions,
});

export const useAuthStore = create<AuthState>((set, get) => {
    const runAction = async <T>(action: () => Promise<T>): Promise<T | false> => {
        set({ loading: true, error: null });
        try {
            const result = await action();
            set({ loading: false });
            return result;
        } catch (err: any) {
            set({ loading: false });
            if (err instanceof SessionExpiredError) {
                return false;
            }
            set({ error: err.message || "Error inesperado" });
            return false;
        }
    };

    return {
        user: null,
        setUser: (user: User) => set({ user }),
        clearUser: () => set({ user: null, doctorProfile: null }),
        permissions: [],
        setPermissions: (permissions: string[]) => set({ permissions }),

        doctorProfile: null,
        doctorProfileLoading: false,
        setDoctorProfile: (profile: DoctorProfileResponse | null) => set({ doctorProfile: profile }),

        loading: false,
        error: null,
        clearError: () => set({ error: null }),

        login: async (email: string, password: string): Promise<boolean> => {
            const result = await runAction(async () => {
                if (!email || !password) return false;
                const response = await authService.login({ email, password });
                if (!response) return false;
                await HttpClient.saveTokens(response.accessToken, response.refreshToken);
                set({
                    user: mapAuthUser(response.user),
                    permissions: response.user.permissions,
                });
                return true;
            });
            return result === true;
        },

        register: async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
            const result = await runAction(async () => {
                const response = await authService.register({ email, password, firstName, lastName });
                if (!response) return false;
                await HttpClient.saveTokens(response.accessToken, response.refreshToken);
                set({
                    user: mapAuthUser(response.user),
                    permissions: response.user.permissions,
                });
                return true;
            });
            return result === true;
        },

        sendVerificationCode: async (email: string): Promise<boolean> => {
            const result = await runAction(async () => {
                const response = await authService.sendVerificationCode({ email });
                return !!response;
            });
            return result === true;
        },

        verifyCode: async (email: string, code: string): Promise<boolean> => {
            const result = await runAction(async () => {
                const response = await authService.verifyCode({ email, code });
                return !!response;
            });
            return result === true;
        },

        forgotPassword: async (email: string): Promise<boolean> => {
            const result = await runAction(async () => {
                const response = await authService.forgotPassword({ email });
                return !!response;
            });
            return result === true;
        },

        resetPassword: async (email: string, code: string, password: string): Promise<boolean> => {
            const result = await runAction(async () => {
                const response = await authService.resetPassword({ email, code, password });
                return !!response;
            });
            return result === true;
        },

        verifyToken: async (): Promise<boolean> => {
            const result = await runAction(async () => {
                const response = await authService.me();
                if (!response) return false;
                set({
                    user: response.user,
                    permissions: response.user.permissions || [],
                });
                return true;
            });
            return result === true;
        },

        loadDoctorProfile: async () => {
            const state = get();
            if (state.doctorProfile || state.doctorProfileLoading) return;
            set({ doctorProfileLoading: true });
            try {
                const profile = await doctorService.getMyProfile();
                set({ doctorProfile: profile });
            } catch (err) {
                if (!(err instanceof SessionExpiredError)) {
                    console.warn("[useAuthStore] loadDoctorProfile failed:", err);
                }
            } finally {
                set({ doctorProfileLoading: false });
            }
        },

        updateUser: async (data: { firstName: string; lastName: string }): Promise<boolean> => {
            const result = await runAction(async () => {
                const current = get().user;
                if (!current) return false;
                const response = await authService.updateUser({ ...current, ...data });
                if (!response) return false;
                set({ user: mapAuthUser(response.user) });
                return true;
            });
            return result === true;
        },

        logout: () => {
            HttpClient.clearTokens();
            set({
                user: null,
                permissions: [],
                doctorProfile: null,
                error: null,
                loading: false,
            });
        },
    };
});
