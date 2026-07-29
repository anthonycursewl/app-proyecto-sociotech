import { ClipboardList, FileCheck, FileEdit } from "lucide-react-native";
import { ListErrorState } from "@/components/common/ListErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { Text } from "@/components/common/SText";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import React, { useCallback, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { MedicalRecordListItem } from "@/components/medical-records/MedicalRecordListItem";
import { useMyCreatedMedicalRecords } from "@/shared/hooks/useMyCreatedMedicalRecords";
import { colors } from "@/shared/theme/colors";

function RecordSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonAccent} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTopRow}>
          <Skeleton width={32} height={32} borderRadius={9} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Skeleton width="60%" height={14} borderRadius={6} />
            <Skeleton width="25%" height={10} borderRadius={5} style={{ marginTop: 4 }} />
          </View>
          <Skeleton width={56} height={20} borderRadius={6} />
        </View>
        <Skeleton width="85%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
        <Skeleton width="45%" height={11} borderRadius={6} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export default function AdminRecordsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const doctorProfile = useAuthStore((s) => s.doctorProfile);
  const loadDoctorProfile = useAuthStore((s) => s.loadDoctorProfile);
  const { records, loading, refreshing, error, refresh, reload } =
    useMyCreatedMedicalRecords();

  useEffect(() => {
    loadDoctorProfile();
  }, [loadDoctorProfile]);

  const doctorName = doctorProfile
    ? `${doctorProfile.firstName ?? ""} ${doctorProfile.lastName ?? ""}`.trim() || null
    : null;

  const signedCount = useMemo(() => records.filter((r) => r.isSigned).length, [records]);
  const draftCount = records.length - signedCount;

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
        <View style={[styles.headerSection, { paddingTop: insets.top + 4 }]}>
          <Text style={styles.title}>Historias Clínicas</Text>
          <View style={styles.statsRow}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.skeletonStat}>
                <Skeleton width={36} height={36} borderRadius={10} />
                <Skeleton width={28} height={14} borderRadius={6} style={{ marginTop: 6 }} />
                <Skeleton width={48} height={10} borderRadius={5} style={{ marginTop: 4 }} />
              </View>
            ))}
          </View>
        </View>
        <View style={styles.list}>
          <RecordSkeleton />
          <RecordSkeleton />
          <RecordSkeleton />
          <RecordSkeleton />
          <RecordSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  if (error && records.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <View style={[styles.headerSection, { paddingTop: insets.top + 4 }]}>
          <Text style={styles.title}>Historias Clínicas</Text>
        </View>
        <ListErrorState message={error} onRetry={reload} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={[styles.headerSection, { paddingTop: insets.top + 4 }]}>
        <Text style={styles.title}>Historias Clínicas</Text>
        {doctorName && <Text style={styles.subtitle}>{doctorName}</Text>}

        {records.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: "#F0FDFA" }]}>
                <ClipboardList size={14} color="#0D9488" strokeWidth={2.2} />
              </View>
              <Text style={styles.statValue}>{records.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: "#ECFDF5" }]}>
                <FileCheck size={14} color="#059669" strokeWidth={2.2} />
              </View>
              <Text style={styles.statValue}>{signedCount}</Text>
              <Text style={styles.statLabel}>Firmadas</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: "#F1F5F9" }]}>
                <FileEdit size={14} color="#94A3B8" strokeWidth={2.2} />
              </View>
              <Text style={styles.statValue}>{draftCount}</Text>
              <Text style={styles.statLabel}>Borradores</Text>
            </View>
          </View>
        )}
      </View>
      <FlashList
        data={records}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={refresh}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <ClipboardList size={30} color="#CBD5E1" strokeWidth={1.8} />
            </View>
            <Text style={styles.emptyText}>Sin historias clínicas</Text>
            <Text style={styles.emptySubtext}>
              Las historias que crees desde las citas aparecerán aquí
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
    paddingTop: 4,
    paddingBottom: 24,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 1,
  },
  skeletonCard: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
  },
  skeletonAccent: {
    width: 3.5,
    backgroundColor: colors.skeleton,
  },
  skeletonContent: {
    flex: 1,
    padding: 14,
    paddingLeft: 12,
  },
  skeletonTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonStat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  emptyContainer: {
    paddingVertical: 64,
    alignItems: "center",
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 17,
    color: colors.textPrimary,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 19,
  },
});
