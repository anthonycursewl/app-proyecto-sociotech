import { AppointmentData } from "@/components/appointments/AppointmentCard";
import { AdminAppointmentData } from "@/components/appointments/AdminAppointmentCard";
import { getApiErrorMessage } from "@/shared/errors/apiError";
import {
  mapToAdminAppointmentData,
  mapToAppointmentData,
} from "@/shared/mappers/appointment.mapper";
import {
  appointmentService,
  AppointmentFilter,
} from "@/shared/services/appointment.service";
import { useCallback, useEffect, useRef, useState } from "react";

export type AppointmentsListMode = "own" | "manage";

export function useAppointmentsList(mode: AppointmentsListMode, defaultFilter: AppointmentFilter = "upcoming", doctorId?: string) {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [adminAppointments, setAdminAppointments] = useState<AdminAppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AppointmentFilter>(defaultFilter);
  const fetchIdRef = useRef(0);
  const initialisedRef = useRef(false);

  useEffect(() => {
    if (!initialisedRef.current) {
      initialisedRef.current = true;
      return;
    }
    setFilter(defaultFilter);
  }, [defaultFilter]);

  const fetchAppointments = useCallback(async (activeFilter: AppointmentFilter) => {
    const id = ++fetchIdRef.current;
    try {
      if (mode === "own") {
        const res = await appointmentService.getMyAppointments(activeFilter);
        if (id !== fetchIdRef.current) return;
        const mapped = (Array.isArray(res) ? res : []).map(mapToAppointmentData);
        setAppointments(mapped);
      } else {
        const res = await appointmentService.getAll(activeFilter, doctorId);
        if (id !== fetchIdRef.current) return;
        const mapped = (Array.isArray(res) ? res : []).map(mapToAdminAppointmentData);
        setAdminAppointments(mapped);
      }
      setError(null);
    } catch (err) {
      if (id !== fetchIdRef.current) return;
      setError(getApiErrorMessage(err));
    }
  }, [mode, doctorId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchAppointments(filter);
      setLoading(false);
    })();
  }, [fetchAppointments, filter]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAppointments(filter);
    setRefreshing(false);
  }, [fetchAppointments, filter]);

  const reload = useCallback(async () => {
    setLoading(true);
    await fetchAppointments(filter);
    setLoading(false);
  }, [fetchAppointments, filter]);

  const list = mode === "own" ? appointments : adminAppointments;

  return {
    appointments: list,
    loading,
    refreshing,
    error,
    filter,
    setFilter,
    refresh,
    reload,
  };
}
