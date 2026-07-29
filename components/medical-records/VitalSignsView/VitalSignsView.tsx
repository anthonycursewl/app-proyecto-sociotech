import { Text } from "@/components/common/SText";
import { VitalSignsData } from "@/shared/services/medicalRecord.service";
import { colors } from "@/shared/theme/colors";
import React from "react";
import { StyleSheet, View } from "react-native";

interface VitalSignsViewProps {
  vitalSigns: VitalSignsData;
}

const LABELS: Partial<Record<keyof VitalSignsData, string>> = {
  bloodPressure: "Presión arterial",
  heartRate: "Frec. cardíaca",
  temperature: "Temperatura",
  weight: "Peso",
  height: "Altura",
  respiratoryRate: "Frec. respiratoria",
};

const SUFFIX: Partial<Record<keyof VitalSignsData, string>> = {
  heartRate: " lpm",
  temperature: " °C",
  weight: " kg",
  height: " cm",
  respiratoryRate: " rpm",
};

export const VitalSignsView = ({ vitalSigns }: VitalSignsViewProps) => {
  const entries = (Object.keys(LABELS) as (keyof VitalSignsData)[]).filter(
    (k) => vitalSigns[k] !== undefined && vitalSigns[k] !== null && vitalSigns[k] !== "" && !(typeof vitalSigns[k] === "number" && isNaN(vitalSigns[k])),
  );

  if (entries.length === 0) {
    return (
      <View>
        <Text style={styles.sectionTitle}>Signos Vitales</Text>
        <Text style={styles.emptyText}>No se registraron signos vitales</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>Signos Vitales</Text>
      <View style={styles.grid}>
        {entries.map((key) => (
          <View key={key} style={styles.item}>
            <Text style={styles.label}>{LABELS[key]}</Text>
            <Text style={styles.value}>
              {vitalSigns[key]}
              {SUFFIX[key] ?? ""}
            </Text>
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
    color: colors.textPrimary,
    letterSpacing: -0.1,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  item: {
    width: "30%",
    flexGrow: 1,
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "500",
    fontStyle: "italic",
  },
});
