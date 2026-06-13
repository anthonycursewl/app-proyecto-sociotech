import { getApiErrorMessage } from "@/shared/errors/apiError";
import { medicalRecordService, MedicalRecordResponse } from "@/shared/services/medicalRecord.service";
import { useCallback, useEffect, useRef, useState } from "react";

export function useMyCreatedMedicalRecords(doctorId: string | null) {
  const [records, setRecords] = useState<MedicalRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetch = useCallback(async (isRefresh: boolean) => {
    if (!doctorId) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await medicalRecordService.getByDoctor(doctorId);
      setRecords(res);
      fetchedRef.current = true;
    } catch (err) {
      if (!fetchedRef.current) setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetch(false);
  }, [fetch]);

  const refresh = useCallback(() => fetch(true), [fetch]);
  const reload = useCallback(() => fetch(false), [fetch]);

  return { records, loading, refreshing, error, refresh, reload };
}
