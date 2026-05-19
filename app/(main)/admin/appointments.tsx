import { AdminAppointmentCard, AdminAppointmentData } from "@/components/appointments/AdminAppointmentCard";
import { ManageAppointmentsHeader } from "@/components/appointments/ManageAppointmentsHeader";
import { ListErrorState } from "@/components/common/ListErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { useAppointmentsList } from "@/shared/hooks/useAppointmentsList";
import { colors } from "@/shared/theme/colors";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { Text } from "@/components/common/SText";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const { appointments, loading, refreshing, loadingMore, error, refresh, loadMore, reload } =
    useAppointmentsList("manage");

  const [searchQuery, setSearchQuery] = useState("");

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
      <ManageAppointmentsHeader onSearch={setSearchQuery} />
      <FlatList
        data={filteredAppointments}
        renderItem={({ item }) => <AdminAppointmentCard appointment={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <Text style={styles.countText}>
            {filteredAppointments.length} citas encontradas
          </Text>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ paddingVertical: 16 }} color={colors.accent} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron citas</Text>
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
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  emptyContainer: { paddingVertical: 40, alignItems: "center" },
  emptyText: { fontSize: 15, color: colors.textMuted, fontWeight: "500" },
});
