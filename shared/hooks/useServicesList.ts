import { ServiceData } from "@/components/services/ServiceCard";
import { getApiErrorMessage } from "@/shared/errors/apiError";
import type { ServiceStatusFilter } from "@/shared/entities/Service";
import { ServiceResponse, serviceService } from "@/shared/services/service.service";
import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_LIMIT = 20;
const DEFAULT_STATUS: ServiceStatusFilter = "active";

const mapService = (s: ServiceResponse): ServiceData => ({
  id: s.id,
  name: s.name,
  description: s.description ?? "",
  durationMin: s.durationMin,
  price: s.price ?? 0,
  isActive: s.isActive,
});

export function useServicesList(initialStatus: ServiceStatusFilter = DEFAULT_STATUS) {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ServiceStatusFilter>(initialStatus);

  const statusRef = useRef(status);
  statusRef.current = status;

  const fetchServices = useCallback(async (cursor?: string) => {
    try {
      const params: { cursor?: string; limit: number; status: ServiceStatusFilter } = {
        limit: PAGE_LIMIT,
        status: statusRef.current,
      };
      if (cursor) params.cursor = cursor;

      const response = await serviceService.getAll(params);
      const mapped = response.data.map(mapService);
      if (cursor) {
        setServices((prev) => [...prev, ...mapped]);
      } else {
        setServices(mapped);
      }
      setNextCursor(response.nextCursor);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    await fetchServices();
    setLoading(false);
  }, [fetchServices]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    setServices([]);
    setNextCursor(null);
    setError(null);
    loadInitial();
  }, [status, loadInitial]);

  const changeStatus = useCallback((next: ServiceStatusFilter) => {
    setStatus(next);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  }, [fetchServices]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    await fetchServices(nextCursor);
    setLoadingMore(false);
  }, [nextCursor, loadingMore, fetchServices]);

  const reload = useCallback(async () => {
    setLoading(true);
    await fetchServices();
    setLoading(false);
  }, [fetchServices]);

  return {
    services,
    loading,
    refreshing,
    loadingMore,
    error,
    status,
    changeStatus,
    refresh,
    loadMore,
    reload,
    fetchServices,
  };
}
