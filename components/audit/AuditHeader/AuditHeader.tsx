import { Text } from "@/components/common/SText";
import { colors } from "@/shared/theme/colors";
import { useRouter } from "expo-router";
import { ChevronLeft, SlidersHorizontal, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AuditHeaderProps {
  totalCount: number;
  hasActiveFilter: boolean;
  onOpenFilters: () => void;
  onClearFilters: () => void;
}

export const AuditHeader = ({
  totalCount,
  hasActiveFilter,
  onOpenFilters,
  onClearFilters,
}: AuditHeaderProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.titleText}>Auditoría</Text>
        <View style={styles.headerActions}>
          {hasActiveFilter && (
            <TouchableOpacity onPress={onClearFilters} style={styles.iconButton}>
              <X size={18} color="#EF4444" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.filterButton, hasActiveFilter && styles.filterButtonActive]}
            onPress={onOpenFilters}
          >
            <SlidersHorizontal size={18} color={hasActiveFilter ? "#FFFFFF" : colors.textSecondary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.description}>Registro de actividades del sistema</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 12 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  backButton: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: colors.surface,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  titleText: { fontSize: 22, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.5 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconButton: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: "#FEE2E2",
    justifyContent: "center", alignItems: "center",
  },
  filterButton: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: colors.surface,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  filterButtonActive: { backgroundColor: colors.accent },
  description: { fontSize: 14, color: colors.textSecondary, fontWeight: "500", marginBottom: 2, paddingHorizontal: 4 },
  countText: { fontSize: 13, color: colors.textSecondary, fontWeight: "500", paddingHorizontal: 2 },
});
