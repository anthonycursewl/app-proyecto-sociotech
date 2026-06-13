import { ListErrorState } from "@/components/common/ListErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { DoctorCard, DoctorData } from "@/components/doctors/DoctorCard";
import { ManageDoctorsHeader } from "@/components/doctors/ManageDoctorsHeader";
import { useDoctorsList } from "@/shared/hooks/useDoctorsList";
import { doctorService, DoctorMetrics } from "@/shared/services/doctor.service";
import { colors } from "@/shared/theme/colors";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, InteractionManager, StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Text } from "@/components/common/SText";
import { SafeAreaView } from "react-native-safe-area-context";

function DoctorRowSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <Skeleton width={44} height={44} borderRadius={22} />
      <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
        <Skeleton width="60%" height={15} borderRadius={6} />
        <Skeleton width="40%" height={12} borderRadius={6} />
        <Skeleton width="75%" height={12} borderRadius={6} />
      </View>
    </View>
  );
}

export default function DoctorsScreen() {
  const router = useRouter();
  const { doctors, loading, refreshing, loadingMore, error, activeFilter, changeSearch, changeFilter, refresh, loadMore, reload } = useDoctorsList();
  const [metrics, setMetrics] = useState<DoctorMetrics | undefined>(undefined);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      doctorService.getMetrics().then(setMetrics).catch(() => {});
    });
    return () => task.cancel();
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: DoctorData }) => (
      <DoctorCard doctor={item} onPress={() => router.navigate({ pathname: "/doctor/[id]", params: { id: item.id } })} />
    ),
    [router],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <ManageDoctorsHeader onSearch={changeSearch} metrics={metrics} activeFilter={activeFilter} onFilterChange={changeFilter} />
        <View style={styles.list}>
          {Array.from({ length: 6 }).map((_, i) => (
            <DoctorRowSkeleton key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error && doctors.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <ManageDoctorsHeader onSearch={changeSearch} metrics={metrics} activeFilter={activeFilter} onFilterChange={changeFilter} />
        <ListErrorState message={error} onRetry={reload} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <ManageDoctorsHeader onSearch={changeSearch} metrics={metrics} activeFilter={activeFilter} onFilterChange={changeFilter} />
      <FlashList
        data={doctors}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <Text style={styles.countText}>
            {doctors.length} doctor{doctors.length !== 1 ? "es" : ""} encontrado{doctors.length !== 1 ? "s" : ""}
          </Text>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ paddingVertical: 16 }} color={colors.accent} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron doctores</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  countText: { fontSize: 13, color: colors.textSecondary, marginBottom: 12, fontWeight: "500" },
  skeletonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  emptyContainer: { paddingVertical: 40, alignItems: "center" },
  emptyText: { fontSize: 15, color: colors.textMuted, fontWeight: "500" },
});
