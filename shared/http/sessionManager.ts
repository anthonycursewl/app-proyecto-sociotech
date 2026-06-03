import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { HttpClient } from "./http.client";

let initialized = false;

export function initSessionManager() {
    if (initialized) return;
    initialized = true;

    HttpClient.onSessionExpired = () => {
        useAuthStore.getState().logout();
    };
}
