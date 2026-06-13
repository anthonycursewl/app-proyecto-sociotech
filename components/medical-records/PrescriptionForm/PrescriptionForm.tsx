import { Plus } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { PrescriptionData } from "@/shared/services/medicalRecord.service";

interface PrescriptionFormProps {
  onAdd: (prescription: PrescriptionData) => void;
}

const INITIAL: PrescriptionData = {
  medicationName: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

export const PrescriptionForm = ({ onAdd }: PrescriptionFormProps) => {
  const [form, setForm] = useState<PrescriptionData>({ ...INITIAL });

  const handleAdd = () => {
    if (!form.medicationName.trim()) return;
    const cleaned: PrescriptionData = {
      medicationName: form.medicationName.trim(),
      dosage: form.dosage?.trim() || undefined,
      frequency: form.frequency?.trim() || undefined,
      duration: form.duration?.trim() || undefined,
      instructions: form.instructions?.trim() || undefined,
    };
    onAdd(cleaned);
    setForm({ ...INITIAL });
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
        <TextInput
          style={[styles.input, styles.half]}
          value={form.dosage}
          onChangeText={(v) => setForm({ ...form, dosage: v })}
          placeholder="Dosis (ej. 400 mg)"
          placeholderTextColor="#D1D5DB"
        />
        <TextInput
          style={[styles.input, styles.half]}
          value={form.frequency}
          onChangeText={(v) => setForm({ ...form, frequency: v })}
          placeholder="Frecuencia (ej. Cada 8h)"
          placeholderTextColor="#D1D5DB"
        />
      </View>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.half]}
          value={form.duration}
          onChangeText={(v) => setForm({ ...form, duration: v })}
          placeholder="Duración (ej. 5 días)"
          placeholderTextColor="#D1D5DB"
        />
        <TextInput
          style={[styles.input, styles.half]}
          value={form.instructions}
          onChangeText={(v) => setForm({ ...form, instructions: v })}
          placeholder="Indicaciones"
          placeholderTextColor="#D1D5DB"
        />
      </View>

      <TouchableOpacity
        style={[styles.addButton, !form.medicationName.trim() && styles.addButtonDisabled]}
        onPress={handleAdd}
        disabled={!form.medicationName.trim()}
        activeOpacity={0.7}
      >
        <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.addButtonText}>Agregar receta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.1,
    marginBottom: 12,
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
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  half: {
    flex: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#0D9488",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 2,
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
