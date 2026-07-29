import { Clock, Pill } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { PrescriptionData } from "@/shared/services/medicalRecord.service";

interface PrescriptionFormProps {
  onAdd: (prescription: PrescriptionData) => void;
}

type DurationUnit = "days" | "months";

const INITIAL: PrescriptionData = {
  medicationName: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

export const PrescriptionForm = ({ onAdd }: PrescriptionFormProps) => {
  const [form, setForm] = useState<PrescriptionData>({ ...INITIAL });
  const [durationUnit, setDurationUnit] = useState<DurationUnit>("days");

  const handleAdd = () => {
    if (!form.medicationName.trim()) return;

    let frequency = form.frequency?.trim() || undefined;
    if (frequency) {
      const num = parseInt(frequency, 10);
      if (!isNaN(num)) frequency = `Cada ${Math.min(24, Math.max(1, num))}h`;
    }

    let duration = form.duration?.trim() || undefined;
    if (duration) {
      const num = parseInt(duration, 10);
      if (!isNaN(num)) {
        const capped = durationUnit === "months" ? Math.min(12, Math.max(1, num)) : Math.min(365, Math.max(1, num));
        duration = `Por ${capped} ${durationUnit === "months" ? "mes" : "día"}${capped > 1 ? "s" : ""}`;
      }
    }

    let dosage = form.dosage?.trim() || undefined;
    if (dosage) {
      const num = parseFloat(dosage);
      if (!isNaN(num)) dosage = String(Math.min(2000, Math.max(0.1, Math.round(num * 10) / 10)));
    }

    const cleaned: PrescriptionData = {
      medicationName: form.medicationName.trim(),
      dosage,
      frequency,
      duration,
      instructions: form.instructions?.trim() || undefined,
    };
    onAdd(cleaned);
    setForm({ ...INITIAL });
    setDurationUnit("days");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Agregar Receta</Text>

      <TextInput
        style={styles.input}
        value={form.medicationName}
        onChangeText={(v) => setForm({ ...form, medicationName: v })}
        placeholder="Nombre del medicamento *"
        placeholderTextColor="#D1D5DB"
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputInRow}
              value={form.dosage}
              onChangeText={(v) => {
                const cleaned = v.replace(/[^0-9.]/g, "");
                const dots = cleaned.split(".").length - 1;
                if (dots > 1) return;
                setForm({ ...form, dosage: cleaned });
              }}
              placeholder="Dosis"
              placeholderTextColor="#D1D5DB"
              keyboardType="decimal-pad"
            />
            <Text style={styles.suffix}>mg</Text>
          </View>
        </View>
        <View style={styles.half}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputInRow}
              value={form.frequency}
              onChangeText={(v) => setForm({ ...form, frequency: v.replace(/[^0-9]/g, "") })}
              placeholder="Cada X"
              placeholderTextColor="#D1D5DB"
              keyboardType="number-pad"
              maxLength={2}
            />
            <Text style={styles.suffix}>h</Text>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputInRow}
              value={form.duration}
              onChangeText={(v) => setForm({ ...form, duration: v.replace(/[^0-9]/g, "") })}
              placeholder={durationUnit === "months" ? "Por X" : "Por X"}
              placeholderTextColor="#D1D5DB"
              keyboardType="number-pad"
              maxLength={3}
            />
            <Text style={styles.suffix}>{durationUnit === "months" ? "meses" : "días"}</Text>
          </View>
        </View>
        <View style={styles.half}>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitOption, durationUnit === "days" && styles.unitOptionActive]}
              onPress={() => setDurationUnit("days")}
            >
              <Text style={[styles.unitText, durationUnit === "days" && styles.unitTextActive]}>Días</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitOption, durationUnit === "months" && styles.unitOptionActive]}
              onPress={() => setDurationUnit("months")}
            >
              <Text style={[styles.unitText, durationUnit === "months" && styles.unitTextActive]}>Meses</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TextInput
        style={styles.input}
        value={form.instructions}
        onChangeText={(v) => setForm({ ...form, instructions: v })}
        placeholder="Indicaciones (opcional)"
        placeholderTextColor="#D1D5DB"
      />

      <TouchableOpacity
        style={[styles.addButton, !form.medicationName.trim() && styles.addButtonDisabled]}
        onPress={handleAdd}
        disabled={!form.medicationName.trim()}
        activeOpacity={0.7}
      >
        <Pill size={14} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.addButtonText}>Agregar receta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 4 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#111827", letterSpacing: -0.1, marginBottom: 12 },
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
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 10, marginBottom: 10 },
  half: { flex: 1 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEF0F3",
    paddingLeft: 12,
    paddingRight: 4,
  },
  inputInRow: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    paddingVertical: 10,
  },
  suffix: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
    marginRight: 8,
  },
  unitToggle: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEF0F3",
    overflow: "hidden",
    height: 42,
  },
  unitOption: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  unitOptionActive: {
    backgroundColor: "#0D9488",
  },
  unitText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  unitTextActive: {
    color: "#FFFFFF",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#0D9488",
    borderRadius: 10,
    paddingVertical: 10,
  },
  addButtonDisabled: { opacity: 0.4 },
  addButtonText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },
});
