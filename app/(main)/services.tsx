import { ServiceResponse, serviceService } from "@/shared/services/service.service";
import { StatusBar } from "expo-status-bar";
import * as LucideIcons from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ServiceCardSkeleton } from "../../components/common/Skeleton";
import { ServiceCard, ServiceData } from "../../components/services/ServiceCard";
import { ServicesHeader } from "../../components/services/ServicesHeader";

const PAGE_LIMIT = 20;

const mapService = (s: ServiceResponse): ServiceData => ({
  id: s.id,
  name: s.name,
  description: s.description ?? "",
  durationMin: s.durationMin,
  price: s.price ?? 0,
  isActive: s.isActive,
});

export default function ServicesScreen() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async (cursor?: string) => {
    try {
      const response = await serviceService.getAll({
        cursor,
        limit: PAGE_LIMIT,
        includeInactive: true,
      });
      if (cursor) {
        setServices((prev) => [...prev, ...response.data.map(mapService)]);
      } else {
        setServices(response.data.map(mapService));
      }
      setNextCursor(response.nextCursor);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar servicios");
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchServices();
      setLoading(false);
    })();
  }, [fetchServices]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    await fetchServices(nextCursor);
    setLoadingMore(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreate = () => {
    Alert.alert("Crear Servicio", "Funcionalidad próximamente");
  };

  const filteredServices = searchQuery.trim()
    ? services.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : services;

  const renderItem = ({ item }: { item: ServiceData }) => (
    <ServiceCard service={item} />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4CB1B1" />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <ServicesHeader onSearch={handleSearch} onCreate={handleCreate} />
        <View style={styles.list}>
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  if (error && services.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <ServicesHeader onSearch={handleSearch} onCreate={handleCreate} />
        <View style={styles.centerLoader}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText} onPress={() => { setLoading(true); fetchServices().then(() => setLoading(false)); }}>
            Toca para reintentar
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <ServicesHeader onSearch={handleSearch} onCreate={handleCreate} />
      <FlatList
        data={filteredServices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
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
            {!searchQuery && (
              <TouchableOpacity style={styles.emptyCta} onPress={handleCreate}>
                <Text style={styles.emptyCtaText}>Crear Servicio</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  list: { padding: 16 },
  countText: { fontSize: 13, color: "#64748B", marginBottom: 12, fontWeight: "500" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, color: "#64748B", fontWeight: "600", textAlign: "center", marginBottom: 20, marginTop: 20 },
  emptyCta: {
    backgroundColor: "#4CB1B1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#4CB1B1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyCtaText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  centerLoader: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  footerLoader: { paddingVertical: 16, alignItems: "center" },
  errorText: { fontSize: 15, color: "#EF4444", fontWeight: "500" },
  retryText: { fontSize: 14, color: "#4CB1B1", fontWeight: "600", marginTop: 4 },
});
