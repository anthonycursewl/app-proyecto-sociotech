import { AdminAppointmentCard, AdminAppointmentData } from "@/components/appointments/AdminAppointmentCard";
import { ManageAppointmentsHeader } from "@/components/appointments/ManageAppointmentsHeader";
import { FilterChips } from "@/components/common/FilterChips";
import { ListErrorState } from "@/components/common/ListErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { useAppointmentsList } from "@/shared/hooks/useAppointmentsList";
import { AppointmentFilter } from "@/shared/services/appointment.service";
import { colors } from "@/shared/theme/colors";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "@/components/common/SText";
import { SafeAreaView } from "react-native-safe-area-context";

const FILTER_OPTIONS: { value: AppointmentFilter; label: string }[] = [
  { value: "upcoming", label: "Próximas" },
  { value: "pending", label: "Pendientes" },
  { value: "all", label: "Todas" },
  { value: "history", label: "Historial" },
];

function AdminAppointmentRowSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <Skeleton width="60%" height={16} borderRadius={6} />
      <Skeleton width="45%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
      <Skeleton width="80%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
    </View>
  );
}

export default function AdminAppointmentsScreen() {
  const router = useRouter();
  const { appointments, loading, refreshing, error, filter, setFilter, refresh, reload } =
    useAppointmentsList("manage", "upcoming");

  const [searchQuery, setSearchQuery] = useState("");

  const handleAppointmentPress = useCallback(
    (id: string) => {
      router.push({ pathname: "/appointments/[id]", params: { id } });
    },
    [router],
  );

  const filteredAppointments = useMemo(() => {
    const list = appointments as AdminAppointmentData[];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (apt) =>
        apt.patientName.toLowerCase().includes(q) ||
        apt.serviceName.toLowerCase().includes(q) ||
        apt.doctorName.toLowerCase().includes(q),
    );
  }, [appointments, searchQuery]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <ManageAppointmentsHeader onSearch={setSearchQuery} />
        <View style={styles.list}>
          {Array.from({ length: 6 }).map((_, i) => (
            <AdminAppointmentRowSkeleton key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error && appointments.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <ManageAppointmentsHeader onSearch={setSearchQuery} />
        <ListErrorState message={error} onRetry={reload} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <ManageAppointmentsHeader onSearch={setSearchQuery} count={`${appointments.length} citas`}>
        <FilterChips options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
      </ManageAppointmentsHeader>
      <FlatList
        data={filteredAppointments}
        renderItem={({ item }) => (
          <AdminAppointmentCard
            appointment={item}
            onPress={() => handleAppointmentPress(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={refresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filter === "upcoming" && "No hay citas próximas en los siguientes 7 días"}
              {filter === "pending" && "No hay citas pendientes de confirmar"}
              {filter === "history" && "No hay citas pasadas en el historial"}
              {filter === "all" && "No se encontraron citas"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  emptyContainer: { paddingVertical: 40, alignItems: "center" },
  emptyText: { fontSize: 15, color: colors.textMuted, fontWeight: "500", textAlign: "center", paddingHorizontal: 40 },
});
