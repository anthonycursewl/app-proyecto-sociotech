import { Text } from "@/components/common/SText";
import { PrescriptionForm } from "@/components/medical-records/PrescriptionForm";
import { PrescriptionList } from "@/components/medical-records/PrescriptionList";
import { VitalSignsForm } from "@/components/medical-records/VitalSignsForm";
import { PrescriptionData, VitalSignsData } from "@/shared/services/medicalRecord.service";
import { AlertCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Keyboard, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

function sanitizeVitalSigns(vs: VitalSignsData): VitalSignsData {
  const result: VitalSignsData = {};
  for (const key of Object.keys(vs) as (keyof VitalSignsData)[]) {
    const v = vs[key];
    if (v === undefined || v === null) continue;
    if (typeof v === "number" && !isFinite(v)) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    (result as Record<string, unknown>)[key] = v;
  }
  return result;
}

interface FormState {
  chiefComplaint: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  vitalSigns: VitalSignsData;
  prescriptions: PrescriptionData[];
}

interface MedicalRecordFormProps {
  initialData?: Partial<FormState>;
  loading?: boolean;
  onSubmit: (data: {
    chiefComplaint: string;
    symptoms: string[];
    diagnosis: string;
    treatment: string;
    notes: string;
    vitalSigns?: VitalSignsData;
    prescriptions?: PrescriptionData[];
  }) => Promise<void>;
  submitLabel?: string;
}

export const MedicalRecordForm = ({
  initialData,
  loading = false,
  onSubmit,
  submitLabel = "Guardar historia clínica",
}: MedicalRecordFormProps) => {
  const [form, setForm] = useState<FormState>(() => ({
    chiefComplaint: initialData?.chiefComplaint ?? "",
    symptoms: Array.isArray(initialData?.symptoms) ? initialData.symptoms.join(", ") : "",
    diagnosis: initialData?.diagnosis ?? "",
    treatment: initialData?.treatment ?? "",
    notes: initialData?.notes ?? "",
    vitalSigns: initialData?.vitalSigns ? sanitizeVitalSigns(initialData.vitalSigns) : {},
    prescriptions: initialData?.prescriptions ?? [],
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.chiefComplaint.trim() || !form.diagnosis.trim() || !form.treatment.trim() || !form.notes.trim()) {
      setError("Completa los campos requeridos: motivo, diagnóstico, tratamiento y notas");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        chiefComplaint: form.chiefComplaint.trim(),
        symptoms: form.symptoms.split(",").map((s) => s.trim()).filter(Boolean),
        diagnosis: form.diagnosis.trim(),
        treatment: form.treatment.trim(),
        notes: form.notes.trim(),
        vitalSigns: Object.keys(form.vitalSigns).length > 0 ? sanitizeVitalSigns(form.vitalSigns) : undefined,
        prescriptions: form.prescriptions.length > 0 ? form.prescriptions : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  const isMutating = submitting || loading;
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setKeyboardOpen(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, keyboardOpen && styles.scrollContentKeyboard]}
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos de consulta</Text>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Motivo de consulta *</Text>
          <TextInput
            style={styles.textArea}
            value={form.chiefComplaint}
            onChangeText={(v) => setForm({ ...form, chiefComplaint: v })}
            placeholder="Describe el motivo de la consulta"
            placeholderTextColor="#D1D5DB"
            multiline
            numberOfLines={3}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Síntomas</Text>
          <TextInput
            style={styles.input}
            value={form.symptoms}
            onChangeText={(v) => setForm({ ...form, symptoms: v })}
            placeholder="Separados por coma: fiebre, tos, dolor"
            placeholderTextColor="#D1D5DB"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Notas *</Text>
          <TextInput
            style={styles.textArea}
            value={form.notes}
            onChangeText={(v) => setForm({ ...form, notes: v })}
            placeholder="Notas adicionales sobre la consulta"
            placeholderTextColor="#D1D5DB"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diagnóstico</Text>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Diagnóstico *</Text>
          <TextInput
            style={styles.textArea}
            value={form.diagnosis}
            onChangeText={(v) => setForm({ ...form, diagnosis: v })}
            placeholder="Describe el diagnóstico"
            placeholderTextColor="#D1D5DB"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tratamiento</Text>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Tratamiento *</Text>
          <TextInput
            style={styles.textArea}
            value={form.treatment}
            onChangeText={(v) => setForm({ ...form, treatment: v })}
            placeholder="Describe el tratamiento indicado"
            placeholderTextColor="#D1D5DB"
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      <View style={styles.section}>
        <VitalSignsForm
          vitalSigns={form.vitalSigns}
          onChange={(v) => setForm({ ...form, vitalSigns: v })}
        />
      </View>

      <View style={styles.section}>
        <PrescriptionForm
          onAdd={(p) => setForm({ ...form, prescriptions: [...form.prescriptions, p] })}
        />
        <PrescriptionList
          prescriptions={form.prescriptions}
          editable
          onRemove={(i) => setForm({ ...form, prescriptions: form.prescriptions.filter((_, idx) => idx !== i) })}
        />
      </View>

      {error && (
        <View style={styles.errorBox}>
          <AlertCircle size={14} color="#B91C1C" strokeWidth={2.5} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitButton, isMutating && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isMutating}
        activeOpacity={0.8}
      >
        {isMutating ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitText}>{submitLabel}</Text>
        )}
      </TouchableOpacity>

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
  scrollContentKeyboard: {
    paddingBottom: 300,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEF0F3",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.1,
    marginBottom: 12,
  },
  field: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEF0F3",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  textArea: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEF0F3",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    minHeight: 60,
    textAlignVertical: "top",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#B91C1C",
    fontWeight: "500",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
