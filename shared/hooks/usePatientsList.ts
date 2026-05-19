import { PatientData } from "@/components/patients/PatientCard";
import { getApiErrorMessage } from "@/shared/errors/apiError";
import { mapToPatientData } from "@/shared/mappers/patient.mapper";
import { patientService } from "@/shared/services/patient.service";
import { useCallback, useEffect, useState } from "react";

const PAGE_LIMIT = 20;

export function usePatientsList() {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async (cursor?: string) => {
    try {
      const response = await patientService.getAll({
        cursor,
        limit: PAGE_LIMIT,
      });
      const mapped = response.data.map(mapToPatientData);
      setPatients((prev) => (cursor ? [...prev, ...mapped] : mapped));
      setNextCursor(response.nextCursor);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchPatients();
      setLoading(false);
    })();
  }, [fetchPatients]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
  }, [fetchPatients]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    await fetchPatients(nextCursor);
    setLoadingMore(false);
  }, [nextCursor, loadingMore, fetchPatients]);

  const reload = useCallback(async () => {
    setLoading(true);
    await fetchPatients();
    setLoading(false);
  }, [fetchPatients]);

  return {
    patients,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
    reload,
  };
}
