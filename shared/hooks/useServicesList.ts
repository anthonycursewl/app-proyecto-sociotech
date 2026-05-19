import { ServiceData } from "@/components/services/ServiceCard";
import { getApiErrorMessage } from "@/shared/errors/apiError";
import { ServiceResponse, serviceService } from "@/shared/services/service.service";
import { useCallback, useEffect, useState } from "react";

const PAGE_LIMIT = 20;

const mapService = (s: ServiceResponse): ServiceData => ({
  id: s.id,
  name: s.name,
  description: s.description ?? "",
  durationMin: s.durationMin,
  price: s.price ?? 0,
  isActive: s.isActive,
});

export function useServicesList() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async (cursor?: string) => {
    try {
      const response = await serviceService.getAll({
        cursor,
        limit: PAGE_LIMIT,
        includeInactive: true,
      });
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
    refresh,
    loadMore,
    reload,
    fetchServices,
  };
}
