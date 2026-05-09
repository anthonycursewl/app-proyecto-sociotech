import * as LucideIcons from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Tag } from "../../common/Tag";
import { styles } from "./AdminAppointmentCard.styles";

export interface AdminAppointmentData {
  id: string;
  patientName: string;
  patientId: string;
  serviceName: string;
  doctorName: string;
  date: string;
  time: string;
  durationMin: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  location?: string;
  phone?: string;
}

interface AdminAppointmentCardProps {
  appointment: AdminAppointmentData;
  onPress?: () => void;
  onStatusChange?: (status: string) => void;
}

export const AdminAppointmentCard = ({ appointment, onPress, onStatusChange }: AdminAppointmentCardProps) => {
  const statusConfig = {
    pending: { variant: "warning" as const, label: "Pendiente", bgColor: "#FEF3C7", textColor: "#D97706" },
    confirmed: { variant: "primary" as const, label: "Confirmada", bgColor: "#E0F2F1", textColor: "#0D9488" },
    completed: { variant: "success" as const, label: "Completada", bgColor: "#DCFCE7", textColor: "#22C55E" },
    cancelled: { variant: "default" as const, label: "Cancelada", bgColor: "#F1F5F9", textColor: "#64748B" },
  };

  const { bgColor, textColor, label } = statusConfig[appointment.status];

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
      <View style={styles.timeColumn}>
        <Text style={styles.time}>{appointment.time}</Text>
        <Text style={styles.duration}>{appointment.durationMin}min</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName} numberOfLines={1}>{appointment.patientName}</Text>
            <Text style={styles.patientId}>{appointment.patientId}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
            <Text style={[styles.statusText, { color: textColor }]}>{label}</Text>
          </View>
        </View>

        <View style={styles.serviceInfo}>
          <LucideIcons.Stethoscope size={14} color="#64748B" strokeWidth={2} />
          <Text style={styles.serviceText}>{appointment.serviceName}</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <LucideIcons.User size={12} color="#94A3B8" strokeWidth={2} />
            <Text style={styles.detailText}>{appointment.doctorName}</Text>
          </View>
          <View style={styles.detailItem}>
            <LucideIcons.Calendar size={12} color="#94A3B8" strokeWidth={2} />
            <Text style={styles.detailText}>{formatDate(appointment.date)}</Text>
          </View>
          {appointment.location && (
            <View style={styles.detailItem}>
              <LucideIcons.MapPin size={12} color="#94A3B8" strokeWidth={2} />
              <Text style={styles.detailText}>{appointment.location}</Text>
            </View>
          )}
        </View>

        {appointment.phone && (
          <View style={styles.phoneRow}>
            <LucideIcons.Phone size={12} color="#4CB1B1" strokeWidth={2} />
            <Text style={styles.phoneText}>{appointment.phone}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};