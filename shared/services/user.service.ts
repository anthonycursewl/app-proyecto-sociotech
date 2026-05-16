import { HttpClient } from "@/shared/http/http.client";

export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
}

export interface UserProfileResponse {
  user: {
    id: string;
    email: string;
    passwordHash: string;
    roleId: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    refreshToken: string | null;
    refreshTokenExpires: string | null;
    createdAt: string;
    updatedAt: string;
    permissions: string[];
    roleName: string;
  };
}

export const userService = {
  updateProfile: (data: UpdateUserProfileData) =>
    HttpClient.put<UserProfileResponse>("/users/me/profile", data, { requireAuth: true }),
};
