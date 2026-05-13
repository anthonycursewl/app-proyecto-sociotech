import { StatusBar } from "expo-status-bar";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "@/components/common/SText"
import { SafeAreaView } from "react-native-safe-area-context";
import * as LucideIcons from "lucide-react-native";
import { AuditHeader } from "../../components/audit/AuditHeader";

interface AuditLog {
  id: string;
  action: string;
  user: string;
  time: string;
  type: "info" | "create" | "update" | "warning" | "error";
}

const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: "1", action: "Inicio de sesión", user: "María García", time: "09:15 AM", type: "info" },
  { id: "2", action: "Creó cita médica", user: "Dr. Carlos Rodríguez", time: "09:42 AM", type: "create" },
  { id: "3", action: "Actualizó historia clínica", user: "Dra. Ana Martínez", time: "10:05 AM", type: "update" },
  { id: "4", action: "Canceló cita", user: "Sistema", time: "10:30 AM", type: "warning" },
  { id: "5", action: "Exportó reporte PDF", user: "Admin", time: "11:15 AM", type: "info" },
  { id: "6", action: "Modificó datos de paciente", user: "Asistente", time: "11:45 AM", type: "update" },
  { id: "7", action: "Nueva receta creada", user: "Dr. Roberto Sánchez", time: "12:00 PM", type: "create" },
  { id: "8", action: "Error de autenticación", user: "Usuario anónimo", time: "12:30 PM", type: "error" },
];

const TYPE_CONFIG: Record<AuditLog["type"], { icon: React.ElementType; color: string }> = {
  info: { icon: LucideIcons.Info, color: "#3B82F6" },
  create: { icon: LucideIcons.PlusCircle, color: "#22C55E" },
  update: { icon: LucideIcons.Edit, color: "#F59E0B" },
  warning: { icon: LucideIcons.AlertTriangle, color: "#F97316" },
  error: { icon: LucideIcons.XCircle, color: "#EF4444" },
};

export default function AuditScreen() {
  const renderLogItem = ({ item }: { item: AuditLog }) => {
    const config = TYPE_CONFIG[item.type];
    const IconComponent = config.icon;

    return (
      <View style={styles.logItem}>
        <View style={[styles.logIcon, { backgroundColor: config.color + "15" }]}>
          <IconComponent size={18} color={config.color} strokeWidth={2.5} />
        </View>
        <View style={styles.logContent}>
          <Text style={styles.logAction}>{item.action}</Text>
          <Text style={styles.logUser}>{item.user}</Text>
        </View>
        <Text style={styles.logTime}>{item.time}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <AuditHeader />
      <FlatList
        data={MOCK_AUDIT_LOGS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.countText}>{MOCK_AUDIT_LOGS.length} registros de actividad</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay registros de auditoría</Text>
          </View>
        }
        renderItem={renderLogItem}
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
  logItem: {
    backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, marginBottom: 8,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    borderWidth: 1, borderColor: "#F8FAFC",
  },
  logIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  logContent: { flex: 1 },
  logAction: { fontSize: 14, fontWeight: "600", color: "#0F172A", marginBottom: 2 },
  logUser: { fontSize: 12, color: "#64748B", fontWeight: "500" },
  logTime: { fontSize: 11, color: "#94A3B8", fontWeight: "500" },
});
