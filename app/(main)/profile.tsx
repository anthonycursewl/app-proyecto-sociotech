import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as LucideIcons from "lucide-react-native";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ROLE_LABELS: Record<string, string> = {
  PATIENT: "Paciente",
  DOCTOR: "Doctor",
  ASSISTANT: "Asistente",
  ADMIN: "Administrador",
  SUPER_ADMIN: "Super Admin",
};

const MENU_ITEMS = [
  { id: "edit", title: "Editar Perfil", icon: LucideIcons.UserPen, color: "#4CB1B1", route: "/patient/edit" },
  { id: "security", title: "Seguridad", icon: LucideIcons.Shield, color: "#3B82F6", route: null },
  { id: "notifications", title: "Notificaciones", icon: LucideIcons.Bell, color: "#8B5CF6", route: null },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('¿Cerrar sesión?', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  const initials = `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`;
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  const roleLabel = ROLE_LABELS[user.role] || user.role;
  const memberSince = new Date(user.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <LucideIcons.ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Perfil</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{fullName}</Text>
          <View style={styles.roleBadge}>
            <LucideIcons.User size={12} color="#4CB1B1" strokeWidth={2.5} />
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <LucideIcons.Mail size={16} color="#94A3B8" strokeWidth={2} />
              <Text style={styles.infoLabel}>Correo</Text>
            </View>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <LucideIcons.Calendar size={16} color="#94A3B8" strokeWidth={2} />
              <Text style={styles.infoLabel}>Miembro desde</Text>
            </View>
            <Text style={styles.infoValue}>{memberSince}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <LucideIcons.ShieldCheck size={16} color="#94A3B8" strokeWidth={2} />
              <Text style={styles.infoLabel}>Estado</Text>
            </View>
            <View style={[styles.statusBadge, user.isActive ? styles.activeStatus : styles.inactiveStatus]}>
              <Text style={[styles.statusText, user.isActive ? styles.activeText : styles.inactiveText]}>
                {user.isActive ? 'Activa' : 'Inactiva'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + "15" }]}>
                <item.icon size={18} color={item.color} strokeWidth={2.5} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <LucideIcons.ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LucideIcons.LogOut size={18} color="#EF4444" strokeWidth={2.5} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
    color: "#94A3B8",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  topBarSpacer: {
    width: 38,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4CB1B1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E0F2F1",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4CB1B1",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "right",
    maxWidth: "55%",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeStatus: {
    backgroundColor: "#DCFCE7",
  },
  inactiveStatus: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  activeText: {
    color: "#22C55E",
  },
  inactiveText: {
    color: "#EF4444",
  },
  menuSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 16,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
  },
});
