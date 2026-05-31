import * as LucideIcons from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DoctorMetrics } from "@/shared/services/doctor.service";

interface ManageDoctorsHeaderProps {
  title?: string;
  onSearch?: (query: string) => void;
  metrics?: DoctorMetrics;
  activeFilter?: boolean | undefined;
  onFilterChange?: (filter: boolean | undefined) => void;
}

export const ManageDoctorsHeader = ({ title = "Doctores", onSearch, metrics, activeFilter, onFilterChange }: ManageDoctorsHeaderProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch?.(text);
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      />
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <LucideIcons.ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <LucideIcons.Search size={16} color="#94A3B8" strokeWidth={2.5} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar doctor..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>

          <TouchableOpacity style={styles.actionButton}>
            <LucideIcons.UserPlus size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.count}>{metrics ? `${metrics.totalActive + metrics.totalInactive} doctores` : ""}</Text>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity style={activeFilter === undefined ? styles.filterChipActive : styles.filterChip} onPress={() => onFilterChange?.(undefined)} activeOpacity={0.7}>
            <LucideIcons.List size={14} color={activeFilter === undefined ? "#FFFFFF" : "#64748B"} strokeWidth={2} />
            <Text style={activeFilter === undefined ? styles.filterChipTextActive : styles.filterChipText}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={activeFilter === true ? styles.filterChipActive : styles.filterChip} onPress={() => onFilterChange?.(true)} activeOpacity={0.7}>
            <LucideIcons.UserCheck size={14} color={activeFilter === true ? "#FFFFFF" : "#64748B"} strokeWidth={2} />
            <Text style={activeFilter === true ? styles.filterChipTextActive : styles.filterChipText}>Activos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={activeFilter === false ? styles.filterChipActive : styles.filterChip} onPress={() => onFilterChange?.(false)} activeOpacity={0.7}>
            <LucideIcons.UserX size={14} color={activeFilter === false ? "#FFFFFF" : "#64748B"} strokeWidth={2} />
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
            <Text style={styles.statValue}>{metrics?.totalPatients ?? 0}</Text>
            <Text style={styles.statLabel}>Pacientes</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
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
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchContainer: {
    flex: 1,
    height: 40,
    backgroundColor: "#FFFFFF",
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
    color: "#0F172A",
    fontWeight: "500",
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#4CB1B1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  count: {
    fontSize: 13,
    color: "#64748B",
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
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#4CB1B1",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  filterChipText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  filterChipTextActive: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
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
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 8,
  },
});
