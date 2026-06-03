import { User, UserRole } from "@/shared/entities/User";
import { HttpClient } from "@/shared/http/http.client";
import { authService } from "@/shared/services/auth.service";
import { create } from "zustand";

interface AuthState {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
    permissions: string[];
    setPermissions: (permissions: string[]) => void;

    loading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
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
            set({ loading: false, error: err.message || "Error inesperado" });
            return false;
        }
    };

    return {
        user: null,
        setUser: (user: User) => set({ user }),
        clearUser: () => set({ user: null }),
        permissions: [],
        setPermissions: (permissions: string[]) => set({ permissions }),

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

        updateUser: async (data: { firstName: string; lastName: string }): Promise<boolean> => {
            const result = await runAction(async () => {
                const current = get().user;
                if (!current) return false;
                const updatedUser = { ...current, ...data };
                const response = await authService.updateUser(updatedUser);
                if (!response) return false;
                set({ user: response });
                return true;
            });
            return result === true;
        },

        logout: () => {
            HttpClient.clearTokens();
            set({
                user: null,
                permissions: [],
                error: null,
                loading: false,
            });
        },
    };
});
