import * as SecureStore from 'expo-secure-store';

const BASE_URL = __DEV__
    ? process.env.EXPO_PUBLIC_API_URL_DEV
    : process.env.EXPO_PUBLIC_API_URL_PROD;

if (!BASE_URL) {
    const envType = __DEV__ ? 'EXPO_PUBLIC_API_URL_DEV' : 'EXPO_PUBLIC_API_URL_PROD';
    throw new Error(`Falta la variable de entorno ${envType}. Revisa tu archivo .env.`);
}

export interface RequestOptions extends RequestInit {
    params?: Record<string, any>;
    timeout?: number;
    requireAuth?: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: {
        nextCursor?: string | null;
        hasMore?: boolean;
    };
}

export interface ApiErrorResponse {
    success: boolean;
    statusCode: number;
    message: string;
    error: string;
    timestamp: string;
    path: string;
}

export class ApiError extends Error {
    constructor(public status: number, message: string, public data?: ApiErrorResponse) {
        super(message);
        this.name = 'ApiError';
    }
}

export class SessionExpiredError extends ApiError {
    constructor() {
        super(401, 'Su sesión ha expirado. Inicie sesión nuevamente.');
        this.name = 'SessionExpiredError';
    }
}

type RefreshSubscriber = (token: string | null, error?: Error) => void;

export class HttpClient {
    public static onSessionExpired: (() => void) | null = null;
    private static isRefreshing = false;
    private static refreshSubscribers: RefreshSubscriber[] = [];

    private static serializeParams(params?: Record<string, any>): string {
        if (!params || Object.keys(params).length === 0) return '';
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });
        return `?${searchParams.toString()}`;
    }

    public static async getAccessToken() { return await SecureStore.getItemAsync('accessToken'); }
    private static async getRefreshToken() { return await SecureStore.getItemAsync('refreshToken'); }
    public static async saveTokens(at: string, rt: string) {
        await SecureStore.setItemAsync('accessToken', at);
        await SecureStore.setItemAsync('refreshToken', rt);
    }
    public static async clearTokens() {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
    }

    private static notifySubscribers(token: string | null, error?: Error) {
        const subs = this.refreshSubscribers;
        this.refreshSubscribers = [];
        subs.forEach(cb => cb(token, error));
    }

    private static async refreshTokens(): Promise<string> {
        const rt = await this.getRefreshToken();
        if (!rt) throw new SessionExpiredError();

        const res = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: rt }),
        });

        if (!res.ok) {
            throw new SessionExpiredError();
        }

        const json = await res.json();
        const data = json?.success !== undefined ? json.data : json;
        if (!data.accessToken || !data.refreshToken) {
            throw new SessionExpiredError();
        }

        await this.saveTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
    }

    public static async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const {
            params,
            timeout = 15000,
            requireAuth = false,
            ...fetchOptions
        } = options;

        const url = `${BASE_URL}${endpoint}${this.serializeParams(params)}`;

        const headers = new Headers(fetchOptions.headers || {});

        if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json');
        }

        const buildController = () => {
            const c = new AbortController();
            const id = setTimeout(() => c.abort(), timeout);
            return { controller: c, timeoutId: id };
        };

        const execute = async (token?: string | null) => {
            const { controller, timeoutId } = buildController();
            if (requireAuth && token) {
                headers.set('Authorization', `Bearer ${token}`);
            }

            try {
                return await fetch(url, {
                    ...fetchOptions,
                    headers,
                    signal: controller.signal,
                });
            } finally {
                clearTimeout(timeoutId);
            }
        };

        try {
            const token = requireAuth ? await this.getAccessToken() : null;
            let response = await execute(token);

            if (response.status === 401 && requireAuth && !endpoint.startsWith('/auth/refresh')) {
                if (this.isRefreshing) {
                    return new Promise<T>((resolve, reject) => {
                        this.refreshSubscribers.push((newToken, err) => {
                            if (err) return reject(err);
                            this.request<T>(endpoint, options).then(resolve).catch(reject);
                        });
                    });
                }

                this.isRefreshing = true;
                try {
                    const newToken = await this.refreshTokens();
                    this.isRefreshing = false;
                    this.notifySubscribers(newToken);
                    response = await execute(newToken);
                } catch (err) {
                    this.isRefreshing = false;
                    this.notifySubscribers(null, err instanceof Error ? err : new Error('Error al renovar la sesión'));
                    await this.clearTokens();
                    this.onSessionExpired?.();
                    throw new SessionExpiredError();
                }
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})) as ApiErrorResponse;
                throw new ApiError(
                    response.status,
                    errorData.message || `Error de API: ${response.status}`,
                    errorData
                );
            }

            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/octet-stream') || contentType?.includes('application/pdf')) {
                return (await response.blob()) as unknown as T;
            }

            if (contentType?.includes('application/json')) {
                const json = await response.json() as ApiResponse<T>;
                if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
                    if (json.meta) {
                        if (Array.isArray(json.data)) {
                            return {
                                data: json.data,
                                nextCursor: json.meta.nextCursor ?? null,
                                hasNext: json.meta.hasMore ?? false,
                            } as unknown as T;
                        }
                        if (typeof json.data === 'object' && json.data !== null) {
                            return {
                                ...json.data,
                                nextCursor: json.meta.nextCursor ?? null,
                                hasNext: json.meta.hasMore ?? false,
                            } as unknown as T;
                        }
                    }
                    return json.data;
                }
                return json as unknown as T;
            }
            return (await response.text()) as unknown as T;

        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new Error(`La solicitud tardó demasiado después de ${timeout}ms`);
            }
            if (error instanceof ApiError) throw error;
            console.error(`[HttpClient] Request to ${endpoint} failed:`, error.message);
            throw error;
        }
    }

    static async get<T>(endpoint: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET', params });
    }

    static async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body)
        });
    }

    static async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: body instanceof FormData ? body : JSON.stringify(body)
        });
    }

    static async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}
