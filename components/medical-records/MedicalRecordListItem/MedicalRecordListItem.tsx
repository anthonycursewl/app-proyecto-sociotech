import { Calendar, CheckCircle, ChevronRight, FileText, Stethoscope, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
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
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.iconWrap}>
        <FileText size={18} color={colors.accent} strokeWidth={2.2} />
      </View>
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.diagnosis} numberOfLines={1}>
            {record.diagnosis}
          </Text>
          {record.isSigned ? (
            <View style={styles.signedBadge}>
              <CheckCircle size={10} color={colors.accent} strokeWidth={2.5} />
              <Text style={styles.signedText}>Firmada</Text>
            </View>
          ) : (
            <View style={styles.draftBadge}>
              <Text style={styles.draftText}>Sin firmar</Text>
            </View>
          )}
        </View>
        <Text style={styles.complaint} numberOfLines={1}>
          {record.chiefComplaint}
        </Text>
        <View style={styles.metaRow}>
          <Calendar size={11} color={colors.textMuted} strokeWidth={2.2} />
          <Text style={styles.metaText}>{formatDate(record.createdAt)}</Text>
          {doctorName && (
            <>
              <View style={styles.dot} />
              <Stethoscope size={11} color={colors.textMuted} strokeWidth={2.2} />
              <Text style={styles.metaText} numberOfLines={1}>
                {doctorName}
              </Text>
            </>
          )}
          {showPatient && patientName && (
            <>
              <View style={styles.dot} />
              <User size={11} color={colors.textMuted} strokeWidth={2.2} />
              <Text style={styles.metaText} numberOfLines={1}>
                {patientName}
              </Text>
            </>
          )}
        </View>
      </View>
      {onPress && (
        <ChevronRight size={16} color={colors.border} strokeWidth={2.2} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  diagnosis: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  signedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F0FDFA",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  signedText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.accent,
  },
  draftBadge: {
    backgroundColor: colors.skeleton,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  draftText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  complaint: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "500",
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.border,
    marginHorizontal: 2,
  },
});
