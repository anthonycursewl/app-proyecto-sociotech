import * as LucideIcons from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const AuditHeader = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
          <Text style={styles.titleText}>Auditoría</Text>
          <TouchableOpacity style={styles.filterButton}>
            <LucideIcons.Filter size={20} color="#64748B" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <Text style={styles.description}>Registro de actividades y cambios en el sistema</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Acciones hoy</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Alertas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>89%</Text>
            <Text style={styles.statLabel}>Cumplimiento</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { position: "relative" },
  gradient: { position: "absolute", top: 0, left: 0, right: 0, height: 180 },
  container: { position: "relative", paddingHorizontal: 16, paddingBottom: 16 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  backButton: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  titleText: { fontSize: 22, fontWeight: "800", color: "#0F172A", letterSpacing: -0.5 },
  filterButton: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  description: { fontSize: 14, color: "#64748B", fontWeight: "500", marginBottom: 16, paddingHorizontal: 4 },
  statsRow: {
    flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  statLabel: { fontSize: 11, color: "#94A3B8", fontWeight: "500", marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "#F1F5F9", marginHorizontal: 8 },
});