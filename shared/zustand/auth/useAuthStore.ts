import { User, UserProfile, UserRole } from "@/shared/entities/User";
import { HttpClient } from "@/shared/http/http.client";
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
    updateUser: (user: User) => Promise<void>;
    logout: () => void;
    clearError: () => void;
    verifyToken: () => Promise<boolean>;
}

interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    };
}

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

        // Stuff about session. This is to load session and re-create accessToken when gets invalid.
        clearTokens: () => set({ tokens: { accessToken: "", refreshToken: "" } }),

        /**
         * Loggea un usuario y almacena los tokens
         * @param email email del usuario
         * @param password password del usuario
         */
        login: async (email: string, password: string): Promise<boolean> => {
            const success = await runAction(async () => {
                if (!email || !password) return false;
                const { setTokens, setUser } = get()
                const response = await HttpClient.post<AuthResponse>("/auth/login", {
                    email: email,
                    password: password,
                });

                if (response) {
                    await HttpClient.saveTokens(response.accessToken, response.refreshToken);
                    setTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken });
                    setUser({
                        id: response.user.id,
                        email: response.user.email,
                        firstName: response.user.firstName,
                        lastName: response.user.lastName,
                        role: response.user.role.toUpperCase() as UserRole,
                        passwordHash: "",
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    });
                    return true;
                }
                return false;
            });
            return success ?? false;
        },

        /**
         * Registra un usuario
         * @param email email del usuario
         * @param password password del usuario
         * @param firstName nombre del usuario
         * @param lastName apellido del usuario
         */
        register: async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
            const success = await runAction(async () => {
                const { setTokens, setUser } = get()
                const response = await HttpClient.post<AuthResponse>("/auth/register", {
                    email,
                    password,
                    firstName,
                    lastName,
                });

                if (response) {
                    await HttpClient.saveTokens(response.accessToken, response.refreshToken);
                    setTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken });
                    setUser({
                        id: response.user.id,
                        email: response.user.email,
                        firstName: response.user.firstName,
                        lastName: response.user.lastName,
                        role: response.user.role.toUpperCase() as UserRole,
                        passwordHash: "",
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    });
                    return true;
                }
                return false;
            });
            return success ?? false;
        },

        /**
         * Verifica el token
         */
        verifyToken: async (): Promise<boolean> => {
            const success = await runAction(async () => {
                const response = await HttpClient.get<UserProfile>("/auth/me", {}, { requireAuth: true });
                if (response) {
                    set({ user: response.user, permissions: [] });
                }
                return true;
            });
            return success ?? false;
        },

        /**
         * Actualiza un usuario
         * @param user usuario a actualizar
         */
        updateUser: async (user: User): Promise<void> => {
            await runAction(async () => {
                const response = await HttpClient.put<User>("/auth/user", user, { requireAuth: true });
                if (response) {
                    set({
                        user: response,
                    });
                }
            });
        },

        /**
         * Cierra sesión y elimina los tokens
         */
        logout: () => {
            HttpClient.clearTokens();
            set({
                user: null,
                tokens: {
                    accessToken: "",
                    refreshToken: ""
                },
            });
        },
    };
});
