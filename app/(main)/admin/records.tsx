import { ClipboardList } from "lucide-react-native";
import { ListErrorState } from "@/components/common/ListErrorState";
import { Text } from "@/components/common/SText";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import React, { useCallback } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { MedicalRecordListItem } from "@/components/medical-records/MedicalRecordListItem";
import { useMyCreatedMedicalRecords } from "@/shared/hooks/useMyCreatedMedicalRecords";
import { colors } from "@/shared/theme/colors";

export default function AdminRecordsScreen() {
  const router = useRouter();
  const doctorProfile = useAuthStore((s) => s.doctorProfile);
  const { records, loading, refreshing, error, refresh, reload } =
    useMyCreatedMedicalRecords(doctorProfile?.id ?? null);

  const doctorName = doctorProfile
    ? `${doctorProfile.firstName} ${doctorProfile.lastName}`.trim()
    : null;

  const renderItem = useCallback(
    ({ item }: { item: import("@/shared/services/medicalRecord.service").MedicalRecordResponse }) => (
      <MedicalRecordListItem
        record={item}
        onPress={() => router.navigate({ pathname: "/admin/records/[id]", params: { id: item.id } })}
        doctorName="—"
      />
    ),
    [router],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <View style={styles.headerSection}>
          <Text style={styles.title}>Historias Clínicas</Text>
          {doctorName && <Text style={styles.subtitle}>{doctorName}</Text>}
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && records.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <View style={styles.headerSection}>
          <Text style={styles.title}>Historias Clínicas</Text>
          {doctorName && <Text style={styles.subtitle}>{doctorName}</Text>}
        </View>
        <ListErrorState message={error} onRetry={reload} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <FlashList
        data={records}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={refresh}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.title}>Historias Clínicas</Text>
            {doctorName && <Text style={styles.subtitle}>{doctorName}</Text>}
            <Text style={styles.countText}>
              {records.length} {records.length === 1 ? "historia" : "historias"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <ClipboardList size={28} color="#94A3B8" strokeWidth={2} />
            </View>
            <Text style={styles.emptyText}>No has creado historias clínicas</Text>
            <Text style={styles.emptySubtext}>
              Las historias que crees desde las citas aparecerán aquí.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerSection: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
    marginTop: 2,
  },
  countText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
    marginTop: 8,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
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
  emptyText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "700",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 18,
  },
});
