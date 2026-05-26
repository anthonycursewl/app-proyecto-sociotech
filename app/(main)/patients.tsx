import { ListErrorState } from "@/components/common/ListErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { PatientCard, PatientData } from "@/components/patients/PatientCard";
import { ManagePatientsHeader } from "@/components/patients/ManagePatientsHeader";
import { usePatientsList } from "@/shared/hooks/usePatientsList";
import { patientService, PatientMetrics } from "@/shared/services/patient.service";
import { colors } from "@/shared/theme/colors";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { Text } from "@/components/common/SText";
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
  const { patients, loading, refreshing, loadingMore, error, activeFilter, changeFilter, refresh, loadMore, reload } =
    usePatientsList();
  const [metrics, setMetrics] = useState<PatientMetrics | undefined>(undefined);

  useEffect(() => {
    patientService.getMetrics().then(setMetrics).catch(() => {});
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(q) ||
        patient.medicalId.toLowerCase().includes(q) ||
        patient.email.toLowerCase().includes(q),
    );
  }, [patients, searchQuery]);

  const renderItem = ({ item }: { item: PatientData }) => (
    <PatientCard
      patient={item}
      onPress={() => router.push(`/patient/${item.id}` as any)}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <ManagePatientsHeader onSearch={setSearchQuery} metrics={metrics} activeFilter={activeFilter} onFilterChange={changeFilter} />
        <View style={styles.list}>
          {Array.from({ length: 6 }).map((_, i) => (
            <PatientRowSkeleton key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error && patients.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <ManagePatientsHeader onSearch={setSearchQuery} metrics={metrics} activeFilter={activeFilter} onFilterChange={changeFilter} />
        <ListErrorState message={error} onRetry={reload} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <ManagePatientsHeader onSearch={setSearchQuery} metrics={metrics} activeFilter={activeFilter} onFilterChange={changeFilter} />
      <FlatList
        data={filteredPatients}
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
            {filteredPatients.length} paciente{filteredPatients.length !== 1 ? "s" : ""}{" "}
            encontrado{filteredPatients.length !== 1 ? "s" : ""}
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
