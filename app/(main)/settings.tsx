import { StatusBar } from "expo-status-bar";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as LucideIcons from "lucide-react-native";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { SettingsHeader } from "../../components/settings/SettingsHeader";

const SETTINGS_ITEMS = [
  { id: "profile", title: "Editar Perfil", icon: LucideIcons.User, color: "#4CB1B1", route: "/profile" },
  { id: "notifications", title: "Notificaciones", icon: LucideIcons.Bell, color: "#8B5CF6", route: null },
  { id: "security", title: "Seguridad", icon: LucideIcons.Shield, color: "#3B82F6", route: null },
  { id: "appearance", title: "Apariencia", icon: LucideIcons.Palette, color: "#F59E0B", route: null },
  { id: "language", title: "Idioma", icon: LucideIcons.Languages, color: "#22C55E", route: null },
  { id: "help", title: "Ayuda y Soporte", icon: LucideIcons.HelpCircle, color: "#64748B", route: null },
  { id: "about", title: "Acerca de", icon: LucideIcons.Info, color: "#64748B", route: null },
];

export default function SettingsScreen() {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('¿Seguro que quieres cerrar sesión?', '', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const renderItem = ({ item }: { item: typeof SETTINGS_ITEMS[0] }) => (
    <TouchableOpacity style={styles.itemCard}>
      <View style={[styles.iconContainer, { backgroundColor: item.color + "15" }]}>
        <item.icon size={20} color={item.color} strokeWidth={2.5} />
      </View>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <LucideIcons.ChevronRight size={18} color="#CBD5E1" strokeWidth={2} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <SettingsHeader />
      <FlatList
        data={SETTINGS_ITEMS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LucideIcons.LogOut size={18} color="#EF4444" strokeWidth={2.5} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  list: { padding: 16 },
  itemCard: {
    backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, marginBottom: 10,
    flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    borderWidth: 1, borderColor: "#F8FAFC",
  },
  iconContainer: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  itemTitle: { flex: 1, fontSize: 15, fontWeight: "600", color: "#0F172A" },
  logoutButton: {
    backgroundColor: "#FEF2F2", borderRadius: 14, padding: 16, marginTop: 10,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  logoutText: { fontSize: 15, fontWeight: "600", color: "#EF4444" },
});