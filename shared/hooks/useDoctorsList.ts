import { DoctorData } from "@/components/doctors/DoctorCard";
import { getApiErrorMessage } from "@/shared/errors/apiError";
import { mapToDoctorData } from "@/shared/mappers/doctor.mapper";
import { doctorService } from "@/shared/services/doctor.service";
import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_LIMIT = 20;
const CACHE_TTL = 30_000;

interface CacheEntry {
  data: { items: DoctorData[]; nextCursor: string | null };
  timestamp: number;
}

export function useDoctorsList() {
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const filterRef = useRef<boolean | undefined>(undefined);
  const searchRef = useRef("");
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const abortRef = useRef<AbortController | null>(null);

  const getCacheKey = useCallback((cursor: string | undefined, filter: boolean | undefined, search: string) => {
    return `${cursor ?? "first"}|${filter ?? "all"}|${search}`;
  }, []);

  const fetchDoctors = useCallback(async (cursor?: string) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const cacheKey = getCacheKey(cursor, filterRef.current, searchRef.current);
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      if (!cursor) {
        setDoctors(cached.data.items);
        setNextCursor(cached.data.nextCursor);
      }
      return;
    }

    try {
      const response = await doctorService.getAll({
        cursor,
        limit: PAGE_LIMIT,
        isActive: filterRef.current,
      });
      const mapped = response.doctors.map(mapToDoctorData);
      setDoctors((prev) => (cursor ? [...prev, ...mapped] : mapped));
      setNextCursor(response.nextCursor);
      setError(null);

      cacheRef.current.set(cacheKey, {
        data: { items: mapped, nextCursor: response.nextCursor },
        timestamp: Date.now(),
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(getApiErrorMessage(err));
      }
    }
  }, [getCacheKey]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setDoctors([]);
      setNextCursor(null);
      await fetchDoctors();
      setLoading(false);
    })();
  }, [fetchDoctors, searchQuery, activeFilter]);

  const changeSearch = useCallback((query: string) => {
    searchRef.current = query;
    setSearchQuery(query);
  }, []);

  const changeFilter = useCallback((filter: boolean | undefined) => {
    filterRef.current = filter;
    setActiveFilter(filter);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    cacheRef.current.clear();
    setDoctors([]);
    setNextCursor(null);
    await fetchDoctors();
    setRefreshing(false);
  }, [fetchDoctors]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    await fetchDoctors(nextCursor);
    setLoadingMore(false);
  }, [nextCursor, loadingMore, fetchDoctors]);

  const reload = useCallback(async () => {
    cacheRef.current.clear();
    setLoading(true);
    setDoctors([]);
    setNextCursor(null);
    await fetchDoctors();
    setLoading(false);
  }, [fetchDoctors]);

  const invalidateCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    doctors,
    loading,
    refreshing,
    loadingMore,
    error,
    searchQuery,
    activeFilter,
    changeSearch,
    changeFilter,
    refresh,
    loadMore,
    reload,
    invalidateCache,
  };
}
