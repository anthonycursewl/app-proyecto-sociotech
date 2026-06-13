import React, { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { styles } from "./AdminAppointmentCard.styles";

export interface AdminAppointmentData {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string | null;
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
  cancellation: {
    cancelledAt: string;
    cancelledBy: string;
    cancellationReason: string | null;
  } | null;
}

interface AdminAppointmentCardProps {
  appointment: AdminAppointmentData;
  onPress?: () => void;
  onStatusChange?: (status: string) => void;
}

const STATUS_META: Record<AdminAppointmentData["status"], { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "#B45309" },
  confirmed: { label: "Confirmada", color: "#0D9488" },
  completed: { label: "Completada", color: "#15803D" },
  cancelled: { label: "Cancelada", color: "#B91C1C" },
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

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const AdminAppointmentCard = React.memo(function AdminAppointmentCard({
  appointment,
  onPress,
  onStatusChange,
}: AdminAppointmentCardProps) {
  const date = useMemo(() => formatLongDate(appointment.date), [appointment.date]);
  const cancellationDate = useMemo(
    () => appointment.cancellation ? formatDateTime(appointment.cancellation.cancelledAt) : null,
    [appointment.cancellation],
  );
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
            <Text style={[styles.time, isExpired && styles.timeMuted]}>{appointment.time}</Text>
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
        {appointment.serviceDescription && (
          <Text style={styles.serviceDescription} numberOfLines={2}>
            {appointment.serviceDescription}
          </Text>
        )}
      </View>

      <View style={styles.peopleRow}>
        <View style={styles.personBlock}>
          <View style={styles.personHeader}>
            <Text style={styles.sectionLabel}>Paciente</Text>
            <Text style={styles.personId}>#{appointment.patientId.slice(0, 8)}</Text>
          </View>
          <Text style={styles.personName} numberOfLines={1}>
            {appointment.patientName}
          </Text>
          {appointment.patientPhone && (
            <Text style={styles.personDetail} numberOfLines={1}>
              {appointment.patientPhone}
            </Text>
          )}
        </View>

        <View style={styles.personBlock}>
          <Text style={styles.sectionLabel}>Profesional</Text>
          <Text style={styles.personName} numberOfLines={1}>
            {appointment.doctorName}
          </Text>
          {appointment.doctorSpecialty && (
            <Text style={styles.personDetail} numberOfLines={1}>
              {appointment.doctorSpecialty}
              {appointment.doctorPhone && ` · ${appointment.doctorPhone}`}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Motivo de consulta</Text>
        <Text style={styles.reasonText} numberOfLines={4}>
          {appointment.reason}
        </Text>
        {appointment.notes && (
          <>
            <Text style={styles.notesLabel}>Notas</Text>
            <Text style={styles.notesText} numberOfLines={4}>
              {appointment.notes}
            </Text>
          </>
        )}
      </View>

      {appointment.cancellation && (
        <View style={styles.cancellationBlock}>
          <Text style={styles.cancellationLabel}>
            Cancelada el {cancellationDate}
          </Text>
          {appointment.cancellation.cancellationReason && (
            <Text style={styles.cancellationReason} numberOfLines={2}>
              {appointment.cancellation.cancellationReason}
            </Text>
          )}
        </View>
      )}

      {onStatusChange && !isCancelled && (
        <View style={styles.actionsRow}>
          {appointment.status === "pending" && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onStatusChange("CONFIRMED")}
            >
              <Text style={styles.actionText}>Confirmar</Text>
            </TouchableOpacity>
          )}
          {appointment.status === "confirmed" && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onStatusChange("COMPLETED")}
            >
              <Text style={styles.actionText}>Marcar completada</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
});
