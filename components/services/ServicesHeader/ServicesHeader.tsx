import { Activity, Archive, ChevronLeft, List, Plus, Search } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import type { ServiceStatusFilter } from "@/shared/entities/Service";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ServicesHeaderProps {
  title?: string;
  onSearch?: (query: string) => void;
  onCreate?: () => void;
  status?: ServiceStatusFilter;
  onStatusChange?: (status: ServiceStatusFilter) => void;
  canCreate?: boolean;
}

export const ServicesHeader = ({
  title = "Servicios",
  onSearch,
  onCreate,
  status = "active",
  onStatusChange,
  canCreate = true,
}: ServicesHeaderProps) => {
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
              placeholder="Buscar servicio..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.title}>{title}</Text>
          {onCreate && (
            <TouchableOpacity style={styles.createButton} onPress={onCreate}>
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.createButtonText}>Crear</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          {canCreate && (
            <TouchableOpacity
              style={status === "all" ? styles.filterChipActive : styles.filterChip}
              onPress={() => onStatusChange?.("all")}
              activeOpacity={0.7}
            >
              <List
                size={14}
                color={status === "all" ? "#FFFFFF" : "#64748B"}
                strokeWidth={2}
              />
              <Text style={status === "all" ? styles.filterChipTextActive : styles.filterChipText}>
                Todos
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={status === "active" ? styles.filterChipActive : styles.filterChip}
            onPress={() => onStatusChange?.("active")}
            activeOpacity={0.7}
          >
            <Activity
              size={14}
              color={status === "active" ? "#FFFFFF" : "#64748B"}
              strokeWidth={2}
            />
            <Text style={status === "active" ? styles.filterChipTextActive : styles.filterChipText}>
              Activos
            </Text>
          </TouchableOpacity>
          {canCreate && (
            <TouchableOpacity
              style={status === "inactive" ? styles.filterChipActive : styles.filterChip}
              onPress={() => onStatusChange?.("inactive")}
              activeOpacity={0.7}
            >
              <Archive
                size={14}
                color={status === "inactive" ? "#FFFFFF" : "#64748B"}
                strokeWidth={2}
              />
              <Text style={status === "inactive" ? styles.filterChipTextActive : styles.filterChipText}>
                Inactivos
              </Text>
            </TouchableOpacity>
          )}
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
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4CB1B1",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: "#4CB1B1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
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
});
