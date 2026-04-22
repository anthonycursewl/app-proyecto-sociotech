import { User, UserProfile, UserRole } from "@/shared/entities/User";
import { HttpClient } from "@/shared/http/http.client";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
    setTokens: (tokens: {
        accessToken: string;
        refreshToken: string;
    }) => void;
    clearTokens: () => void;

    login: (email: string, password: string) => Promise<boolean>;
    register: (user: User) => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    logout: () => void;
    clearError: () => void;
    verifyToken: () => Promise<boolean>;
    saveSession: (tokens: { accessToken: string, refreshToken: string }) => Promise<void>;
    loadSession: () => Promise<void>;
    clearSession: () => Promise<void>;
}

interface AuthResponse {
    user: {
        id: string,
        email: string,
        firstName: string,
        lastName: string,
        role: UserRole
    },
    tokens: {
        accessToken: string,
        refreshToken: string
    }
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
        setTokens: (tokens: {
            accessToken: string;
            refreshToken: string;
        }) => set({ tokens }),

        // Stuff about session. This is to load session and re-create accessToken when gets invalid.
        clearTokens: () => set({ tokens: { accessToken: "", refreshToken: "" } }),
        saveSession: async (tokens: { accessToken: string, refreshToken: string }) => {
            await AsyncStorage.setItem("accessToken", tokens.accessToken);
            await AsyncStorage.setItem("refreshToken", tokens.refreshToken);
        },
        loadSession: async () => {
            const accessToken = await AsyncStorage.getItem("accessToken");
            const refreshToken = await AsyncStorage.getItem("refreshToken");
            if (accessToken && refreshToken) {
                set({ tokens: { accessToken, refreshToken } });
            }
        },
        clearSession: async () => {
            await AsyncStorage.removeItem("accessToken");
            await AsyncStorage.removeItem("refreshToken");
        },

        /**
         * Loggea un usuario y almacena los tokens
         * @param email email del usuario
         * @param password password del usuario
         */
        login: async (email: string, password: string): Promise<boolean> => {
            const success = await runAction(async () => {
                if (!email || !password) return false;
                const { setTokens, saveSession } = get()
                const response = await HttpClient.post<AuthResponse>("/auth/login", {
                    email: email,
                    password: password,
                });

                if (response) {
                    await saveSession(response.tokens);
                    setTokens(response.tokens);
                    return true;
                }
                return false;
            });
            return success ?? false;
        },

        /**
         * Registra un usuario
         * @param user usuario a registrar
         */
        register: async (user: User): Promise<void> => {
            await runAction(async () => {
                const { setTokens, saveSession } = get()
                const response = await HttpClient.post<AuthResponse>("/auth/register", user);
                if (response) {
                    await saveSession(response.tokens);
                    setTokens(response.tokens);
                }
            });
        },

        /**
         * Verifica el token
         */
        verifyToken: async (): Promise<boolean> => {
            const success = await runAction(async () => {
                const { loadSession } = get()
                await loadSession();
                const response = await HttpClient.get<UserProfile>("/auth/me", {}, true);
                if (response) set({ user: response.user, permissions: response.metadata.permissions });
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
                const response = await HttpClient.put<User>("/auth/user", user, {}, true);
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
            get().clearSession()
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