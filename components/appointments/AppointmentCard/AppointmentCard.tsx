import React, { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { formatToAMPM } from "@/shared/utils/date.utils";
import { styles } from "./AppointmentCard.styles";

export interface AppointmentData {
  id: string;
  patientName: string;
  doctorName: string;
  doctorSpecialty: string | null;
  doctorPhone: string | null;
  serviceName: string;
  serviceDescription: string | null;
  date: string;
  time: string;
  durationMin: number;
  reason: string;
  notes: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

interface AppointmentCardProps {
  appointment: AppointmentData;
  onPress?: () => void;
}

const STATUS_META: Record<AppointmentData["status"], { label: string; color: string; bg: string }> = {
  pending: { label: "Pendiente", color: "#B45309", bg: "#FEF3C7" },
  confirmed: { label: "Confirmada", color: "#0D9488", bg: "#E0F2F1" },
  completed: { label: "Completada", color: "#15803D", bg: "#DCFCE7" },
  cancelled: { label: "Cancelada", color: "#B91C1C", bg: "#FEE2E2" },
};

const EXPIRED_META = { label: "Vencida", color: "#9CA3AF" };

const isDatePast = (dateStr: string): boolean => {
  if (!dateStr || dateStr === "—") return false;
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

const formatLongDate = (dateStr: string) => {
  if (!dateStr || dateStr === "—") return { day: "—", month: "", weekday: "" };
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return { day: dateStr, month: "", weekday: "" };
  }
  return {
    day: date.toLocaleDateString("es-ES", { day: "numeric" }),
    month: date.toLocaleDateString("es-ES", { month: "short" }).replace(".", ""),
    weekday: date.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", ""),
  };
};

export const AppointmentCard = React.memo(function AppointmentCard({ appointment, onPress }: AppointmentCardProps) {
  const date = useMemo(() => formatLongDate(appointment.date), [appointment.date]);
  const { isCancelled, isExpired, statusMeta } = useMemo(() => {
    const cancelled = appointment.status === "cancelled";
    const expired = !cancelled && appointment.status !== "completed" && isDatePast(appointment.date);
    const meta = expired ? EXPIRED_META : STATUS_META[appointment.status];
    return { isCancelled: cancelled, isExpired: expired, statusMeta: meta };
  }, [appointment.status, appointment.date]);
  const dotStyle = useMemo(() => ({ backgroundColor: statusMeta.color }), [statusMeta.color]);
  const labelStyle = useMemo(() => ({ color: statusMeta.color }), [statusMeta.color]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, (isCancelled || isExpired) && styles.containerMuted]}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateWeekday}>{date.weekday}</Text>
          <Text style={[styles.dateDay, isExpired && styles.dateDayMuted]}>{date.day}</Text>
          <Text style={styles.dateMonth}>{date.month}</Text>
        </View>

        <View style={styles.headerMain}>
        <View style={styles.timeRow}>
          <Text style={[styles.time, isExpired && styles.timeMuted]}>{formatToAMPM(appointment.time)}</Text>
          <Text style={styles.duration}>{appointment.durationMin} min</Text>
        </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, dotStyle]} />
            <Text style={[styles.statusLabel, labelStyle]}>
              {statusMeta.label}
            </Text>
          </View>
        </View>

      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Servicio</Text>
        <Text style={styles.serviceName} numberOfLines={2}>
          {appointment.serviceName}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Profesional</Text>
        <Text style={styles.metaName} numberOfLines={1}>
          {appointment.doctorName}
        </Text>
        {appointment.doctorSpecialty && (
          <Text style={styles.metaSubtext} numberOfLines={1}>
            {appointment.doctorSpecialty}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Motivo de consulta</Text>
        <Text style={styles.reasonText} numberOfLines={3}>
          {appointment.reason}
        </Text>
        {appointment.notes && (
          <Text style={styles.notesText} numberOfLines={3}>
            {appointment.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});
