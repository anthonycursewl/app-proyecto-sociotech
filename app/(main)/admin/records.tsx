import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ManageRecordsHeader } from "../../../components/records/ManageRecordsHeader";
import { AdminRecordCard, AdminRecordData } from "../../../components/records/AdminRecordCard";

const MOCK_ADMIN_RECORDS: AdminRecordData[] = [
  {
    id: "1",
    patientName: "María García",
    patientId: "HM-2024-0142",
    type: "consultation",
    title: "Consulta de Control",
    description: "Paciente presenta cuadro de infección respiratoria aguda. Se indican estudios.",
    date: "2026-05-05",
    doctorName: "Dr. Carlos Rodríguez",
    specialty: "Medicina General",
    phone: "0414-1234567",
  },
  {
    id: "2",
    patientName: "Juan Pérez",
    patientId: "HM-2024-0089",
    type: "prescription",
    title: "Receta - Antibióticos",
    description: "Amoxicilina 500mg cada 8 horas por 7 días. Ibuprofeno 400mg según necesidad.",
    date: "2026-05-04",
    doctorName: "Dra. Ana Martínez",
    specialty: "Cardiología",
    phone: "0412-9876543",
  },
  {
    id: "3",
    patientName: "Laura Hernández",
    patientId: "HM-2023-0567",
    type: "exam",
    title: "Resultado - Química Sanguínea",
    description: "Glucosa: 95 mg/dL (normal), Colesterol total: 210 mg/dL (elevado).",
    date: "2026-05-03",
    doctorName: "Tec. María González",
    specialty: "Laboratorio Clínico",
    phone: "0414-5551234",
  },
  {
    id: "4",
    patientName: "Carlos López",
    patientId: "HM-2024-0234",
    type: "consultation",
    title: "Valoración Cardiología",
    description: "Electrocardiograma dentro de parámetros normales. Se recomienda ejercicio.",
    date: "2026-05-02",
    doctorName: "Dra. Ana Martínez",
    specialty: "Cardiología",
    phone: "0424-2223333",
  },
  {
    id: "5",
    patientName: "Ana Martínez",
    patientId: "HM-2023-0412",
    type: "procedure",
    title: "Curación de Herida",
    description: "Se realiza curación de herida postquirúrgica en miembro inferior derecho.",
    date: "2026-05-01",
    doctorName: "Dr. Roberto Sánchez",
    specialty: "Cirugía General",
    phone: "0416-6667777",
  },
  {
    id: "6",
    patientName: "Pedro Ramírez",
    patientId: "HM-2024-0318",
    type: "exam",
    title: "Rayos X - Tórax",
    description: "Radiografía de tórax sin alteraciones significativas. Campos pulmonares limpios.",
    date: "2026-04-30",
    doctorName: "Tec. José Martínez",
    specialty: "Radiología",
    phone: "0426-8889999",
  },
];

export default function AdminRecordsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRecords, setFilteredRecords] = useState(MOCK_ADMIN_RECORDS);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredRecords(MOCK_ADMIN_RECORDS);
    } else {
      const lowerQuery = query.toLowerCase();
      setFilteredRecords(
        MOCK_ADMIN_RECORDS.filter(
          (record) =>
            record.patientName.toLowerCase().includes(lowerQuery) ||
            record.title.toLowerCase().includes(lowerQuery) ||
            record.doctorName.toLowerCase().includes(lowerQuery)
        )
      );
    }
  };

  const renderItem = ({ item }: { item: AdminRecordData }) => (
    <AdminRecordCard record={item} />
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <ManageRecordsHeader onSearch={handleSearch} />
      <FlatList
        data={filteredRecords}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.countText}>
            {filteredRecords.length} registros encontrados
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron registros</Text>
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