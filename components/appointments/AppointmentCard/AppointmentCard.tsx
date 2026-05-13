import * as LucideIcons from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { Tag } from "../../common/Tag";
import { styles } from "./AppointmentCard.styles";

export interface AppointmentData {
  id: string;
  patientName: string;
  serviceName: string;
  doctorName: string;
  date: string;
  time: string;
  durationMin: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  location?: string;
}

interface AppointmentCardProps {
  appointment: AppointmentData;
  onPress?: () => void;
}

export const AppointmentCard = ({ appointment, onPress }: AppointmentCardProps) => {
  const statusConfig = {
    pending: { variant: "warning" as const, label: "Pendiente" },
    confirmed: { variant: "primary" as const, label: "Confirmada" },
    completed: { variant: "success" as const, label: "Completada" },
    cancelled: { variant: "default" as const, label: "Cancelada" },
  };

  const { variant, label } = statusConfig[appointment.status];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{appointment.time}</Text>
          <Text style={styles.duration}>{appointment.durationMin}min</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: variant === "warning" ? "#FEF3C7" : variant === "primary" ? "#E0F2F1" : variant === "success" ? "#DCFCE7" : "#F1F5F9" }]}>
          <Text style={[styles.statusText, { color: variant === "warning" ? "#D97706" : variant === "primary" ? "#0D9488" : variant === "success" ? "#22C55E" : "#64748B" }]}>{label}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.serviceName} numberOfLines={1}>{appointment.serviceName}</Text>
        <View style={styles.detailRow}>
          <LucideIcons.User size={14} color="#64748B" strokeWidth={2} />
          <Text style={styles.detailText}>{appointment.doctorName}</Text>
        </View>
        <View style={styles.detailRow}>
          <LucideIcons.Calendar size={14} color="#64748B" strokeWidth={2} />
          <Text style={styles.detailText}>{formatDate(appointment.date)}</Text>
        </View>
        {appointment.location && (
          <View style={styles.detailRow}>
            <LucideIcons.MapPin size={14} color="#64748B" strokeWidth={2} />
            <Text style={styles.detailText}>{appointment.location}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Tag label={appointment.serviceName} variant="default" />
      </View>
    </TouchableOpacity>
  );
};