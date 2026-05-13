import * as LucideIcons from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { styles } from "./AdminRecordCard.styles";

export interface AdminRecordData {
  id: string;
  patientName: string;
  patientId: string;
  type: "consultation" | "prescription" | "exam" | "procedure";
  title: string;
  description: string;
  date: string;
  doctorName: string;
  specialty: string;
  phone?: string;
}

interface AdminRecordCardProps {
  record: AdminRecordData;
  onPress?: () => void;
}

export const AdminRecordCard = ({ record, onPress }: AdminRecordCardProps) => {
  const typeConfig = {
    consultation: { icon: LucideIcons.FileText, color: "#4CB1B1", bgColor: "#E0F2F1", label: "Consulta" },
    prescription: { icon: LucideIcons.Pill, color: "#8B5CF6", bgColor: "#F3E8FF", label: "Receta" },
    exam: { icon: LucideIcons.TestTube, color: "#F59E0B", bgColor: "#FEF3C7", label: "Examen" },
    procedure: { icon: LucideIcons.Scissors, color: "#EF4444", bgColor: "#FEE2E2", label: "Procedimiento" },
  };

  const typeStyle = typeConfig[record.type];
  const IconComponent = typeStyle.icon;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: typeStyle.bgColor }]}>
          <IconComponent size={18} color={typeStyle.color} strokeWidth={2.5} />
        </View>
        <View style={styles.patientSection}>
          <Text style={styles.patientName} numberOfLines={1}>{record.patientName}</Text>
          <Text style={styles.patientId}>{record.patientId}</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: typeStyle.bgColor }]}>
          <Text style={[styles.typeText, { color: typeStyle.color }]}>{typeStyle.label}</Text>
        </View>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={1}>{record.title}</Text>
        <Text style={styles.date}>{formatDate(record.date)}</Text>
      </View>

      <Text style={styles.description} numberOfLines={2}>{record.description}</Text>

      <View style={styles.footer}>
        <View style={styles.doctorInfo}>
          <LucideIcons.Stethoscope size={12} color="#94A3B8" strokeWidth={2} />
          <Text style={styles.doctorText}>{record.doctorName}</Text>
          <Text style={styles.specialtyText}>• {record.specialty}</Text>
        </View>
        {record.phone && (
          <View style={styles.phoneInfo}>
            <LucideIcons.Phone size={12} color="#4CB1B1" strokeWidth={2} />
            <Text style={styles.phoneText}>{record.phone}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};