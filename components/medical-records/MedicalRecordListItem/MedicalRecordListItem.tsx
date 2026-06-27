import { Calendar, CheckCircle, ChevronRight, FileText, Pill, Stethoscope, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/common/SText";
import { MedicalRecordResponse } from "@/shared/services/medicalRecord.service";
import { colors } from "@/shared/theme/colors";

interface MedicalRecordListItemProps {
  record: MedicalRecordResponse;
  onPress?: () => void;
  showPatient?: boolean;
  patientName?: string;
  doctorName?: string;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const MedicalRecordListItem = ({
  record,
  onPress,
  showPatient = false,
  patientName,
  doctorName,
}: MedicalRecordListItemProps) => {
  const hasPrescriptions = record.prescriptions && record.prescriptions.length > 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.iconWrap}>
            <FileText size={16} color={colors.accent} strokeWidth={2.2} />
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.diagnosis} numberOfLines={1}>
              {record.diagnosis}
            </Text>
            {record.diagnosisCode ? (
              <Text style={styles.diagnosisCode}>{record.diagnosisCode}</Text>
            ) : null}
          </View>
          {record.isSigned ? (
            <LinearGradient
              colors={["#059669", "rgba(5, 150, 105, 0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signedBadge}
            >
              <CheckCircle size={10} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.signedText}>Firmada</Text>
            </LinearGradient>
          ) : (
            <View style={styles.draftBadge}>
              <Text style={styles.draftText}>Borrador</Text>
            </View>
          )}
        </View>

        <Text style={styles.complaint} numberOfLines={2}>
          {record.chiefComplaint}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Calendar size={11} color={colors.textMuted} strokeWidth={2} />
            <Text style={styles.metaText}>{formatDate(record.createdAt)}</Text>
          </View>
          {hasPrescriptions && (
            <View style={styles.metaItem}>
              <Pill size={11} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.metaText}>
                {record.prescriptions.length} {record.prescriptions.length === 1 ? "receta" : "recetas"}
              </Text>
            </View>
          )}
          {doctorName && (
            <View style={styles.metaItem}>
              <Stethoscope size={11} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.metaText} numberOfLines={1}>{doctorName}</Text>
            </View>
          )}
          {showPatient && patientName && (
            <View style={styles.metaItem}>
              <User size={11} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.metaText} numberOfLines={1}>{patientName}</Text>
            </View>
          )}
        </View>
      </View>

      {onPress && (
        <ChevronRight size={16} color={colors.border} strokeWidth={2} style={styles.chevron} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    flex: 1,
    gap: 1,
  },
  diagnosis: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  diagnosisCode: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textMuted,
  },
  signedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#ECFDF5",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  signedText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#059669",
  },
  draftBadge: {
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  draftText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
  },
  complaint: {
    fontSize: 12.5,
    color: colors.textSecondary,
    fontWeight: "500",
    lineHeight: 17,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "500",
  },
  chevron: {
    alignSelf: "center",
    marginRight: 10,
  },
});
