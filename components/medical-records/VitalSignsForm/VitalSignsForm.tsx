import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Text } from "@/components/common/SText";
import { VitalSignsData } from "@/shared/services/medicalRecord.service";

interface VitalSignsFormProps {
  vitalSigns: VitalSignsData;
  onChange: (vitalSigns: VitalSignsData) => void;
}

const FIELDS: {
  key: keyof VitalSignsData;
  label: string;
  placeholder: string;
  keyboard: "default" | "numeric" | "decimal-pad";
}[] = [
  { key: "bloodPressure", label: "Presión arterial", placeholder: "120/80", keyboard: "default" },
  { key: "heartRate", label: "Frecuencia cardíaca", placeholder: "72 lpm", keyboard: "numeric" },
  { key: "temperature", label: "Temperatura", placeholder: "36.5 °C", keyboard: "decimal-pad" },
  { key: "weight", label: "Peso", placeholder: "70.0 kg", keyboard: "decimal-pad" },
  { key: "height", label: "Altura", placeholder: "170.0 cm", keyboard: "decimal-pad" },
  { key: "respiratoryRate", label: "Frec. respiratoria", placeholder: "16 rpm", keyboard: "numeric" },
  { key: "oxygenSaturation", label: "Saturación O2", placeholder: "98 %", keyboard: "numeric" },
];

export const VitalSignsForm = ({ vitalSigns, onChange }: VitalSignsFormProps) => {
  const handleChange = (key: keyof VitalSignsData, value: string) => {
    if (key === "bloodPressure") {
      onChange({ ...vitalSigns, bloodPressure: value || undefined });
      return;
    }
    const num = value === "" ? undefined : Number(value);
    if (key === "oxygenSaturation" && num !== undefined) {
      onChange({ ...vitalSigns, [key]: Math.min(100, Math.max(0, num)) });
    } else {
      onChange({ ...vitalSigns, [key]: num });
    }
  };

  const getValue = (key: keyof VitalSignsData): string => {
    const v = vitalSigns[key];
    if (v === undefined || v === null) return "";
    return String(v);
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Signos Vitales</Text>
      <Text style={styles.sectionSubtitle}>Todos son opcionales</Text>
      <View style={styles.grid}>
        {FIELDS.map((field) => (
          <View key={field.key} style={styles.fieldWrap}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              value={getValue(field.key)}
              onChangeText={(v) => handleChange(field.key, v)}
              placeholder={field.placeholder}
              placeholderTextColor="#D1D5DB"
              keyboardType={field.keyboard}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    marginBottom: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  fieldWrap: {
    width: "48%",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
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
});
