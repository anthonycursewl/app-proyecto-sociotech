import { AppointmentData } from "@/components/appointments/AppointmentCard";
import { AdminAppointmentData } from "@/components/appointments/AdminAppointmentCard";
import { getApiErrorMessage } from "@/shared/errors/apiError";
import {
  mapToAdminAppointmentData,
  mapToAppointmentData,
} from "@/shared/mappers/appointment.mapper";
import { appointmentService } from "@/shared/services/appointment.service";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { useCallback, useEffect, useState } from "react";

const PAGE_LIMIT = 20;

export type AppointmentsListMode = "own" | "manage";

export function useAppointmentsList(mode: AppointmentsListMode) {
  const user = useAuthStore((s) => s.user);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [adminAppointments, setAdminAppointments] = useState<AdminAppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const defaultPatientName = user ? `${user.firstName} ${user.lastName}` : "Tú";

  const fetchAppointments = useCallback(
    async (cursor?: string) => {
      try {
        const params = { cursor, limit: PAGE_LIMIT };
        const response =
          mode === "own"
            ? await appointmentService.getMyAppointments(params)
            : await appointmentService.getAll(params);

        if (mode === "own") {
          const mapped = response.data.map((item) =>
            mapToAppointmentData(item, defaultPatientName),
          );
          setAppointments((prev) => (cursor ? [...prev, ...mapped] : mapped));
        } else {
          const mapped = response.data.map(mapToAdminAppointmentData);
          setAdminAppointments((prev) => (cursor ? [...prev, ...mapped] : mapped));
        }

        setNextCursor(response.nextCursor);
        setError(null);
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    },
    [mode, defaultPatientName],
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchAppointments();
      setLoading(false);
    })();
  }, [fetchAppointments]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  }, [fetchAppointments]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    await fetchAppointments(nextCursor);
    setLoadingMore(false);
  }, [nextCursor, loadingMore, fetchAppointments]);

  const reload = useCallback(async () => {
    setLoading(true);
    await fetchAppointments();
    setLoading(false);
  }, [fetchAppointments]);

  const list = mode === "own" ? appointments : adminAppointments;

  return {
    appointments: list,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
    reload,
  };
}
