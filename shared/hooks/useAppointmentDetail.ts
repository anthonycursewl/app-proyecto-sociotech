import {
  fetchDedup,
  getCached,
  invalidate as invalidateCache,
  subscribeToAppointment,
} from "@/shared/cache/appointmentCache";
import { getApiErrorMessage } from "@/shared/errors/apiError";
import {
  appointmentService,
  Appointment,
} from "@/shared/services/appointment.service";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseAppointmentDetailResult {
  appointment: Appointment | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  refetch: () => Promise<void>;
  updateLocal: (data: Appointment) => void;
  invalidate: () => void;
}

export function useAppointmentDetail(id: string | null | undefined): UseAppointmentDetailResult {
  const [appointment, setAppointment] = useState<Appointment | null>(() =>
    id ? getCached(id) : null,
  );
  const [loading, setLoading] = useState<boolean>(!appointment);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  const requestIdRef = useRef(0);

  const load = useCallback(
    async (idToLoad: string, force = false) => {
      if (!idToLoad) return;

      const requestId = ++requestIdRef.current;

      if (!force) {
        const cached = getCached(idToLoad);
        if (cached) {
          setAppointment(cached);
          setLoading(false);
          setError(null);
          setNotFound(false);
          return;
        }
      }

      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const data = await fetchDedup(idToLoad, appointmentService.getById);
        if (requestIdRef.current !== requestId) return;
        setAppointment(data);
      } catch (err) {
        if (requestIdRef.current !== requestId) return;
        const status = (err as { status?: number })?.status;
        if (status === 404) {
          setNotFound(true);
          setAppointment(null);
        } else {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!id) {
      setAppointment(null);
      setLoading(false);
      setError(null);
      setNotFound(false);
      return;
    }

    const cached = getCached(id);
    if (cached) {
      setAppointment(cached);
      setLoading(false);
      setError(null);
      setNotFound(false);
    } else {
      setAppointment(null);
      setLoading(true);
    }

    void load(id);

    const unsubscribe = subscribeToAppointment(id, () => {
      const fresh = getCached(id);
      if (fresh) {
        setAppointment(fresh);
        setLoading(false);
        setError(null);
        setNotFound(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [id, load]);

  const refetch = useCallback(async () => {
    if (!id) return;
    invalidateCache(id);
    await load(id, true);
  }, [id, load]);

  const updateLocal = useCallback((data: Appointment) => {
    setAppointment(data);
  }, []);

  const invalidate = useCallback(() => {
    if (id) invalidateCache(id);
  }, [id]);

  return { appointment, loading, error, notFound, refetch, updateLocal, invalidate };
}
