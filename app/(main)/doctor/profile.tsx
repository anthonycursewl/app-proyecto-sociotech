import { CalendarClock, ChevronRight, ClipboardList, Settings, UserPen, Users } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import React, { useCallback } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Text } from "@/components/common/SText"
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { DoctorProfileHeader } from "../../../components/doctors/DoctorProfileHeader";

const QUICK_ACTIONS = [
  { id: "schedule", title: "Mi Agenda", icon: CalendarClock, color: "#4CB1B1", route: "/admin/appointments" },
  { id: "patients", title: "Mis Pacientes", icon: Users, color: "#8B5CF6", route: "/patients" },
  { id: "records", title: "Historias Clínicas", icon: ClipboardList, color: "#F59E0B", route: "/admin/records" },
  { id: "editProfile", title: "Editar Perfil", icon: UserPen, color: "#3B82F6", route: "/doctor/edit-profile" },
  { id: "settings", title: "Configuración", icon: Settings, color: "#64748B", route: "/settings" },
];

export default function DoctorProfileScreen() {
  const router = useRouter();
  const renderAction = useCallback(
    ({ item }: { item: typeof QUICK_ACTIONS[0] }) => (
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => router.navigate({ pathname: item.route as any })}
      >
        <View style={[styles.actionIcon, { backgroundColor: item.color + "15" }]}>
          <item.icon size={22} color={item.color} strokeWidth={2.5} />
        </View>
        <Text style={styles.actionText}>{item.title}</Text>
        <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
      </TouchableOpacity>
    ),
    [router],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <DoctorProfileHeader />
      <FlashList
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