import { FileText } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Text } from "@/components/common/SText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ListErrorState } from "@/components/common/ListErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { MedicalRecordListItem } from "@/components/medical-records/MedicalRecordListItem";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { useMyMedicalRecords } from "@/shared/hooks/useMyMedicalRecords";
import { colors } from "@/shared/theme/colors";

function RecordSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonRow}>
        <Skeleton width={40} height={40} borderRadius={10} />
        <View style={styles.skeletonBody}>
          <View style={styles.skeletonHeaderRow}>
            <Skeleton width="65%" height={14} borderRadius={6} />
            <Skeleton width={52} height={18} borderRadius={6} />
          </View>
          <Skeleton width="85%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
          <Skeleton width="40%" height={11} borderRadius={6} style={{ marginTop: 6 }} />
        </View>
      </View>
    </View>
  );
}

export default function PatientRecordsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const { records, loading, refreshing, error, refresh, reload } = useMyMedicalRecords();

  const userName = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Paciente" : "Paciente";

  const renderItem = useCallback(
    ({ item }: { item: import("@/shared/services/medicalRecord.service").MedicalRecordResponse }) => (
      <MedicalRecordListItem
        record={item}
        onPress={() => router.navigate({ pathname: "/records/[id]", params: { id: item.id } })}
      />
    ),
    [router],
  );

  const headerContent = (
    <View style={styles.headerContent}>
      <Text style={styles.greetingText}>Hola, {userName.split(" ")[0]}</Text>
      <Text style={styles.subtitleText}>Tus registros clínicos</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={[styles.headerWrap, { paddingTop: insets.top + 20 }]}>
          <View style={styles.headerContent}>
            <Skeleton width={140} height={20} borderRadius={6} />
            <Skeleton width={150} height={14} borderRadius={6} style={{ marginTop: 8 }} />
          </View>
        </View>
        <View style={styles.list}>
          <RecordSkeleton />
          <RecordSkeleton />
          <RecordSkeleton />
          <RecordSkeleton />
        </View>
      </View>
    );
  }

  if (error && records.length === 0) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={[styles.headerWrap, { paddingTop: insets.top + 20 }]}>
          {headerContent}
        </View>
        <ListErrorState message={error} onRetry={reload} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={[styles.headerWrap, { paddingTop: insets.top + 20 }]}>
        {headerContent}
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
            <View style={styles.emptyIconWrap}>
              <FileText size={28} color={colors.textMuted} strokeWidth={2} />
            </View>
            <Text style={styles.emptyText}>No tienes registros clínicos</Text>
            <Text style={styles.emptySubtext}>
              Cuando visites al doctor, tus historias clínicas aparecerán aquí
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrap: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerContent: {
    paddingTop: 8,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonBody: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.skeleton,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
