import { ListErrorState } from "@/components/common/ListErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { Text } from "@/components/common/SText";
import { ManagePatientsHeader } from "@/components/patients/ManagePatientsHeader";
import { PatientCard, PatientData } from "@/components/patients/PatientCard";
import { usePatientsList } from "@/shared/hooks/usePatientsList";
import { PatientMetrics, patientService } from "@/shared/services/patient.service";
import { colors } from "@/shared/theme/colors";
import { StatusBar } from "expo-status-bar";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, InteractionManager, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function PatientRowSkeleton() {
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

export default function PatientsScreen() {
  const router = useRouter();
  const { 
    patients, 
    loading, 
    refreshing, 
    loadingMore, 
    error, 
    activeFilter, 
    changeFilter, 
    refresh, 
    loadMore, 
    reload,
    setQuery 
  } = usePatientsList();
  const [metrics, setMetrics] = useState<PatientMetrics | undefined>(undefined);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      patientService.getMetrics().then(setMetrics).catch(() => {});
    });
    return () => task.cancel();
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: PatientData }) => (
      <PatientCard
        patient={item}
        onPress={() => router.navigate({ pathname: "/admin/patients/[id]", params: { id: item.id } })}
      />
    ),
    [router],
  );

  const screen = (
    <>
      <ManagePatientsHeader onSearch={setQuery} metrics={metrics} activeFilter={activeFilter} onFilterChange={changeFilter} />
      {loading ? (
        <View style={styles.list}>
          {Array.from({ length: 6 }).map((_, i) => (
            <PatientRowSkeleton key={i} />
          ))}
        </View>
      ) : error && patients.length === 0 ? (
        <ListErrorState message={error} onRetry={reload} />
      ) : (
        <FlashList
          data={patients}
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
              {patients.length} paciente{patients.length !== 1 ? "s" : ""} {" "}
              encontrado{patients.length !== 1 ? "s" : ""}
            </Text>
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={{ paddingVertical: 16 }} color={colors.accent} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron pacientes</Text>
            </View>
          }
        />
      )}
    </>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        {screen}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: "transparent" },
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
