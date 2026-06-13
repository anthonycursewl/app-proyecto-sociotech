import { PatientData } from "@/components/patients/PatientCard";
import { getApiErrorMessage } from "@/shared/errors/apiError";
import { mapToPatientData } from "@/shared/mappers/patient.mapper";
import { patientService } from "@/shared/services/patient.service";
import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

export function usePatientsList() {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  
  const filterRef = useRef<boolean | undefined>(undefined);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const fetchPatients = useCallback(async (cursor?: string, query?: string) => {
    const myRequest = ++requestIdRef.current;
    setLoading(true);
    try {
      if (query && query.trim()) {
        const results = await patientService.search(query.trim());
        const mapped = results.map(mapToPatientData);
        if (myRequest !== requestIdRef.current) return;
        setPatients(mapped);
        setNextCursor(null);
      } else {
        const response = await patientService.getAll({
          cursor,
          limit: PAGE_LIMIT,
          isActive: filterRef.current,
        });
        console.log("[usePatientsList] /patients/list response:", JSON.stringify(response, null, 2));
        const items = (response.data ?? (response as any).patients ?? []) as any[];
        const mapped = items.map(mapToPatientData);
        if (myRequest !== requestIdRef.current) return;
        setPatients((prev) => (cursor ? [...prev, ...mapped] : mapped));
        setNextCursor(response.nextCursor ?? null);
      }
      setError(null);
    } catch (err) {
      if (myRequest !== requestIdRef.current) return;
      setError(getApiErrorMessage(err));
    } finally {
      if (myRequest === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      await fetchPatients(undefined, searchQuery);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, fetchPatients]);

  // Effect for filter changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchPatients(undefined, "");
    }
  }, [activeFilter, fetchPatients, searchQuery]);

  const changeFilter = useCallback((filter: boolean | undefined) => {
    filterRef.current = filter;
    setActiveFilter(filter);
  }, []);

  const setQuery = useCallback((q: string) => {
    setSearchQuery(q);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPatients(undefined, searchQuery);
    setRefreshing(false);
  }, [fetchPatients, searchQuery]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore || searchQuery.trim()) return;
    setLoadingMore(true);
    await fetchPatients(nextCursor, "");
    setLoadingMore(false);
  }, [nextCursor, loadingMore, searchQuery, fetchPatients]);

  const reload = useCallback(async () => {
    await fetchPatients(undefined, searchQuery);
  }, [fetchPatients, searchQuery]);

  return {
    patients,
    loading,
    refreshing,
    loadingMore,
    error,
    activeFilter,
    changeFilter,
    searchQuery,
    setQuery,
    refresh,
    loadMore,
    reload,
  };
}
