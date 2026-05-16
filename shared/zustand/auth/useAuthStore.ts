import { User, UserRole } from "@/shared/entities/User";
import { HttpClient } from "@/shared/http/http.client";
import { authService } from "@/shared/services/auth.service";
import { userService } from "@/shared/services/user.service";
import { create } from "zustand";

interface AuthState {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
    permissions: string[];
    setPermissions: (permissions: string[]) => void;

    // State
    loading: boolean;
    error: string | null;

    tokens: {
        accessToken: string;
        refreshToken: string;
    };
    setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
    clearTokens: () => void;

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
    const runAction = async <T>(action: () => Promise<T>): Promise<T | null> => {
        if (get().loading) return null;

        set({ loading: true, error: null });
        try {
            const result = await action();
            set({ loading: false });
            return result;
        } catch (err: any) {
            const errorMessage = err.message || "Ocurrió un error inesperado";
            set({ loading: false, error: errorMessage });
            return null;
        }
    };

    return {
        user: null,
        setUser: (user: User) => set({ user }),
        clearUser: () => set({ user: null }),
        permissions: [],
        setPermissions: (permissions: string[]) => set({ permissions }),

        // Internal state 
        loading: false,
        error: null,
        clearError: () => set({ error: null }),

        // Authentication
        tokens: {
            accessToken: "",
            refreshToken: ""
        },
        setTokens: (tokens: { accessToken: string; refreshToken: string }) => set({ tokens }),

        clearTokens: () => set({ tokens: { accessToken: "", refreshToken: "" } }),

        login: async (email: string, password: string): Promise<boolean> => {
            const success = await runAction(async () => {
                if (!email || !password) return false;
                const { setTokens, setUser, setPermissions } = get()
                const response = await authService.login({ email, password });

                if (response) {
                    await HttpClient.saveTokens(response.accessToken, response.refreshToken);
                    setTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken });
                    setUser(mapAuthUser(response.user));
                    setPermissions(response.user.permissions);
                    return true;
                }
                return false;
            });
            return success ?? false;
        },

        register: async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
            const success = await runAction(async () => {
                const { setTokens, setUser, setPermissions } = get()
                const response = await authService.register({ email, password, firstName, lastName });

                if (response) {
                    await HttpClient.saveTokens(response.accessToken, response.refreshToken);
                    setTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken });
                    setUser(mapAuthUser(response.user));
                    setPermissions(response.user.permissions);
                    return true;
                }
                return false;
            });
            return success ?? false;
        },

        verifyToken: async (): Promise<boolean> => {
            const success = await runAction(async () => {
                const response = await authService.me();
                if (response) {
                    set({
                        user: response.user,
                        permissions: response.user.permissions || [],
                    });
                    return true;
                }
                return false;
            });
            return success ?? false;
        },

        updateUser: async (data: { firstName: string; lastName: string }): Promise<boolean> => {
            const success = await runAction(async () => {
                const response = await userService.updateProfile(data);
                console.log("[updateUser] API response:", JSON.stringify(response, null, 2));
                if (response) {
                    const current = get().user;
                    const userData = (response as any).user ?? response;
                    set({
                        user: current ? {
                            ...current,
                            firstName: userData.firstName,
                            lastName: userData.lastName,
                        } : null,
                    });
                    return true;
                }
                return false;
            });
            return success ?? false;
        },

        logout: () => {
            HttpClient.clearTokens();
            set({
                user: null,
                tokens: { accessToken: "", refreshToken: "" },
            });
        },
    };
});
