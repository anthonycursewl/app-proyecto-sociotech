import * as LucideIcons from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface MedicalRecordsHeaderProps {
  title?: string;
  onSearch?: (query: string) => void;
}

export const MedicalRecordsHeader = ({ title = "Historias Clínicas", onSearch }: MedicalRecordsHeaderProps) => {
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
              placeholder="Buscar historia clínica..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>

          <TouchableOpacity style={styles.actionButton}>
            <LucideIcons.Filter size={20} color="#64748B" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.count}>12 registros</Text>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterChipActive}>
            <LucideIcons.ClipboardList size={14} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.filterChipTextActive}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <LucideIcons.FileText size={14} color="#64748B" strokeWidth={2} />
            <Text style={styles.filterChipText}>Consultas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <LucideIcons.Pill size={14} color="#64748B" strokeWidth={2} />
            <Text style={styles.filterChipText}>Recetas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <LucideIcons.FileCheck size={14} color="#64748B" strokeWidth={2} />
            <Text style={styles.filterChipText}>Exámenes</Text>
          </TouchableOpacity>
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
    height: 200,
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
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
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
    paddingHorizontal: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#4CB1B1",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  filterChipText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  filterChipTextActive: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});