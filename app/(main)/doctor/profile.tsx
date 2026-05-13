import { StatusBar } from "expo-status-bar";
import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { SafeAreaView } from "react-native-safe-area-context";
import * as LucideIcons from "lucide-react-native";
import { DoctorProfileHeader } from "../../../components/doctors/DoctorProfileHeader";

const QUICK_ACTIONS = [
  { id: "schedule", title: "Mi Agenda", icon: LucideIcons.CalendarClock, color: "#4CB1B1", route: "/admin/appointments" },
  { id: "patients", title: "Mis Pacientes", icon: LucideIcons.Users, color: "#8B5CF6", route: "/patients" },
  { id: "records", title: "Historias Clínicas", icon: LucideIcons.ClipboardList, color: "#F59E0B", route: "/admin/records" },
  { id: "editProfile", title: "Editar Perfil", icon: LucideIcons.UserPen, color: "#3B82F6", route: "/doctor/edit-profile" },
  { id: "settings", title: "Configuración", icon: LucideIcons.Settings, color: "#64748B", route: "/settings" },
];

export default function DoctorProfileScreen() {
  const renderAction = ({ item }: { item: typeof QUICK_ACTIONS[0] }) => (
    <TouchableOpacity style={styles.actionCard}>
      <View style={[styles.actionIcon, { backgroundColor: item.color + "15" }]}>
        <item.icon size={22} color={item.color} strokeWidth={2.5} />
      </View>
      <Text style={styles.actionText}>{item.title}</Text>
      <LucideIcons.ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
      <StatusBar style="light" />
      <DoctorProfileHeader />
      <FlatList
        data={QUICK_ACTIONS}
        renderItem={renderAction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 12,
  },
  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F8FAFC",
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
});