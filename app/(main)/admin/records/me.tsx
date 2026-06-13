import { ChevronLeft, ClipboardList, RefreshCw } from "lucide-react-native";
import { ListErrorState } from "@/components/common/ListErrorState";
import { Text } from "@/components/common/SText";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import React from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { MedicalRecordListItem } from "@/components/medical-records/MedicalRecordListItem";
import { useMyCreatedMedicalRecords } from "@/shared/hooks/useMyCreatedMedicalRecords";
import { colors } from "@/shared/theme/colors";

export default function MyCreatedRecordsScreen() {
  const router = useRouter();
  const doctorProfile = useAuthStore((s) => s.doctorProfile);
  const { records, loading, refreshing, error, refresh, reload } =
    useMyCreatedMedicalRecords(doctorProfile?.id ?? null);

  const doctorName = doctorProfile
    ? `${doctorProfile.firstName} ${doctorProfile.lastName}`.trim()
    : null;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historias creadas</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : error && records.length === 0 ? (
          <ListErrorState message={error} onRetry={reload} />
        ) : (
          <View style={styles.recordsList}>
            <Text style={styles.countText}>
              {records.length} {records.length === 1 ? "historia creada" : "historias creadas"}
              {doctorName ? ` · ${doctorName}` : ""}
            </Text>
            {records.map((r) => (
              <MedicalRecordListItem
                key={r.id}
                record={r}
                onPress={() =>
                  router.navigate({ pathname: "/admin/records/[id]", params: { id: r.id } })
                }
                doctorName="—"
              />
            ))}
            {records.length === 0 && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <ClipboardList size={28} color="#94A3B8" strokeWidth={2} />
                </View>
                <Text style={styles.emptyTitle}>Aún no has creado historias</Text>
                <Text style={styles.emptySubtitle}>
                  Las historias clínicas que crees desde las citas aparecerán aquí.
                </Text>
              </View>
            )}
            {refreshing && (
              <ActivityIndicator
                color={colors.accent}
                style={{ paddingVertical: 12 }}
              />
            )}
            <TouchableOpacity
              style={styles.refreshLink}
              onPress={refresh}
              disabled={refreshing}
            >
              <RefreshCw size={12} color="#0D9488" strokeWidth={2.5} />
              <Text style={styles.refreshText}>Actualizar</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: "transparent" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  headerSpacer: { width: 38 },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  countText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
    marginBottom: 8,
  },
  recordsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  refreshLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0D9488",
  },
});
