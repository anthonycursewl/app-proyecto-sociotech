import * as LucideIcons from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "./PatientCard.styles";

export interface PatientData {
  id: string;
  name: string;
  medicalId: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  lastVisit?: string;
  totalAppointments: number;
}

interface PatientCardProps {
  patient: PatientData;
  onPress?: () => void;
}

export const PatientCard = ({ patient, onPress }: PatientCardProps) => {
  const initials = patient.name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("");

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.nameSection}>
            <Text style={styles.name} numberOfLines={1}>{patient.name}</Text>
            <Text style={styles.medicalId}>{patient.medicalId}</Text>
          </View>
          <View style={[styles.statusBadge, patient.status === "active" ? styles.activeStatus : styles.inactiveStatus]}>
            <Text style={[styles.statusText, patient.status === "active" ? styles.activeText : styles.inactiveText]}>
              {patient.status === "active" ? "Activo" : "Inactivo"}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <LucideIcons.Calendar size={12} color="#94A3B8" strokeWidth={2} />
            <Text style={styles.statText}>{patient.totalAppointments} visitas</Text>
          </View>
          {patient.lastVisit && (
            <View style={styles.stat}>
              <LucideIcons.Clock size={12} color="#94A3B8" strokeWidth={2} />
              <Text style={styles.statText}>Última: {patient.lastVisit}</Text>
            </View>
          )}
        </View>

        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <LucideIcons.Mail size={12} color="#94A3B8" strokeWidth={2} />
            <Text style={styles.contactText}>{patient.email}</Text>
          </View>
          <View style={styles.contactItem}>
            <LucideIcons.Phone size={12} color="#94A3B8" strokeWidth={2} />
            <Text style={styles.contactText}>{patient.phone}</Text>
          </View>
        </View>
      </View>

      <View style={styles.chevron}>
        <LucideIcons.ChevronRight size={18} color="#CBD5E1" strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
};