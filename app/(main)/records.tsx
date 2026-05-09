import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { MedicalRecordsHeader } from "../../components/records/MedicalRecordsHeader";
import { MedicalRecordCard, MedicalRecordData } from "../../components/records/MedicalRecordCard";

const MOCK_PATIENT_RECORDS: MedicalRecordData[] = [
  {
    id: "1",
    patientName: "Tú",
    patientId: "HM-2024-0142",
    type: "consultation",
    title: "Consulta de Control",
    description: "Control de presión arterial. Paciente presenta cuadro de infección respiratoria aguda.",
    date: "2026-05-05",
    doctorName: "Dr. Carlos Rodríguez",
    specialty: "Medicina General",
  },
  {
    id: "2",
    patientName: "Tú",
    patientId: "HM-2024-0142",
    type: "prescription",
    title: "Receta - Antibióticos",
    description: "Amoxicilina 500mg cada 8 horas por 7 días. Ibuprofeno 400mg según necesidad.",
    date: "2026-05-04",
    doctorName: "Dra. Ana Martínez",
    specialty: "Medicina General",
  },
  {
    id: "3",
    patientName: "Tú",
    patientId: "HM-2024-0142",
    type: "exam",
    title: "Resultado - Química Sanguínea",
    description: "Glucosa: 95 mg/dL (normal), Colesterol total: 210 mg/dL (elevado).",
    date: "2026-04-20",
    doctorName: "Dr. Carlos Rodríguez",
    specialty: "Medicina General",
  },
  {
    id: "4",
    patientName: "Tú",
    patientId: "HM-2024-0142",
    type: "consultation",
    title: "Consulta General",
    description: "Revisión de resultados de laboratorio. Se indican estudios de control.",
    date: "2026-03-15",
    doctorName: "Dr. Roberto Sánchez",
    specialty: "Medicina General",
  },
  {
    id: "5",
    patientName: "Tú",
    patientId: "HM-2024-0142",
    type: "procedure",
    title: "Toma de Muestra",
    description: "Se realiza extracción de sangre para análisis de laboratorio.",
    date: "2026-03-10",
    doctorName: "Tec. María González",
    specialty: "Laboratorio Clínico",
  },
];

export default function PatientRecordsScreen() {
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRecords, setFilteredRecords] = useState(MOCK_PATIENT_RECORDS);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredRecords(MOCK_PATIENT_RECORDS);
    } else {
      const lowerQuery = query.toLowerCase();
      setFilteredRecords(
        MOCK_PATIENT_RECORDS.filter(
          (record) =>
            record.title.toLowerCase().includes(lowerQuery) ||
            record.description.toLowerCase().includes(lowerQuery) ||
            record.doctorName.toLowerCase().includes(lowerQuery)
        )
      );
    }
  };

  const renderItem = ({ item }: { item: MedicalRecordData }) => (
    <MedicalRecordCard record={item} />
  );

  const userName = user ? `${user.firstName} ${user.lastName}` : "Paciente";

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <MedicalRecordsHeader
        title="Mi Historia"
        onSearch={handleSearch}
      />
      <FlatList
        data={filteredRecords}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.greetingText}>Hola, {userName.split(" ")[0]}</Text>
            <Text style={styles.countText}>
              {filteredRecords.length} registros en tu historia
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes registros clínicos</Text>
            <Text style={styles.emptySubtext}>Cuando visites al doctor, tus registros aparecerán aquí</Text>
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
  headerSection: {
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  countText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});