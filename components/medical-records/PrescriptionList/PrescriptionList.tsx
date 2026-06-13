import { Pill, Trash2 } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { PrescriptionData } from "@/shared/services/medicalRecord.service";
import { colors } from "@/shared/theme/colors";

interface PrescriptionListProps {
  prescriptions: PrescriptionData[];
  editable?: boolean;
  onRemove?: (index: number) => void;
}

export const PrescriptionList = ({
  prescriptions,
  editable = false,
  onRemove,
}: PrescriptionListProps) => {
  if (prescriptions.length === 0) return null;

  return (
    <View>
      <Text style={styles.sectionTitle}>Recetas ({prescriptions.length})</Text>
      {prescriptions.map((p, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.cardHeader}>
            <Pill size={14} color={colors.accent} strokeWidth={2.5} />
            <Text style={styles.medName}>{p.medicationName}</Text>
            {editable && onRemove && (
              <TouchableOpacity onPress={() => onRemove(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Trash2 size={14} color="#B91C1C" strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>
          {(p.dosage || p.frequency || p.duration) && (
            <View style={styles.details}>
              {p.dosage && <Text style={styles.detail}>{p.dosage}</Text>}
              {p.frequency && <Text style={styles.detail}>{p.frequency}</Text>}
              {p.duration && <Text style={styles.detail}>{p.duration}</Text>}
            </View>
          )}
          {p.instructions && <Text style={styles.instructions}>{p.instructions}</Text>}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.1,
    marginBottom: 10,
    marginTop: 0,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  medName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  details: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detail: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
    backgroundColor: colors.surface,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: "hidden",
  },
  instructions: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: "italic",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
