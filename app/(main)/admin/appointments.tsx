import { AdminAppointmentCard, AdminAppointmentData } from "@/components/appointments/AdminAppointmentCard";
import { ManageAppointmentsHeader } from "@/components/appointments/ManageAppointmentsHeader";
import { FilterChips } from "@/components/common/FilterChips";
import { ListErrorState } from "@/components/common/ListErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { useAppointmentsList } from "@/shared/hooks/useAppointmentsList";
import { appointmentService, AppointmentFilter } from "@/shared/services/appointment.service";
import { setCached } from "@/shared/cache/appointmentCache";
import { colors } from "@/shared/theme/colors";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Text } from "@/components/common/SText";
import { SafeAreaView } from "react-native-safe-area-context";

const FILTER_OPTIONS: { value: AppointmentFilter; label: string }[] = [
  { value: "upcoming", label: "Próximas" },
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "history", label: "Historial" },
];

type AdminFilter = AppointmentFilter | "mine";

const MINE_FILTER: { value: AdminFilter; label: string } = { value: "mine", label: "Mis Citas" };

function FilterChipsSkeleton() {
  return (
    <View style={styles.chipsRow}>
      <Skeleton width={90} height={32} borderRadius={999} />
      <Skeleton width={100} height={32} borderRadius={999} />
      <Skeleton width={80} height={32} borderRadius={999} />
      <Skeleton width={95} height={32} borderRadius={999} />
      <Skeleton width={100} height={32} borderRadius={999} />
    </View>
  );
}

function AdminAppointmentRowSkeleton() {
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
      <View style={styles.rowSkeletonPeople}>
        <View>
          <Skeleton width={90} height={14} borderRadius={6} />
          <Skeleton width={60} height={11} borderRadius={6} style={{ marginTop: 4 }} />
        </View>
        <View>
          <Skeleton width={100} height={14} borderRadius={6} />
          <Skeleton width={70} height={11} borderRadius={6} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>
  );
}

export default function AdminAppointmentsScreen() {
  const router = useRouter();
  const doctorProfile = useAuthStore((s) => s.doctorProfile);
  const loadDoctorProfile = useAuthStore((s) => s.loadDoctorProfile);
  const [activeChip, setActiveChip] = useState<AdminFilter>("upcoming");
  const statusFilter: AppointmentFilter = activeChip === "mine" ? "upcoming" : activeChip;
  const effectiveDoctorId = activeChip === "mine" && doctorProfile ? doctorProfile.id : undefined;
  const { appointments, loading, refreshing, error, refresh, reload } =
    useAppointmentsList("manage", statusFilter, effectiveDoctorId);

  const filterOptions = useMemo(() => {
    const base: { value: AdminFilter; label: string }[] = [...FILTER_OPTIONS];
    if (doctorProfile) {
      base.splice(1, 0, MINE_FILTER);
    }
    return base;
  }, [doctorProfile]);

  const handleFilterChange = useCallback((value: AdminFilter) => {
    setActiveChip(value);
  }, []);

  useEffect(() => {
    loadDoctorProfile();
  }, [loadDoctorProfile]);

  const handleAppointmentPress = useCallback(
    (id: string) => {
      router.navigate({ pathname: "/admin/appointments/[id]", params: { id } });
    },
    [router],
  );

  const handleStatusChange = useCallback(
    async (id: string, status: string) => {
      try {
        if (status === "COMPLETED") {
          const updated = await appointmentService.complete(id);
          setCached(updated);
        } else if (status === "CONFIRMED") {
          const updated = await appointmentService.confirm(id);
          setCached(updated);
        }
        await refresh();
      } catch {
        // error handled silently
      }
    },
    [refresh],
  );

  const renderAppointment = useCallback(
    ({ item }: { item: AdminAppointmentData }) => (
      <AdminAppointmentCard
        appointment={item}
        onPress={() => handleAppointmentPress(item.id)}
        onStatusChange={(status) => handleStatusChange(item.id, status)}
      />
    ),
    [handleAppointmentPress, handleStatusChange],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <ManageAppointmentsHeader>
          <FilterChipsSkeleton />
        </ManageAppointmentsHeader>
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
        <ManageAppointmentsHeader />
        <ListErrorState message={error} onRetry={reload} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <ManageAppointmentsHeader count={`${appointments.length} citas`}>
        <FilterChips options={filterOptions} value={activeChip} onChange={handleFilterChange} />
      </ManageAppointmentsHeader>
      <FlashList
        data={appointments as AdminAppointmentData[]}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={refresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeChip === "upcoming" && "No hay citas próximas en los siguientes 7 días"}
              {activeChip === "pending" && "No hay citas pendientes de confirmar"}
              {activeChip === "history" && "No hay citas pasadas en el historial"}
              {activeChip === "all" && "No se encontraron citas"}
              {activeChip === "mine" && "No tienes citas asignadas"}
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
  rowSkeletonPeople: {
    flexDirection: "row",
    gap: 24,
  },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  emptyContainer: { paddingVertical: 40, alignItems: "center" },
  emptyText: { fontSize: 15, color: colors.textMuted, fontWeight: "500", textAlign: "center", paddingHorizontal: 40 },
});
