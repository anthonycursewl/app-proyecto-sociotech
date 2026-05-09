import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ServicesHeader } from "../../components/services/ServicesHeader";
import { ServiceCard, ServiceData } from "../../components/services/ServiceCard";

const MOCK_SERVICES: ServiceData[] = [
  {
    id: "1",
    name: "Medicina General",
    description: "Consulta general para diagnóstico y tratamiento de enfermedades comunes",
    durationMin: 30,
    price: 25.00,
    category: "General",
    isActive: true,
  },
  {
    id: "2",
    name: "Cardiología",
    description: "Estudio y tratamiento del corazón y del sistema circulatorio",
    durationMin: 45,
    price: 60.00,
    category: "Especialidad",
    isActive: true,
  },
  {
    id: "3",
    name: "Pediatría",
    description: "Atención médica para bebés, niños y adolescentes",
    durationMin: 30,
    price: 30.00,
    category: "Especialidad",
    isActive: true,
  },
  {
    id: "4",
    name: "Laboratorio Clínico",
    description: "Análisis de sangre, orina y otros estudios de laboratorio",
    durationMin: 15,
    price: 15.00,
    category: "Diagnóstico",
    isActive: true,
  },
  {
    id: "5",
    name: "Odontología",
    description: "Cuidado dental preventivo y tratamientos odontológicos",
    durationMin: 40,
    price: 35.00,
    category: "Especialidad",
    isActive: true,
  },
  {
    id: "6",
    name: "Psicología",
    description: "Terapia y acompañamiento psicológico profesional",
    durationMin: 50,
    price: 45.00,
    category: "Mental",
    isActive: false,
  },
  {
    id: "7",
    name: "Rayos X",
    description: "Estudios radiológicos para diagnóstico por imagen",
    durationMin: 20,
    price: 40.00,
    category: "Diagnóstico",
    isActive: true,
  },
  {
    id: "8",
    name: "Oftalmología",
    description: "Especialidad médica dedicada al cuidado de los ojos",
    durationMin: 30,
    price: 50.00,
    category: "Especialidad",
    isActive: true,
  },
];

export default function ServicesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredServices, setFilteredServices] = useState(MOCK_SERVICES);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredServices(MOCK_SERVICES);
    } else {
      const lowerQuery = query.toLowerCase();
      setFilteredServices(
        MOCK_SERVICES.filter(
          (service) =>
            service.name.toLowerCase().includes(lowerQuery) ||
            service.description.toLowerCase().includes(lowerQuery) ||
            service.category?.toLowerCase().includes(lowerQuery)
        )
      );
    }
  };

  const renderItem = ({ item }: { item: ServiceData }) => (
    <ServiceCard service={item} />
  );

  const activeCount = filteredServices.filter((s) => s.isActive).length;

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <ServicesHeader onSearch={handleSearch} />
      <FlatList
        data={filteredServices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.countText}>
            {filteredServices.length} servicios
            {searchQuery ? ` encontrados` : ` disponibles`}
            {filteredServices.length !== MOCK_SERVICES.length && ` de ${MOCK_SERVICES.length}`}
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron servicios</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  list: {
    padding: 16,
  },
  countText: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 12,
    fontWeight: "500",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#94A3B8",
    fontWeight: "500",
  },
});