import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { styles } from "./AppointmentCard.styles";

export interface AppointmentData {
  id: string;
  patientName: string;
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
}

interface AppointmentCardProps {
  appointment: AppointmentData;
  onPress?: () => void;
}

const STATUS_LABEL: Record<AppointmentData["status"], string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
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

const formatPrice = (price: number | null) => {
  if (price === null || price === undefined) return null;
  return `$${price.toLocaleString("es-ES")}`;
};

export const AppointmentCard = ({ appointment, onPress }: AppointmentCardProps) => {
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
          <Text style={styles.statusLabel}>{STATUS_LABEL[appointment.status]}</Text>
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
};
