import * as LucideIcons from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ReportsHeaderProps {
  title?: string;
}

export const ReportsHeader = ({ title = "Reportes" }: ReportsHeaderProps) => {
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
          <Text style={styles.titleText}>{title}</Text>
          <TouchableOpacity style={styles.actionButton}>
            <LucideIcons.Plus size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.description}>Genera y descarga reportes en PDF, Excel y CSV</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <LucideIcons.FileText size={18} color="#4CB1B1" strokeWidth={2} />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>PDFs</Text>
          </View>
          <View style={styles.statItem}>
            <LucideIcons.Table size={18} color="#22C55E" strokeWidth={2} />
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Excel</Text>
          </View>
          <View style={styles.statItem}>
            <LucideIcons.FileSpreadsheet size={18} color="#3B82F6" strokeWidth={2} />
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>CSV</Text>
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
  topRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  backButton: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  titleText: { flex: 1, fontSize: 22, fontWeight: "800", color: "#0F172A", letterSpacing: -0.5 },
  actionButton: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: "#4CB1B1",
    justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  descriptionSection: { marginBottom: 16, paddingHorizontal: 4 },
  description: { fontSize: 14, color: "#64748B", fontWeight: "500" },
  statsRow: {
    flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  statItem: { flex: 1, alignItems: "center", gap: 6 },
  statValue: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  statLabel: { fontSize: 11, color: "#94A3B8", fontWeight: "500" },
});