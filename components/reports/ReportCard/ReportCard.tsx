import * as LucideIcons from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { styles } from "./ReportCard.styles";

export interface ReportData {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "excel" | "csv";
  generatedAt: string;
  period: string;
  size: string;
}

interface ReportCardProps {
  report: ReportData;
  onPress?: () => void;
}

export const ReportCard = ({ report, onPress }: ReportCardProps) => {
  const typeConfig = {
    pdf: { icon: LucideIcons.FileText, color: "#EF4444", label: "PDF" },
    excel: { icon: LucideIcons.Table, color: "#22C55E", label: "Excel" },
    csv: { icon: LucideIcons.FileSpreadsheet, color: "#3B82F6", label: "CSV" },
  };

  const typeStyle = typeConfig[report.type];
  const IconComponent = typeStyle.icon;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: typeStyle.color + "15" }]}>
        <IconComponent size={22} color={typeStyle.color} strokeWidth={2.5} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{report.title}</Text>
          <View style={[styles.typeBadge, { backgroundColor: typeStyle.color + "15" }]}>
            <Text style={[styles.typeText, { color: typeStyle.color }]}>{typeStyle.label}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>{report.description}</Text>

        <View style={styles.footer}>
          <View style={styles.metaRow}>
            <LucideIcons.Calendar size={12} color="#94A3B8" strokeWidth={2} />
            <Text style={styles.metaText}>{report.period}</Text>
          </View>
          <View style={styles.metaRow}>
            <LucideIcons.Database size={12} color="#94A3B8" strokeWidth={2} />
            <Text style={styles.metaText}>{report.size}</Text>
          </View>
        </View>
      </View>

      <View style={styles.downloadButton}>
        <LucideIcons.Download size={18} color="#4CB1B1" strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
};