import { HttpClient } from "@/shared/http/http.client";
import type { PaginatedNotificationsResponse } from "@/shared/entities/Notification";

export type { NotificationItem, PaginatedNotificationsResponse } from "@/shared/entities/Notification";

export const notificationService = {
  getAll: (params?: { cursor?: string; limit?: number; status?: string; eventType?: string }) =>
    HttpClient.get<PaginatedNotificationsResponse>("/notifications", params as any, { requireAuth: true }),
};
