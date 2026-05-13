import * as LucideIcons from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { Tag } from "../../common/Tag";
import { styles } from "./MedicalRecordCard.styles";

export interface MedicalRecordData {
  id: string;
  patientName: string;
  patientId: string;
  type: "consultation" | "prescription" | "exam" | "procedure";
  title: string;
  description: string;
  date: string;
  doctorName: string;
  specialty: string;
  isActive?: boolean;
}

interface MedicalRecordCardProps {
  record: MedicalRecordData;
  onPress?: () => void;
}

export const MedicalRecordCard = ({ record, onPress }: MedicalRecordCardProps) => {
  const typeConfig = {
    consultation: {
      icon: LucideIcons.FileText,
      color: "#4CB1B1",
      bgColor: "#E0F2F1",
      label: "Consulta",
    },
    prescription: {
      icon: LucideIcons.Pill,
      color: "#8B5CF6",
      bgColor: "#F3E8FF",
      label: "Receta",
    },
    exam: {
      icon: LucideIcons.TestTube,
      color: "#F59E0B",
      bgColor: "#FEF3C7",
      label: "Examen",
    },
    procedure: {
      icon: LucideIcons.Scissors,
      color: "#EF4444",
      bgColor: "#FEE2E2",
      label: "Procedimiento",
    },
  };

  const typeStyle = typeConfig[record.type];
  const IconComponent = typeStyle.icon;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: typeStyle.bgColor }]}>
          <IconComponent size={20} color={typeStyle.color} strokeWidth={2.5} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={1}>{record.title}</Text>
          <Text style={styles.date}>{formatDate(record.date)}</Text>
        </View>
        <View style={styles.typeBadge}>
          <Text style={[styles.typeText, { color: typeStyle.color }]}>{typeStyle.label}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.patientRow}>
          <LucideIcons.User size={14} color="#64748B" strokeWidth={2} />
          <Text style={styles.patientName}>{record.patientName}</Text>
          <Text style={styles.patientId}>{record.patientId}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>{record.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.doctorInfo}>
          <LucideIcons.Stethoscope size={12} color="#94A3B8" strokeWidth={2} />
          <Text style={styles.doctorText}>{record.doctorName}</Text>
          <Text style={styles.specialtyText}>• {record.specialty}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};