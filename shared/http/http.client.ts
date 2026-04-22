import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.0.110:5002";

interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
}

export class HttpClient {
    private static async request<T>(
        endpoint: string,
        options?: RequestInit,
        requireAuth?: boolean
    ): Promise<T> {
        const url = `${BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(requireAuth && {
                    'Authorization': `Bearer ${await AsyncStorage.getItem("accessToken")}`
                }),
                ...options?.headers,
            },
        });
        if (!response.ok) {
            if (response.status === 401 && requireAuth) {
                const data = await fetch(`${BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        refreshToken: await AsyncStorage.getItem("refreshToken")
                    })
                });

                const { accessToken, refreshToken } = await data.json();
                await AsyncStorage.setItem("accessToken", accessToken);
                await AsyncStorage.setItem("refreshToken", refreshToken);

                const retry = await fetch(url, {
                    ...options,
                    headers: {
                        ...options?.headers,
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                return retry.json();
            }
            const error = await response.json();
            throw new Error(error.message);
        }
        return response.json();
    }

    static get<T>(
        endpoint: string,
        options?: RequestInit,
        requireAuth: boolean = false
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'GET',
        }, requireAuth);
    }

    static post<T>(
        endpoint: string,
        body?: any,
        options?: RequestInit,
        requireAuth: boolean = false
    ): Promise<T> {
        const b = body ? JSON.stringify(body) : undefined;

        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: b,
        }, requireAuth);
    }

    static put<T>(
        endpoint: string,
        body?: any,
        options?: RequestInit,
        requireAuth: boolean = false
    ): Promise<T> {
        const b = body ? JSON.stringify(body) : undefined;
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: b,
        }, requireAuth);
    }

    static delete<T>(
        endpoint: string,
        body?: any,
        options?: RequestInit,
        requireAuth: boolean = false
    ): Promise<T> {
        const b = body ? JSON.stringify(body) : undefined;
        return this.request<T>(endpoint, {
            ...options,
            method: 'DELETE',
            body: b,
        }, requireAuth);
    }
}