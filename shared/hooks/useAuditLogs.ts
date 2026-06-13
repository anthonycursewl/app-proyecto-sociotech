import { getApiErrorMessage } from "@/shared/errors/apiError";
import type { AuditLog, AuditActionFilter, AuditResourceFilter, AuditResultFilter } from "@/shared/entities/AuditLog";
import { auditService } from "@/shared/services/audit.service";
import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_LIMIT = 20;

export interface AuditFilters {
  action: AuditActionFilter;
  resource: AuditResourceFilter;
  result: AuditResultFilter;
  userId?: string;
  resourceId?: string;
  from?: string;
  to?: string;
}

export function useAuditLogs(filters: AuditFilters) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtersRef = useRef(filters);

  const fetchLogs = useCallback(async (cursor?: string) => {
    try {
      const params: Record<string, unknown> = { limit: PAGE_LIMIT };
      if (cursor) params.cursor = cursor;
      if (filtersRef.current.action !== "all") params.action = filtersRef.current.action;
      if (filtersRef.current.resource !== "all") params.resourceType = filtersRef.current.resource;
      if (filtersRef.current.result !== "all") params.result = filtersRef.current.result;
      if (filtersRef.current.userId) params.userId = filtersRef.current.userId;
      if (filtersRef.current.resourceId) params.resourceId = filtersRef.current.resourceId;
      if (filtersRef.current.from) params.from = filtersRef.current.from;
      if (filtersRef.current.to) params.to = filtersRef.current.to;

      const response = await auditService.getAll(params);
      const logsArray = Array.isArray(response)
        ? response
        : Array.isArray(response.data)
          ? response.data
          : response.logs ?? [];
      setLogs((prev) => (cursor ? [...prev, ...logsArray] : logsArray));
      setNextCursor(
        Array.isArray(response)
          ? null
          : (response as any).nextCursor ?? (response as any).meta?.nextCursor ?? null
      );
      setHasNext(
        Array.isArray(response)
          ? false
          : (response as any).hasNext ?? (response as any).meta?.hasMore ?? false
      );
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    filtersRef.current = filters;
    setLogs([]);
    setNextCursor(null);
    setHasNext(false);
    setLoading(true);
    fetchLogs().then(() => setLoading(false));
  }, [
    filters.action,
    filters.resource,
    filters.result,
    filters.userId,
    filters.resourceId,
    filters.from,
    filters.to,
    fetchLogs,
  ]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  }, [fetchLogs]);

  const loadMore = useCallback(async () => {
    if (!hasNext || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    await fetchLogs(nextCursor);
    setLoadingMore(false);
  }, [hasNext, nextCursor, loadingMore, fetchLogs]);

  const reload = useCallback(async () => {
    setLoading(true);
    await fetchLogs();
    setLoading(false);
  }, [fetchLogs]);

  return {
    logs,
    loading,
    refreshing,
    loadingMore,
    hasNext,
    error,
    refresh,
    loadMore,
    reload,
  };
}
