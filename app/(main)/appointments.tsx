import { AppointmentCard, AppointmentData } from "@/components/appointments/AppointmentCard";
import { AppointmentsHeader } from "@/components/appointments/AppointmentsHeader";
import { FilterChips } from "@/components/common/FilterChips";
import { ListErrorState } from "@/components/common/ListErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { useAppointmentsList } from "@/shared/hooks/useAppointmentsList";
import { AppointmentFilter } from "@/shared/services/appointment.service";
import { colors } from "@/shared/theme/colors";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
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

function AppointmentRowSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <Skeleton width="55%" height={16} borderRadius={6} />
      <Skeleton width="40%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
      <Skeleton width="70%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
    </View>
  );
}

export default function PatientAppointmentsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { appointments, loading, refreshing, error, filter, setFilter, refresh, reload } =
    useAppointmentsList("own", "upcoming");

  const [searchQuery, setSearchQuery] = useState("");

  const handleAppointmentPress = useCallback(
    (id: string) => {
      router.push({ pathname: "/appointments/[id]", params: { id } });
    },
    [router],
  );

  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return appointments as AppointmentData[];
    const q = searchQuery.toLowerCase();
    return (appointments as AppointmentData[]).filter(
      (apt) =>
        apt.serviceName.toLowerCase().includes(q) ||
        apt.doctorName.toLowerCase().includes(q),
    );
  }, [appointments, searchQuery]);

  const userName = user ? `${user.firstName} ${user.lastName}` : "Paciente";

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <AppointmentsHeader title="Mis Citas" onSearch={setSearchQuery} />
        <View style={styles.list}>
          {Array.from({ length: 5 }).map((_, i) => (
            <AppointmentRowSkeleton key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error && appointments.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <AppointmentsHeader title="Mis Citas" onSearch={setSearchQuery} />
        <ListErrorState message={error} onRetry={reload} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <AppointmentsHeader
        title="Mis Citas"
        onSearch={setSearchQuery}
        count={`${appointments.length} citas`}
      >
        <FilterChips options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
      </AppointmentsHeader>
      <FlatList
        data={filteredAppointments}
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            onPress={() => handleAppointmentPress(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={refresh}
        ListHeaderComponent={
          <Text style={styles.greetingText}>Hola, {userName.split(" ")[0]}</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes citas</Text>
            <Text style={styles.emptySubtext}>
              {filter === "upcoming" && "No tienes citas próximas en los siguientes 7 días"}
              {filter === "pending" && "No tienes citas pendientes de confirmar"}
              {filter === "history" && "No tienes citas pasadas en tu historial"}
              {filter === "all" && "Contacta a tu médico para agendar una cita"}
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
  greetingText: { fontSize: 18, fontWeight: "600", color: colors.textPrimary, marginBottom: 12 },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  emptyContainer: { paddingVertical: 60, alignItems: "center" },
  emptyText: { fontSize: 16, color: colors.textSecondary, fontWeight: "600", marginBottom: 8 },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
