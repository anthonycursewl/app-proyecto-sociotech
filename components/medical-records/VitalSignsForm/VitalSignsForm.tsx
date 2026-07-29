import { Text } from "@/components/common/SText";
import { VitalSignsData } from "@/shared/services/medicalRecord.service";
import React, { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

interface VitalSignsFormProps {
  vitalSigns: VitalSignsData;
  onChange: (vitalSigns: VitalSignsData) => void;
}

const FIELDS: {
  key: keyof VitalSignsData;
  label: string;
  placeholder: string;
  suffix: string;
  keyboard: "default" | "numeric" | "decimal-pad" | "numbers-and-punctuation";
  maxLength: number;
}[] = [
  { key: "bloodPressure", label: "Presión arterial", placeholder: "120/80", suffix: "", keyboard: "numbers-and-punctuation", maxLength: 7 },
  { key: "heartRate", label: "Frecuencia cardíaca", placeholder: "72", suffix: " lpm", keyboard: "numeric", maxLength: 3 },
  { key: "temperature", label: "Temperatura", placeholder: "36.5", suffix: " °C", keyboard: "decimal-pad", maxLength: 4 },
  { key: "weight", label: "Peso", placeholder: "70.0", suffix: " kg", keyboard: "decimal-pad", maxLength: 5 },
  { key: "height", label: "Altura", placeholder: "170", suffix: " cm", keyboard: "decimal-pad", maxLength: 5 },
  { key: "respiratoryRate", label: "Frec. respiratoria", placeholder: "16", suffix: " rpm", keyboard: "numeric", maxLength: 2 },
];

function initDisplay(vs: VitalSignsData): Record<string, string> {
  const d: Record<string, string> = {};
  for (const f of FIELDS) {
    const v = vs[f.key];
    d[f.key] = v != null ? String(v) : "";
  }
  return d;
}

const BP_SYS_MIN = 70, BP_SYS_MAX = 250;
const BP_DIA_MIN = 40, BP_DIA_MAX = 150;

function clampMax(key: keyof VitalSignsData, num: number): number {
  switch (key) {
    case "oxygenSaturation": return Math.min(100, Math.max(0, Math.round(num)));
    case "heartRate": return Math.min(220, Math.max(0, Math.round(num)));
    case "temperature": return Math.min(42, Math.max(0, Math.round(num * 10) / 10));
    case "weight": return Math.min(350, Math.max(0, Math.round(num * 10) / 10));
    case "height": return Math.min(250, Math.max(0, Math.round(num * 10) / 10));
    case "respiratoryRate": return Math.min(60, Math.max(0, Math.round(num)));
    default: return num;
  }
}

function clampFull(key: keyof VitalSignsData, num: number): number {
  switch (key) {
    case "oxygenSaturation": return Math.min(100, Math.max(50, Math.round(num)));
    case "heartRate": return Math.min(220, Math.max(30, Math.round(num)));
    case "temperature": return Math.min(42, Math.max(32, Math.round(num * 10) / 10));
    case "weight": return Math.min(350, Math.max(2, Math.round(num * 10) / 10));
    case "height": return Math.min(250, Math.max(30, Math.round(num * 10) / 10));
    case "respiratoryRate": return Math.min(60, Math.max(4, Math.round(num)));
    default: return num;
  }
}

export const VitalSignsForm = ({ vitalSigns, onChange }: VitalSignsFormProps) => {
  const [display, setDisplay] = useState<Record<string, string>>(() => initDisplay(vitalSigns));
  const [dirty, setDirty] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDisplay((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const f of FIELDS) {
        if (dirty.has(f.key)) continue;
        const v = vitalSigns[f.key];
        const str = v != null ? String(v) : "";
        if (prev[f.key] !== str) {
          next[f.key] = str;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [vitalSigns, dirty]);

  const handleChange = (key: keyof VitalSignsData, raw: string) => {
    setDirty((prev) => new Set(prev).add(key));

    if (key === "bloodPressure") {
      const digits = raw.replace(/[^0-9]/g, "").slice(0, 6);
      const formatted = digits.length > 3 ? digits.slice(0, 3) + "/" + digits.slice(3) : digits;
      const parts = formatted.split("/");
      if (parts.length === 2 && parts[0].length >= 2 && parts[1].length >= 2) {
        const sys = parseInt(parts[0], 10);
        const dia = parseInt(parts[1], 10);
        if (!isNaN(sys) && !isNaN(dia)) {
          const clampedSys = Math.min(BP_SYS_MAX, Math.max(0, sys));
          const clampedDia = Math.min(BP_DIA_MAX, Math.max(0, dia));
          const clamped = clampedSys + "/" + clampedDia;
          setDisplay((p) => ({ ...p, bloodPressure: clamped }));
          onChange({ ...vitalSigns, bloodPressure: clamped });
          return;
        }
      }
      setDisplay((p) => ({ ...p, bloodPressure: formatted }));
      onChange({ ...vitalSigns, bloodPressure: formatted || undefined });
      return;
    }

    setDisplay((p) => ({ ...p, [key]: raw }));

    if (raw === "") {
      onChange({ ...vitalSigns, [key]: undefined });
      return;
    }

    const num = Number(raw);
    if (isNaN(num)) return;

    const clamped = clampMax(key, num);
    if (clamped !== num) {
      setDisplay((p) => ({ ...p, [key]: String(clamped) }));
    }
    onChange({ ...vitalSigns, [key]: clamped });
  };

  const handleBlur = (key: keyof VitalSignsData) => {
    setDirty((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });

    const raw = display[key];

    if (key === "bloodPressure") {
      if (!raw) {
        onChange({ ...vitalSigns, bloodPressure: undefined });
        return;
      }
      const parts = raw.split("/");
      if (parts.length === 2) {
        const sys = parseInt(parts[0], 10);
        const dia = parseInt(parts[1], 10);
        if (!isNaN(sys) && !isNaN(dia)) {
          const clampedSys = Math.min(BP_SYS_MAX, Math.max(BP_SYS_MIN, sys));
          const clampedDia = Math.min(BP_DIA_MAX, Math.max(BP_DIA_MIN, dia));
          const cleaned = clampedSys + "/" + clampedDia;
          setDisplay((p) => ({ ...p, bloodPressure: cleaned }));
          onChange({ ...vitalSigns, bloodPressure: cleaned });
          return;
        }
      }
      onChange({ ...vitalSigns, bloodPressure: undefined });
      return;
    }

    if (!raw || raw.trim() === "") {
      onChange({ ...vitalSigns, [key]: undefined });
      return;
    }
    const num = Number(raw);
    if (!isNaN(num)) {
      const clamped = clampFull(key, num);
      setDisplay((p) => ({ ...p, [key]: String(clamped) }));
      onChange({ ...vitalSigns, [key]: clamped });
    }
  };

  const getValue = (key: keyof VitalSignsData): string => display[key] ?? "";

  return (
    <View>
      <Text style={styles.sectionTitle}>Signos Vitales</Text>
      <Text style={styles.sectionSubtitle}>Todos son opcionales</Text>
      <View style={styles.grid}>
        {FIELDS.map((field) => (
          <View key={field.key} style={styles.fieldWrap}>
            <Text style={styles.label}>{field.label}</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={getValue(field.key)}
                onChangeText={(v) => handleChange(field.key, v)}
                onBlur={() => handleBlur(field.key)}
                placeholder={field.placeholder}
                placeholderTextColor="#D1D5DB"
                keyboardType={field.keyboard}
                maxLength={field.maxLength}
              />
              {field.suffix ? <Text style={styles.suffix}>{field.suffix}</Text> : null}
            </View>
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
  input: {
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
});
