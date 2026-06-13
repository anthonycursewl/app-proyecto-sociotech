import { HttpClient } from "@/shared/http/http.client";
import { User } from "@/shared/entities/User";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface MeResponse {
  user: User;
}

export interface SendVerificationCodeRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface ApiMessageResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  password: string;
}

export const authService = {
  login: (data: LoginRequest) =>
    HttpClient.post<AuthResponse>("/auth/login", data),

  register: (data: RegisterRequest) =>
    HttpClient.post<AuthResponse>("/auth/register", data),

  me: () =>
    HttpClient.get<MeResponse>("/auth/me", {}, { requireAuth: true }),

  updateUser: (user: User) =>
    HttpClient.put<User>("/auth/user", user, { requireAuth: true }),

  sendVerificationCode: (data: SendVerificationCodeRequest) =>
    HttpClient.post<ApiMessageResponse>("/auth/send-verification-code", data),

  verifyCode: (data: VerifyCodeRequest) =>
    HttpClient.post<ApiMessageResponse>("/auth/verify-code", data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    HttpClient.post<ApiMessageResponse>("/auth/forgot-password", data),

  resetPassword: (data: ResetPasswordRequest) =>
    HttpClient.post<ApiMessageResponse>("/auth/reset-password", data),
};
