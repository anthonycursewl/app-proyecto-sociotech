import { CheckCircle, ClipboardList, FileDown, FileText, HeartPulse, PenLine, Stethoscope } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/common/SText";
import { BottomSheetModal } from "@/components/common/BottomSheetModal";
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
  const [showSignModal, setShowSignModal] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);

  const handleDownloadClinicalHistory = async () => {
    setDownloading(true);
    try {
      await pdfService.downloadClinicalHistory(record.patientId);
    } finally {
      setDownloading(false);
    }
  };
  const handleConfirmSign = async () => {
    if (!onSign) return;
    setSigning(true);
    try {
      await onSign();
      setShowSignModal(false);
    } finally {
      setSigning(false);
    }
  };

  const handleCloseModal = () => {
    if (signing) return;
    setShowSignModal(false);
  };

  const vitalSigns = {
    bloodPressure: record.bloodPressure ?? undefined,
    heartRate: record.heartRate != null && Number.isFinite(record.heartRate) ? record.heartRate : undefined,
    temperature: record.temperature != null && Number.isFinite(record.temperature) ? record.temperature : undefined,
    weight: record.weight != null && Number.isFinite(record.weight) ? record.weight : undefined,
    height: record.height != null && Number.isFinite(record.height) ? record.height : undefined,
    respiratoryRate: record.respiratoryRate != null && Number.isFinite(record.respiratoryRate) ? record.respiratoryRate : undefined,
    oxygenSaturation: record.oxygenSaturation != null && Number.isFinite(record.oxygenSaturation) ? record.oxygenSaturation : undefined,
  };

  const prescriptions = record.prescriptions.map((p) => ({
    medicationName: p.medicationName,
    dosage: p.dosage ?? undefined,
    frequency: p.frequency ?? undefined,
    duration: p.duration ?? undefined,
    instructions: p.instructions ?? undefined,
  }));

  return (
    <View style={styles.flex}>
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

      {record.isSigned && (
        <TouchableOpacity
          style={[styles.downloadButton, downloading && styles.downloadButtonDisabled]}
          onPress={handleDownloadClinicalHistory}
          disabled={downloading}
          activeOpacity={0.8}
        >
          {downloading ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <FileDown size={16} color={colors.accent} strokeWidth={2.5} />
          )}
          <Text style={styles.downloadButtonText}>Descargar historia clínica</Text>
        </TouchableOpacity>
      )}

      {record.isSigned && prescriptions.length > 0 && (
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
          style={styles.signButton}
          onPress={() => setShowSignModal(true)}
          activeOpacity={0.8}
        >
          <PenLine size={16} color={colors.surface} strokeWidth={2.5} />
          <Text style={styles.signButtonText}>Firmar historia clínica</Text>
        </TouchableOpacity>
      )}

      <View style={styles.footerSpacer} />
    </ScrollView>

    <BottomSheetModal visible={showSignModal} onClose={handleCloseModal} height={480}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <View style={styles.modalIconWrap}>
            <PenLine size={22} color="#0D9488" strokeWidth={2.5} />
          </View>
          <Text style={styles.modalTitle}>Firmar historia clínica</Text>
        </View>

        <Text style={styles.modalSubtitle}>
          Al firmar, confirmas que toda la información registrada es correcta y completa.
          Esta acción no se puede deshacer.
        </Text>

        <ScrollView
          style={styles.modalScrollArea}
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modalDetailRow}>
            <FileText size={14} color="#0D9488" strokeWidth={2.5} />
            <View style={styles.modalDetailTextBlock}>
              <Text style={styles.modalDetailLabel}>Motivo de consulta</Text>
              <Text style={styles.modalDetailValue} numberOfLines={2}>
                {record.chiefComplaint}
              </Text>
            </View>
          </View>

          <View style={styles.modalDetailDivider} />

          <View style={styles.modalDetailRow}>
            <Stethoscope size={14} color="#0D9488" strokeWidth={2.5} />
            <View style={styles.modalDetailTextBlock}>
              <Text style={styles.modalDetailLabel}>Diagnóstico</Text>
              <Text style={styles.modalDetailValue} numberOfLines={2}>
                {record.diagnosis}
              </Text>
            </View>
          </View>

          <View style={styles.modalDetailDivider} />

          <View style={styles.modalDetailRow}>
            <ClipboardList size={14} color="#0D9488" strokeWidth={2.5} />
            <View style={styles.modalDetailTextBlock}>
              <Text style={styles.modalDetailLabel}>Prescripciones</Text>
              <Text style={styles.modalDetailValue}>
                {record.prescriptions.length > 0
                  ? `${record.prescriptions.length} medicamento(s)`
                  : "Ninguna"}
              </Text>
            </View>
          </View>
        </ScrollView>

        {signing && (
          <View style={styles.modalSigningOverlay}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={styles.modalSigningText}>Firmando...</Text>
          </View>
        )}

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={handleCloseModal}
            disabled={signing}
            activeOpacity={0.7}
          >
            <Text style={styles.modalCancelText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalConfirmButton, signing && styles.modalConfirmButtonDisabled]}
            onPress={handleConfirmSign}
            disabled={signing}
            activeOpacity={0.8}
          >
            {signing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <CheckCircle size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.modalConfirmText}>Sí, firmar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  downloadButtonDisabled: {
    opacity: 0.6,
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
  signButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  footerSpacer: {
    height: 40,
  },
  modalContent: {
    flex: 1,
    paddingTop: 4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 18,
  },
  modalScrollArea: {
    flex: 1,
    marginBottom: 8,
  },
  modalScrollContent: {
    paddingBottom: 4,
  },
  modalDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalDetailTextBlock: {
    flex: 1,
  },
  modalDetailLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  modalDetailValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  modalDetailDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 12,
    marginLeft: 26,
  },
  modalSigningOverlay: {
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  modalSigningText: {
    fontSize: 13,
    color: "#0D9488",
    fontWeight: "600",
  },
  modalActions: {
    gap: 10,
    marginTop: "auto",
  },
  modalCancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  modalConfirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0D9488",
  },
  modalConfirmButtonDisabled: {
    opacity: 0.6,
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
