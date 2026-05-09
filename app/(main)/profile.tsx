import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../components/dashboard/Header/Header";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, permissions } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('¿Seguro que quieres cerrar sesión?', '', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
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

  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      PATIENT: 'Paciente',
      DOCTOR: 'Doctor',
      ASSISTANT: 'Asistente',
      ADMIN: 'Administrador',
      SUPER_ADMIN: 'Super Admin',
    };
    return labels[role] || role;
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <Header
        userName={`${user.firstName} ${user.lastName}`}
        onLogout={handleLogout}
        onNotifications={() => console.log("Notificaciones")}
        role={user.role}
      />
      <View style={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.firstName?.charAt(0) ?? ''}{user.lastName?.charAt(0) ?? ''}
            </Text>
          </View>
          <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{getRoleLabel(user.role)}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Correo electrónico</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado de cuenta</Text>
            <View style={[styles.statusBadge, user.isActive ? styles.activeStatus : styles.inactiveStatus]}>
              <Text style={[styles.statusText, user.isActive ? styles.activeText : styles.inactiveText]}>
                {user.isActive ? 'Activa' : 'Inactiva'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Miembro desde</Text>
            <Text style={styles.infoValue}>
              {new Date(user.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Permisos</Text>
            <View style={styles.permissionsContainer}>
              {permissions.slice(0, 3).map((perm, index) => (
                <View key={index} style={styles.permissionBadge}>
                  <Text style={styles.permissionText}>{perm}</Text>
                </View>
              ))}
              {permissions.length > 3 && (
                <View style={styles.permissionBadge}>
                  <Text style={styles.permissionText}>+{permissions.length - 3}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Editar perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
            <Text style={[styles.actionButtonText, styles.logoutText]}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4CB1B1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: "#E0F2F1",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CB1B1",
  },
  infoSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
  permissionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    maxWidth: 180,
    justifyContent: "flex-end",
  },
  permissionBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  permissionText: {
    fontSize: 10,
    color: "#64748B",
  },
  actionsSection: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#4CB1B1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  logoutButton: {
    backgroundColor: "#FEE2E2",
  },
  logoutText: {
    color: "#EF4444",
  },
});