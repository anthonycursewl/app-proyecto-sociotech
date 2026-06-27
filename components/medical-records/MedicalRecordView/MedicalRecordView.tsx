import { CheckCircle, ClipboardList, FileDown, FileText, HeartPulse, PenLine, Stethoscope } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
        <LinearGradient
          colors={["#059669", "rgba(5, 150, 105, 0.85)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.signedBadge}
        >
          <CheckCircle size={14} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.signedText}>Firmada</Text>
          {record.signedAt && (
            <Text style={styles.signedDate}>{formatDate(record.signedAt)}</Text>
          )}
        </LinearGradient>
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
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  signedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    elevation: 5,
  },
  signedText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  signedDate: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
    marginLeft: "auto",
    fontVariant: ["tabular-nums"],
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8EDF2",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.3,
    flex: 1,
  },
  bodyText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    fontWeight: "500",
    marginTop: 8,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: "#F0FDFA",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.accent + "30",
  },
  tagText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: "700",
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  codeLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  codeValue: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  metaRow: {
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingVertical: 18,
    marginTop: 8,
    borderWidth: 2,
    borderColor: colors.accent + "40",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  downloadButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.accent,
    letterSpacing: 0.2,
  },
  signButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 18,
    marginTop: 12,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  signButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  signButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  footerSpacer: {
    height: 40,
  },
});
