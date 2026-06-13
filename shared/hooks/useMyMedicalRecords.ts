import { getApiErrorMessage } from "@/shared/errors/apiError";
import { medicalRecordService, MedicalRecordResponse } from "@/shared/services/medicalRecord.service";
import { useCallback, useEffect, useState } from "react";

export function useMyMedicalRecords() {
  const [records, setRecords] = useState<MedicalRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (isRefresh: boolean) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await medicalRecordService.getMyRecords();
      setRecords(res);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetch(false);
  }, [fetch]);

  const refresh = useCallback(() => fetch(true), [fetch]);
  const reload = useCallback(() => fetch(false), [fetch]);

  return { records, loading, refreshing, error, refresh, reload };
}
