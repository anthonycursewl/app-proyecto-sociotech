import { StatusBar } from "expo-status-bar";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ReportsHeader } from "../../components/reports/ReportsHeader";
import { ReportCard, ReportData } from "../../components/reports/ReportCard";

const MOCK_REPORTS: ReportData[] = [
  {
    id: "1",
    title: "Reporte de Citas",
    description: "Resumen de todas las citas médicas del período seleccionado",
    type: "pdf",
    generatedAt: "2026-05-07",
    period: "Mayo 2026",
    size: "1.2 MB",
  },
  {
    id: "2",
    title: "Reporte Financiero",
    description: "Estado de cuentas por cobrar y pagar, ingresos y gastos",
    type: "excel",
    generatedAt: "2026-05-06",
    period: "Abril 2026",
    size: "856 KB",
  },
  {
    id: "3",
    title: "Lista de Pacientes",
    description: "Directorio completo de pacientes activos con datos de contacto",
    type: "csv",
    generatedAt: "2026-05-05",
    period: "Mayo 2026",
    size: "124 KB",
  },
  {
    id: "4",
    title: "Estadísticas de Laboratorio",
    description: "Resumen de exámenes realizados por tipo y resultado",
    type: "pdf",
    generatedAt: "2026-05-04",
    period: "Abril 2026",
    size: "2.1 MB",
  },
  {
    id: "5",
    title: "Reporte de Doctores",
    description: "Rendimiento de doctores por número de consultas y pacientes",
    type: "excel",
    generatedAt: "2026-05-03",
    period: "Mayo 2026",
    size: "945 KB",
  },
];

export default function ReportsScreen() {
  const renderItem = ({ item }: { item: ReportData }) => (
    <ReportCard report={item} />
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <ReportsHeader />
      <FlatList
        data={MOCK_REPORTS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.countText}>{MOCK_REPORTS.length} reportes disponibles</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  list: { padding: 16 },
  countText: { fontSize: 13, color: "#64748B", marginBottom: 12, fontWeight: "500" },
});