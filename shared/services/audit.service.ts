import { HttpClient } from "@/shared/http/http.client";
import type { AuditLog, AuditLogListResponse, AuditQuery } from "@/shared/entities/AuditLog";

export type { AuditLog, AuditLogListResponse, AuditQuery };

export const auditService = {
  getAll: (params?: AuditQuery) =>
    HttpClient.get<AuditLogListResponse>(
      "/audit-logs",
      params as Record<string, unknown>,
      { requireAuth: true },
    ),

  getById: async (id: string) => {
    const response = await HttpClient.get<AuditLog>(
      `/audit-logs/${id}`,
      {},
      { requireAuth: true },
    );
    return (response as any).data ?? (response as any).log ?? (response as any).item ?? response;
  },
};
