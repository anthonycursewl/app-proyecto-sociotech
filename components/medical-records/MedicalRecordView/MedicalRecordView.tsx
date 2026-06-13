import { CheckCircle, ClipboardList, FileDown, FileText, HeartPulse, PenLine, Stethoscope } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { VitalSignsView } from "@/components/medical-records/VitalSignsView";
import { PrescriptionList } from "@/components/medical-records/PrescriptionList";
import { MedicalRecordResponse } from "@/shared/services/medicalRecord.service";
import { pdfService } from "@/shared/services/pdf.service";
import { colors } from "@/shared/theme/colors";

interface MedicalRecordViewProps {
  record: MedicalRecordResponse;
  canSign?: boolean;
  onSign?: () => Promise<void>;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const MedicalRecordView = ({ record, canSign = false, onSign }: MedicalRecordViewProps) => {
  const [signing, setSigning] = React.useState(false);

  const handleSign = async () => {
    if (!onSign) return;
    setSigning(true);
    try {
      await onSign();
    } finally {
      setSigning(false);
    }
  };

  const vitalSigns = {
    bloodPressure: record.bloodPressure ?? undefined,
    heartRate: record.heartRate ?? undefined,
    temperature: record.temperature ?? undefined,
    weight: record.weight ?? undefined,
    height: record.height ?? undefined,
    respiratoryRate: record.respiratoryRate ?? undefined,
    oxygenSaturation: record.oxygenSaturation ?? undefined,
  };

  const prescriptions = record.prescriptions.map((p) => ({
    medicationName: p.medicationName,
    dosage: p.dosage ?? undefined,
    frequency: p.frequency ?? undefined,
    duration: p.duration ?? undefined,
    instructions: p.instructions ?? undefined,
  }));

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {record.isSigned && (
        <View style={styles.signedBadge}>
          <CheckCircle size={14} color={colors.accent} strokeWidth={2.5} />
          <Text style={styles.signedText}>Firmada</Text>
          {record.signedAt && (
            <Text style={styles.signedDate}>{formatDate(record.signedAt)}</Text>
          )}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FileText size={16} color={colors.accent} strokeWidth={2.5} />
          <Text style={styles.sectionTitle}>Motivo de consulta</Text>
        </View>
        <Text style={styles.bodyText}>{record.chiefComplaint}</Text>
        {record.symptoms.length > 0 && (
          <View style={styles.tagRow}>
            {record.symptoms.map((s, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{s}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Stethoscope size={16} color={colors.accent} strokeWidth={2.5} />
          <Text style={styles.sectionTitle}>Diagnóstico</Text>
        </View>
        <Text style={styles.bodyText}>{record.diagnosis}</Text>
        {record.diagnosisCode && (
          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>CIE-10</Text>
            <Text style={styles.codeValue}>{record.diagnosisCode}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <HeartPulse size={16} color={colors.accent} strokeWidth={2.5} />
          <Text style={styles.sectionTitle}>Tratamiento</Text>
        </View>
        <Text style={styles.bodyText}>{record.treatment}</Text>
      </View>

      <View style={styles.section}>
        <VitalSignsView vitalSigns={vitalSigns} />
      </View>

      {prescriptions.length > 0 && (
        <View style={styles.section}>
          <PrescriptionList prescriptions={prescriptions} />
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ClipboardList size={16} color={colors.accent} strokeWidth={2.5} />
          <Text style={styles.sectionTitle}>Notas</Text>
        </View>
        <Text style={styles.bodyText}>{record.notes}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Creada: {formatDate(record.createdAt)}</Text>
        {record.updatedAt !== record.createdAt && (
          <Text style={styles.metaText}>Actualizada: {formatDate(record.updatedAt)}</Text>
        )}
      </View>

      {prescriptions.length > 0 && record.isSigned && (
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => pdfService.downloadPrescription(record.id)}
          activeOpacity={0.8}
        >
          <FileDown size={16} color={colors.accent} strokeWidth={2.5} />
          <Text style={styles.downloadButtonText}>Descargar receta</Text>
        </TouchableOpacity>
      )}

      {canSign && !record.isSigned && (
        <TouchableOpacity
          style={[styles.signButton, signing && styles.signButtonDisabled]}
          onPress={handleSign}
          disabled={signing}
          activeOpacity={0.8}
        >
          {signing ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <>
              <PenLine size={16} color={colors.surface} strokeWidth={2.5} />
              <Text style={styles.signButtonText}>Firmar historia clínica</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.footerSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  signedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FDFA",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  signedText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.accent,
  },
  signedDate: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
    marginLeft: "auto",
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.1,
  },
  bodyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    fontWeight: "500",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  tag: {
    backgroundColor: "#F0FDFA",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: "600",
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  codeLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  codeValue: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  metaRow: {
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 4,
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "500",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.accent,
    letterSpacing: 0.2,
  },
  signButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
  },
  signButtonDisabled: {
    opacity: 0.6,
  },
  signButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.surface,
    letterSpacing: 0.2,
  },
  footerSpacer: {
    height: 32,
  },
});
