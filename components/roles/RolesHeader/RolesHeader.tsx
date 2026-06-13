import { ChevronLeft, List, Plus, Search, Shield, ShieldCheck, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type RoleFilterType = "all" | "system" | "custom";

interface RolesHeaderProps {
  totalCount: number;
  systemCount: number;
  customCount: number;
  filter: RoleFilterType;
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: RoleFilterType) => void;
  onCreateRole?: () => void;
  onOpenTrash?: () => void;
  canCreate: boolean;
}

export const RolesHeader = ({
  totalCount,
  systemCount,
  customCount,
  filter,
  onSearch,
  onFilterChange,
  onCreateRole,
  onOpenTrash,
  canCreate,
}: RolesHeaderProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch?.(text);
  };

  return (
    <View>
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Search size={16} color="#94A3B8" strokeWidth={2.5} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
          {canCreate ? (
            <TouchableOpacity style={styles.createButton} onPress={onCreateRole} activeOpacity={0.85}>
              <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.trashButton} onPress={onOpenTrash} activeOpacity={0.85}>
            <Trash2 size={18} color="#64748B" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.title}>Roles</Text>
          <Text style={styles.count}>{totalCount} en total</Text>
        </View>

        <View style={styles.filterRow}>
          <FilterChip
            label="Todos"
            icon={List}
            active={filter === "all"}
            onPress={() => onFilterChange?.("all")}
          />
          <FilterChip
            label="Sistema"
            icon={Shield}
            active={filter === "system"}
            onPress={() => onFilterChange?.("system")}
          />
          <FilterChip
            label="Personalizados"
            icon={ShieldCheck}
            active={filter === "custom"}
            onPress={() => onFilterChange?.("custom")}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{systemCount}</Text>
            <Text style={styles.statLabel}>Sistema</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{customCount}</Text>
            <Text style={styles.statLabel}>Personalizados</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

function FilterChip({
  label,
  icon: Icon,
  active,
  onPress,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={active ? styles.filterChipActive : styles.filterChip}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Icon size={14} color={active ? "#FFFFFF" : "#64748B"} strokeWidth={2} />
      <Text style={active ? styles.filterChipTextActive : styles.filterChipText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 16 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 10 },
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
  searchInput: { flex: 1, fontSize: 14, color: "#0F172A", fontWeight: "500" },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trashButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingHorizontal: 4,
  },
  title: { fontSize: 22, fontWeight: "800", color: "#0F172A", letterSpacing: -0.5 },
  count: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  filterRow: { flexDirection: "row", gap: 8, marginTop: 14, paddingHorizontal: 4 },
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
    backgroundColor: "#64748B",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  filterChipText: { fontSize: 11, color: "#64748B", fontWeight: "500" },
  filterChipTextActive: { fontSize: 11, color: "#FFFFFF", fontWeight: "600" },
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
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  statLabel: { fontSize: 11, color: "#94A3B8", fontWeight: "500", marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "#F1F5F9", marginHorizontal: 8 },
});
