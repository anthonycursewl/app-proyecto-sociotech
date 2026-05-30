import React from "react";
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
  servicePrice: number | null;
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

const STATUS_LABEL: Record<AdminAppointmentData["status"], string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

const STATUS_DOT: Record<AdminAppointmentData["status"], string> = {
  pending: "#F59E0B",
  confirmed: "#0D9488",
  completed: "#10B981",
  cancelled: "#EF4444",
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

const formatPrice = (price: number | null) => {
  if (price === null || price === undefined) return null;
  return `$${price.toLocaleString("es-ES")}`;
};

export const AdminAppointmentCard = ({
  appointment,
  onPress,
  onStatusChange,
}: AdminAppointmentCardProps) => {
  const date = formatLongDate(appointment.date);
  const priceLabel = formatPrice(appointment.servicePrice);
  const isCancelled = appointment.status === "cancelled";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.container, isCancelled && styles.containerCancelled]}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateWeekday}>{date.weekday}</Text>
          <Text style={styles.dateDay}>{date.day}</Text>
          <Text style={styles.dateMonth}>{date.month}</Text>
        </View>

        <View style={styles.headerMain}>
          <View style={styles.timeRow}>
            <Text style={styles.time}>{appointment.time}</Text>
            <Text style={styles.duration}>{appointment.durationMin} min</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: STATUS_DOT[appointment.status] }]} />
            <Text style={styles.statusLabel}>{STATUS_LABEL[appointment.status]}</Text>
          </View>
        </View>

        {priceLabel && (
          <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.price}>{priceLabel}</Text>
          </View>
        )}
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
            Cancelada el {formatDateTime(appointment.cancellation.cancelledAt)}
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
};
