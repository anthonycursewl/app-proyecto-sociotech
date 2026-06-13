import { AppointmentCard, AppointmentData } from "@/components/appointments/AppointmentCard";
import { AppointmentsHeader } from "@/components/appointments/AppointmentsHeader";
import { FloatingActionButton } from "@/components/common/FloatingActionButton";
import { FilterChips } from "@/components/common/FilterChips";
import { ListErrorState } from "@/components/common/ListErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { useAppointmentsList } from "@/shared/hooks/useAppointmentsList";
import { AppointmentFilter } from "@/shared/services/appointment.service";
import { colors } from "@/shared/theme/colors";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { InteractionManager, StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Text } from "@/components/common/SText";
import { SafeAreaView } from "react-native-safe-area-context";

const FILTER_OPTIONS: { value: AppointmentFilter; label: string }[] = [
  { value: "upcoming", label: "Próximas" },
  { value: "pending", label: "Pendientes" },
  { value: "history", label: "Historial" },
];

function FilterChipsSkeleton() {
  return (
    <View style={styles.chipsRow}>
      <Skeleton width={90} height={32} borderRadius={999} />
      <Skeleton width={100} height={32} borderRadius={999} />
      <Skeleton width={80} height={32} borderRadius={999} />
      <Skeleton width={95} height={32} borderRadius={999} />
    </View>
  );
}

function AppointmentRowSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.rowSkeletonHeader}>
        <View>
          <Skeleton width={60} height={10} borderRadius={6} />
          <Skeleton width={40} height={26} borderRadius={8} style={{ marginTop: 4 }} />
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Skeleton width={72} height={22} borderRadius={8} />
          <Skeleton width={48} height={10} borderRadius={6} style={{ marginTop: 4 }} />
        </View>
      </View>
      <Skeleton width={8} height={1} borderRadius={0.5} style={{ marginVertical: 12 }} />
      <Skeleton width={8} height={8} borderRadius={4} style={{ marginBottom: 8 }} />
      <Skeleton width="75%" height={15} borderRadius={6} />
    </View>
  );
}

export default function PatientAppointmentsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);

  const canCreateAppointment = permissions.some(
    (p) => p === "appointments:create:own" || p === "appointments:create",
  );
  const { appointments, loading, refreshing, error, filter, setFilter, refresh, reload } =
    useAppointmentsList("own", "upcoming");

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      router.prefetch("/(main)/appointments/create");
    });
  }, [router]);

  const handleAppointmentPress = useCallback(
    (id: string) => {
      router.prefetch({ pathname: "/appointments/[id]", params: { id } });
      router.navigate({ pathname: "/appointments/[id]", params: { id } });
    },
    [router],
  );

  const renderAppointment = useCallback(
    ({ item }: { item: AppointmentData }) => (
      <AppointmentCard
        appointment={item}
        onPress={() => handleAppointmentPress(item.id)}
      />
    ),
    [handleAppointmentPress],
  );

  const userName = user ? `${user.firstName} ${user.lastName}` : "Paciente";

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
          <StatusBar style="dark" />
          <AppointmentsHeader title="Mis Citas">
            <FilterChipsSkeleton />
          </AppointmentsHeader>
          <View style={styles.list}>
            {Array.from({ length: 5 }).map((_, i) => (
              <AppointmentRowSkeleton key={i} />
            ))}
          </View>
        </SafeAreaView>
        {canCreateAppointment && (
          <FloatingActionButton onPress={() => router.push({ pathname: "/appointments/create" })} />
        )}
      </View>
    );
  }

  if (error && appointments.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
          <StatusBar style="dark" />
          <AppointmentsHeader title="Mis Citas" />
          <ListErrorState message={error} onRetry={reload} />
        </SafeAreaView>
        {canCreateAppointment && (
          <FloatingActionButton onPress={() => router.push({ pathname: "/appointments/create" })} />
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <AppointmentsHeader
          title="Mis Citas"
          count={`${appointments.length} citas`}
        >
          <FilterChips options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
        </AppointmentsHeader>
        <FlashList
          data={appointments as AppointmentData[]}
          renderItem={renderAppointment}
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
              </Text>
            </View>
          }
        />
      </SafeAreaView>
      {canCreateAppointment && (
        <FloatingActionButton onPress={() => router.push({ pathname: "/appointments/create" })} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  greetingText: { fontSize: 18, fontWeight: "600", color: colors.textPrimary, marginBottom: 12 },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  rowSkeletonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
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
