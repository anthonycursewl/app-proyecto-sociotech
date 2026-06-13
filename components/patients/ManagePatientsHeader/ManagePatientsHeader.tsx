import { Text } from "@/components/common/SText";
import { useRouter } from "expo-router";
import { ChevronLeft, List, Search, UserCheck, UserX } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { InteractionManager, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PatientMetrics } from "@/shared/services/patient.service";
import { colors } from "@/shared/theme/colors";

interface ManagePatientsHeaderProps {
  title?: string;
  onSearch?: (query: string) => void;
  metrics?: PatientMetrics;
  activeFilter?: boolean | undefined;
  onFilterChange?: (filter: boolean | undefined) => void;
}

export const ManagePatientsHeader = ({ title = "Pacientes", onSearch, metrics, activeFilter, onFilterChange }: ManagePatientsHeaderProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      router.prefetch("/(main)/patient/edit");
    });
  }, [router]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch?.(text);
  };

  return (
    <View>
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <Search size={16} color={colors.textMuted} strokeWidth={2.5} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar paciente..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.count}>{metrics ? `${metrics.totalActive + metrics.totalInactive} pacientes` : ""}</Text>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity style={activeFilter === undefined ? styles.filterChipActive : styles.filterChip} onPress={() => onFilterChange?.(undefined)} activeOpacity={0.7}>
            <List size={14} color={activeFilter === undefined ? "#FFFFFF" : colors.textSecondary} strokeWidth={2} />
            <Text style={activeFilter === undefined ? styles.filterChipTextActive : styles.filterChipText}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={activeFilter === true ? styles.filterChipActive : styles.filterChip} onPress={() => onFilterChange?.(true)} activeOpacity={0.7}>
            <UserCheck size={14} color={activeFilter === true ? "#FFFFFF" : colors.textSecondary} strokeWidth={2} />
            <Text style={activeFilter === true ? styles.filterChipTextActive : styles.filterChipText}>Activos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={activeFilter === false ? styles.filterChipActive : styles.filterChip} onPress={() => onFilterChange?.(false)} activeOpacity={0.7}>
            <UserX size={14} color={activeFilter === false ? "#FFFFFF" : colors.textSecondary} strokeWidth={2} />
            <Text style={activeFilter === false ? styles.filterChipTextActive : styles.filterChipText}>Inactivos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{metrics?.totalActive ?? 0}</Text>
            <Text style={styles.statLabel}>Activos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{metrics?.totalInactive ?? 0}</Text>
            <Text style={styles.statLabel}>Inactivos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{metrics?.totalNew ?? 0}</Text>
            <Text style={styles.statLabel}>Nuevos</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backButton: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    height: 40,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  count: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 4,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  filterChipActive: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.accent,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  filterChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  filterChipTextActive: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "500",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 8,
  },
});