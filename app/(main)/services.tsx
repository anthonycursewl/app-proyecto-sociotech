import { Stethoscope } from "lucide-react-native";
import { ListErrorState } from "@/components/common/ListErrorState";
import { ServiceCardSkeleton } from "@/components/common/Skeleton";
import { ServiceCard, ServiceData } from "@/components/services/ServiceCard";
import { ServiceDetailModal } from "@/components/services/ServiceDetailModal";
import { ServiceFormModal } from "@/components/services/ServiceFormModal";
import { ServicesHeader } from "@/components/services/ServicesHeader";
import { getApiErrorMessage } from "@/shared/errors/apiError";
import type { ServiceStatusFilter } from "@/shared/entities/Service";
import { useServicesList } from "@/shared/hooks/useServicesList";
import { usePermissions } from "@/shared/permissions/usePermissions";
import { serviceService } from "@/shared/services/service.service";
import { colors } from "@/shared/theme/colors";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Text } from "@/components/common/SText";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ServicesScreen() {
  const { canAccess } = usePermissions();
  const canCreate = canAccess("services:create");
  const canUpdate = canAccess("services:update");
  const canDelete = canAccess("services:delete");
  const {
    services,
    loading,
    refreshing,
    loadingMore,
    error,
    status,
    changeStatus,
    refresh,
    loadMore,
    reload,
    fetchServices,
  } = useServicesList("active");

  const [searchQuery, setSearchQuery] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceData | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailService, setDetailService] = useState<ServiceData | null>(null);

  const handleSearch = (query: string) => setSearchQuery(query);

  const openCreate = () => {
    setEditingService(null);
    setFormModalOpen(true);
  };

  const openDetail = useCallback((service: ServiceData) => {
    setDetailService(service);
    setDetailModalOpen(true);
  }, []);

  const openEditFromDetail = useCallback((service: ServiceData) => {
    setDetailModalOpen(false);
    setEditingService(service);
    setFormModalOpen(true);
  }, []);

  const handleFormSaved = () => {
    fetchServices();
  };

  const handleDetailChanged = () => {
    fetchServices();
  };

  const handleDeactivate = useCallback(async (service: ServiceData) => {
    if (!canDelete) return;
    try {
      await serviceService.deactivate(service.id);
      fetchServices();
    } catch (err) {
      Alert.alert("Error", getApiErrorMessage(err) || "No se pudo desactivar el servicio");
    }
  }, [canDelete, fetchServices]);

  const handleStatusChange = useCallback((next: ServiceStatusFilter) => {
    changeStatus(next);
  }, [changeStatus]);

  const filteredServices = searchQuery.trim()
    ? services.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : services;

  // Hide the trash icon when:
  //  - the user lacks delete permission
  //  - the user is browsing the "inactive" (trash) view
  //  - the user is in read-only mode (no create permission)
  const showDeleteOnCard = canDelete && canCreate && status !== "inactive";

  // Read-only mode: user cannot create, edit, or delete services.
  // They can only browse active services and view their detail.
  const isReadOnly = !canCreate;

  const renderItem = useCallback(({ item }: { item: ServiceData }) => (
    <ServiceCard
      service={item}
      onPress={() => openDetail(item)}
      onDelete={showDeleteOnCard ? handleDeactivate : undefined}
      canDelete={showDeleteOnCard}
    />
  ), [openDetail, showDeleteOnCard, handleDeactivate]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  };

  const getEmptyMessage = () => {
    if (searchQuery) return "No se encontraron servicios";
    if (status === "inactive") return "No hay servicios desactivados";
    if (status === "active") return "No hay servicios activos";
    return "No hay servicios disponibles";
  };

  const getCountText = () => {
    const n = filteredServices.length;
    const suffix = n !== 1 ? "s" : "";
    if (status === "inactive") return `${n} servicio${suffix} desactivado${n !== 1 ? "s" : ""}`;
    if (status === "active") return `${n} servicio${suffix} activo${n !== 1 ? "s" : ""}`;
    return `${n} servicio${suffix}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <ServicesHeader
          onSearch={handleSearch}
          onCreate={canCreate ? openCreate : undefined}
          status={status}
          onStatusChange={handleStatusChange}
          canCreate={canCreate}
        />
        <View style={styles.list}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error && services.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <ServicesHeader
          onSearch={handleSearch}
          onCreate={canCreate ? openCreate : undefined}
          status={status}
          onStatusChange={handleStatusChange}
          canCreate={canCreate}
        />
        <ListErrorState message={error} onRetry={reload} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <ServicesHeader
        onSearch={handleSearch}
        onCreate={canCreate ? openCreate : undefined}
        status={status}
        onStatusChange={handleStatusChange}
        canCreate={canCreate}
      />
      <FlashList
        data={filteredServices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <Text style={styles.countText}>{getCountText()}</Text>
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Stethoscope size={48} color="#bebebeff" strokeWidth={2} />
            <Text style={styles.emptyText}>{getEmptyMessage()}</Text>
            {!searchQuery && status !== "inactive" && canCreate && (
              <TouchableOpacity style={styles.emptyCta} onPress={openCreate}>
                <Text style={styles.emptyCtaText}>Crear Servicio</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      <ServiceDetailModal
        visible={detailModalOpen}
        service={detailService}
        onClose={() => setDetailModalOpen(false)}
        onEdit={openEditFromDetail}
        onChanged={handleDetailChanged}
        canUpdate={canUpdate}
        canDelete={canDelete}
        readOnly={isReadOnly}
      />
      <ServiceFormModal
        visible={formModalOpen}
        editingService={editingService}
        onClose={() => setFormModalOpen(false)}
        onSaved={handleFormSaved}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  countText: { fontSize: 13, color: colors.textSecondary, marginBottom: 12, fontWeight: "500" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 80 },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  emptyCta: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyCtaText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  footerLoader: { paddingVertical: 16, alignItems: "center" },
});
