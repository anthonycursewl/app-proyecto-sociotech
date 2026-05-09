import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ExamsHeader } from "../../components/exams/ExamsHeader";
import { ExamCard, ExamData } from "../../components/exams/ExamCard";

const MOCK_EXAMS: ExamData[] = [
  {
    id: "1",
    patientName: "María García",
    patientId: "HM-2024-0142",
    examType: "Química Sanguínea",
    title: "Química Sanguínea Completa",
    description: "Incluye glucosa, colesterol, triglicéridos, funciones hepática y renal.",
    date: "2026-05-05",
    status: "ready",
    resultUrl: "https://example.com/result/1",
  },
  {
    id: "2",
    patientName: "Juan Pérez",
    patientId: "HM-2024-0089",
    examType: "Hemograma",
    title: "Hemograma Completo",
    description: "Análisis de células sanguineas, hemoglobina, hematocrito y más.",
    date: "2026-05-04",
    status: "completed",
  },
  {
    id: "3",
    patientName: "Laura Hernández",
    patientId: "HM-2023-0567",
    examType: "Rayos X",
    title: "Radiografía de Tórax",
    description: "Estudio de imagen para evaluar campos pulmonares y estructura torácica.",
    date: "2026-05-03",
    status: "pending",
  },
  {
    id: "4",
    patientName: "Carlos López",
    patientId: "HM-2024-0234",
    examType: "Orina",
    title: "Análisis de Orina",
    description: "Evaluación de propiedades físicas, químicas y microscópicas.",
    date: "2026-05-02",
    status: "ready",
    resultUrl: "https://example.com/result/4",
  },
  {
    id: "5",
    patientName: "Ana Martínez",
    patientId: "HM-2023-0412",
    examType: "Electrocardiograma",
    title: "ECG de 12 Derivaciones",
    description: "Estudio eléctrico del ritmo cardiaco en reposo.",
    date: "2026-05-01",
    status: "completed",
  },
];

export default function ExamsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExams, setFilteredExams] = useState(MOCK_EXAMS);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredExams(MOCK_EXAMS);
    } else {
      const lowerQuery = query.toLowerCase();
      setFilteredExams(
        MOCK_EXAMS.filter(
          (exam) =>
            exam.patientName.toLowerCase().includes(lowerQuery) ||
            exam.title.toLowerCase().includes(lowerQuery) ||
            exam.examType.toLowerCase().includes(lowerQuery)
        )
      );
    }
  };

  const renderItem = ({ item }: { item: ExamData }) => (
    <ExamCard exam={item} />
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <ExamsHeader onSearch={handleSearch} />
      <FlatList
        data={filteredExams}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.countText}>
            {filteredExams.length} exámenes encontrados
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron exámenes</Text>
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
  emptyContainer: { paddingVertical: 40, alignItems: "center" },
  emptyText: { fontSize: 15, color: "#94A3B8", fontWeight: "500" },
});