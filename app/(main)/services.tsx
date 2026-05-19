import { ListErrorState } from "@/components/common/ListErrorState";
import { ServiceCardSkeleton } from "@/components/common/Skeleton";
import { ServiceCard, ServiceData } from "@/components/services/ServiceCard";
import { ServiceFormModal } from "@/components/services/ServiceFormModal";
import { ServicesHeader } from "@/components/services/ServicesHeader";
import { useServicesList } from "@/shared/hooks/useServicesList";
import { usePermissions } from "@/shared/permissions/usePermissions";
import { colors } from "@/shared/theme/colors";
import { StatusBar } from "expo-status-bar";
import * as LucideIcons from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ServicesScreen() {
  const { canAccess } = usePermissions();
  const canCreate = canAccess("services:create");
  const canUpdate = canAccess("services:update");
  const {
    services,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
    reload,
    fetchServices,
  } = useServicesList();

  const [searchQuery, setSearchQuery] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceData | null>(null);

  const handleSearch = (query: string) => setSearchQuery(query);

  const openCreate = () => {
    setEditingService(null);
    setFormModalOpen(true);
  };

  const openEdit = (service: ServiceData) => {
    if (!canUpdate) return;
    setEditingService(service);
    setFormModalOpen(true);
  };

  const handleFormSaved = () => {
    fetchServices();
  };

  const filteredServices = searchQuery.trim()
    ? services.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : services;

  const renderItem = ({ item }: { item: ServiceData }) => (
    <ServiceCard service={item} onPress={() => openEdit(item)} />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <ServicesHeader onSearch={handleSearch} onCreate={canCreate ? openCreate : undefined} />
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
        <ServicesHeader onSearch={handleSearch} onCreate={canCreate ? openCreate : undefined} />
        <ListErrorState message={error} onRetry={reload} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <ServicesHeader onSearch={handleSearch} onCreate={canCreate ? openCreate : undefined} />
      <FlatList
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
          <Text style={styles.countText}>
            {filteredServices.length} servicio{filteredServices.length !== 1 ? "s" : ""}
          </Text>
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <LucideIcons.Stethoscope size={48} color="#bebebeff" strokeWidth={2} />
            <Text style={styles.emptyText}>
              {searchQuery ? "No se encontraron servicios" : "No hay servicios disponibles"}
            </Text>
            {!searchQuery && canCreate && (
              <TouchableOpacity style={styles.emptyCta} onPress={openCreate}>
                <Text style={styles.emptyCtaText}>Crear Servicio</Text>
              </TouchableOpacity>
            )}
          </View>
        }
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
