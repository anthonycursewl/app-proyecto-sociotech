import * as LucideIcons from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { styles } from "./ExamCard.styles";

export interface ExamData {
  id: string;
  patientName: string;
  patientId: string;
  examType: string;
  title: string;
  description: string;
  date: string;
  status: "pending" | "completed" | "ready";
  resultUrl?: string;
}

interface ExamCardProps {
  exam: ExamData;
  onPress?: () => void;
}

export const ExamCard = ({ exam, onPress }: ExamCardProps) => {
  const statusConfig = {
    pending: { label: "Pendiente", bgColor: "#FEF3C7", textColor: "#D97706", icon: LucideIcons.Clock },
    completed: { label: "Completado", bgColor: "#DCFCE7", textColor: "#22C55E", icon: LucideIcons.CheckCircle },
    ready: { label: "Listo", bgColor: "#E0F2F1", textColor: "#0D9488", icon: LucideIcons.FileCheck },
  };

  const status = statusConfig[exam.status];
  const StatusIcon = status.icon;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: status.bgColor }]}>
          <StatusIcon size={20} color={status.textColor} strokeWidth={2.5} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={1}>{exam.title}</Text>
          <Text style={styles.examType}>{exam.examType}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
          <Text style={[styles.statusText, { color: status.textColor }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.patientRow}>
          <LucideIcons.User size={12} color="#64748B" strokeWidth={2} />
          <Text style={styles.patientName}>{exam.patientName}</Text>
          <Text style={styles.patientId}>{exam.patientId}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>{exam.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dateRow}>
          <LucideIcons.Calendar size={12} color="#94A3B8" strokeWidth={2} />
          <Text style={styles.dateText}>{formatDate(exam.date)}</Text>
        </View>
        {exam.resultUrl && (
          <View style={styles.resultLink}>
            <LucideIcons.Download size={12} color="#4CB1B1" strokeWidth={2} />
            <Text style={styles.resultText}>Ver resultado</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};