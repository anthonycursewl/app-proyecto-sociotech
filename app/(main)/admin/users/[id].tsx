import { CustomButton } from "@/components/common/CustomButton";
import { ListErrorState } from "@/components/common/ListErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { Text } from "@/components/common/SText";
import { AdminUserDetail, userService } from "@/shared/services/user.service";
import { colors } from "@/shared/theme/colors";
import { useUserCacheStore } from "@/shared/zustand/userCache/useUserCacheStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, Shield, Tag, UserCircle } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const InfoRow = React.memo(({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
));

function UserDetailSkeleton() {
  return (
    <View style={styles.skeletonBody}>
      <View style={styles.skeletonProfileCard}>
        <Skeleton width={72} height={72} borderRadius={36} />
        <Skeleton width="45%" height={18} borderRadius={8} style={{ marginTop: 12 }} />
        <Skeleton width="55%" height={13} borderRadius={6} style={{ marginTop: 6 }} />
        <Skeleton width={80} height={22} borderRadius={10} style={{ marginTop: 10 }} />
      </View>
      <View style={styles.skeletonSection}>
        <Skeleton width="40%" height={15} borderRadius={7} />
        <View style={{ marginTop: 14, gap: 10 }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Skeleton width="30%" height={14} borderRadius={6} />
              <Skeleton width="50%" height={14} borderRadius={6} />
            </View>
          ))}
        </View>
      </View>
      <View style={styles.skeletonSection}>
        <Skeleton width="35%" height={15} borderRadius={7} />
        <View style={{ marginTop: 14, gap: 10 }}>
          {[0, 1].map((i) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Skeleton width="40%" height={14} borderRadius={6} />
              <Skeleton width="35%" height={14} borderRadius={6} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const formatRoleLabel = (roleName: string) =>
  roleName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const RESOURCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  users: { label: "Usuarios", color: "#6B6B6B", bg: "rgb(240 240 240)" },
  roles: { label: "Roles", color: "#6B6B6B", bg: "rgb(240 240 240)" },
  patients: { label: "Pacientes", color: "#6B6B6B", bg: "rgb(240 240 240)" },
  services: { label: "Servicios", color: "#6B6B6B", bg: "rgb(240 240 240)" },
  "medical-records": { label: "Historias Clínicas", color: "#6B6B6B", bg: "rgb(240 240 240)" },
  appointments: { label: "Citas", color: "#6B6B6B", bg: "rgb(240 240 240)" },
  doctors: { label: "Doctores", color: "#6B6B6B", bg: "rgb(240 240 240)" },
  reports: { label: "Reportes", color: "#6B6B6B", bg: "rgb(240 240 240)" },
  audit: { label: "Auditoría", color: "#6B6B6B", bg: "rgb(240 240 240)" },
};

const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  read: { label: "Ver", color: "#2563EB", bg: "#EFF6FF" },
  create: { label: "Crear", color: "#059669", bg: "#ECFDF5" },
  update: { label: "Actualizar", color: "#D97706", bg: "#FDFEA3" },
  delete: { label: "Eliminar", color: "#DC2626", bg: "#FEF2F2" },
  manage: { label: "Gestionar", color: "#7C3AED", bg: "#F5F3FF" },
  "assign-role": { label: "Asignar rol", color: "#6366F1", bg: "#EEF2FF" },
  register: { label: "Registrar", color: "#0891B2", bg: "#ECFEFF" },
  sign: { label: "Firmar", color: "#BE185D", bg: "#FDF2F8" },
  cancel: { label: "Cancelar", color: "#B91C1C", bg: "#FEF2F2" },
  generate: { label: "Generar", color: "#4F46E5", bg: "#EEF2FF" },
  export: { label: "Exportar", color: "#0D9488", bg: "#F0FDFA" },
  "read:own": { label: "Ver propio", color: "#2563EB", bg: "#EFF6FF" },
  "create:own": { label: "Crear propio", color: "#059669", bg: "#ECFDF5" },
  "update:own": { label: "Actualizar propio", color: "#D97706", bg: "#FEF3C7" },
  "cancel:own": { label: "Cancelar propio", color: "#B91C1C", bg: "#FEF2F2" },
};

const parsePermission = (perm: string) => {
  const colonIndex = perm.indexOf(":");
  if (colonIndex === -1) return { resource: perm, action: perm };
  const resource = perm.substring(0, colonIndex);
  const action = perm.substring(colonIndex + 1);
  return { resource, action };
};

const groupPermissions = (permissions: string[]) => {
  const groups: Record<string, { resource: string; action: string; raw: string }[]> = {};
  permissions.forEach((perm) => {
    const parsed = parsePermission(perm);
    if (!groups[parsed.resource]) groups[parsed.resource] = [];
    groups[parsed.resource].push({ ...parsed, raw: perm });
  });
  return groups;
};

export default function UserDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const setUserCache = useUserCacheStore((s) => s.setUser);

  const [user, setUser] = useState<AdminUserDetail | null>(() => {
    if (!id) return null;
    const entry = useUserCacheStore.getState().cache[id];
    return entry?.data ?? null;
  });
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState<string | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const fetchIdRef = useRef(0);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    const fetchId = ++fetchIdRef.current;

    const cached = useUserCacheStore.getState().cache[id]?.data;
    if (cached) {
      setUser(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await userService.getProfile(id);
      if (fetchId !== fetchIdRef.current) return;
      setUserCache(id, res.user);
      setUser(res.user);
    } catch (err: any) {
      if (fetchId !== fetchIdRef.current) return;
      setError(err?.data?.message || err?.message || "Error al cargar el usuario");
    } finally {
      if (fetchId === fetchIdRef.current) setLoading(false);
    }
  }, [id, setUserCache]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={20} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Usuario</Text>
          <View style={styles.headerSpacer} />
        </View>
        <UserDetailSkeleton />
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={20} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Usuario</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ListErrorState message={error || "Usuario no encontrado"} onRetry={fetchUser} />
      </SafeAreaView>
    );
  }

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={20} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Usuario</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
      >
        <View style={styles.profileCard}>
          <View style={[styles.avatarLarge, !user.isActive && styles.avatarInactive]}>
            <Text style={[styles.avatarLargeText, !user.isActive && styles.avatarInactiveText]}>
              {initials}
            </Text>
          </View>
          <Text style={styles.profileName}>{fullName}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={[styles.statusBadge, user.isActive ? styles.activeStatus : styles.inactiveStatus]}>
            <Text style={[styles.statusText, user.isActive ? styles.activeText : styles.inactiveText]}>
              {user.isActive ? "Activo" : "Inactivo"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <UserCircle size={17} color="#0D9488" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Información General</Text>
          </View>
          <InfoRow label="Nombre Completo" value={fullName} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Estado" value={user.isActive ? "Activo" : "Inactivo"} />
          <InfoRow label="Creado" value={formatDate(user.createdAt)} />
          <InfoRow label="Actualizado" value={formatDate(user.updatedAt)} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={17} color="#0D9488" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Roles y Permisos</Text>
          </View>
          <InfoRow label="Rol" value={formatRoleLabel(user.roleName)} />
          <View style={styles.permissionsContainer}>
            <Text style={styles.permissionsLabel}>Permisos</Text>
            {user.permissions.length > 0 && (
              <CustomButton
                title={showPermissions ? "Ocultar permisos" : "Mostrar permisos"}
                variant="primary"
                onPress={() => setShowPermissions((s) => !s)}
                style={styles.showPermissionsButton}
              />
            )}

            {!showPermissions
              ? user.permissions.length > 0
                ? <Text style={styles.permissionsSummary}>Permisos ocultos. Pulsa "Mostrar permisos" para verlos.</Text>
                : <Text style={styles.permissionsEmpty}>Sin permisos asignados</Text>
              : Object.entries(groupPermissions(user.permissions)).map(([resource, perms]) => {
                  const resConfig = RESOURCE_CONFIG[resource] || { label: resource, color: "#64748B", bg: "#F8FAFC" };
                  return (
                    <View key={resource} style={styles.resourceGroup}>
                      <View style={styles.resourceHeader}>
                        <View style={[styles.resourceIcon, { backgroundColor: resConfig.bg }]}>
                          <Tag size={14} color={resConfig.color} strokeWidth={2} />
                        </View>
                        <Text style={styles.resourceLabel}>{resConfig.label}</Text>
                        <View style={styles.resourceCount}>
                          <Text style={styles.resourceCountText}>{perms.length}</Text>
                        </View>
                      </View>
                      <View style={styles.permissionGrid}>
                        {perms.map((p) => {
                          const actionConfig = ACTION_CONFIG[p.action] || { label: p.action, color: "#64748B", bg: "#F1F5F9" };
                          return (
                            <View key={p.raw} style={styles.permissionCard}>
                              <View style={styles.permissionInfo}>
                                <Text style={styles.permissionDesc} numberOfLines={1}>{p.action}</Text>
                                <View style={[styles.actionBadge, { backgroundColor: actionConfig.bg }]}>
                                  <Text style={[styles.actionBadgeText, { color: actionConfig.color }]}>{actionConfig.label}</Text>
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                  })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  headerSpacer: { width: 38 },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 4, paddingBottom: 24 },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF2F6",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarInactive: {
    backgroundColor: "#F1F5F9",
  },
  avatarLargeText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#6366F1",
  },
  avatarInactiveText: {
    color: "#94A3B8",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
  },
  activeStatus: { backgroundColor: "#DCFCE7" },
  inactiveStatus: { backgroundColor: "#F1F5F9" },
  statusText: { fontSize: 12, fontWeight: "700" },
  activeText: { color: "#22C55E" },
  inactiveText: { color: "#94A3B8" },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEF2F6",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#FAFAFA",
    gap: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },

  permissionsContainer: { paddingTop: 10 },
  permissionsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: 8,
  },
  showPermissionsButton: {
    alignSelf: "center",
    minWidth: 140,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.accent,
    elevation: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    marginBottom: 12,
  },
  permissionsSummary: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
    marginBottom: 8,
  },
  permissionsEmpty: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  resourceGroup: {
    marginBottom: 12,
  },
  resourceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  resourceIcon: {
    width: 24,
    height: 24,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  resourceLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    flex: 1,
  },
  resourceCount: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  resourceCountText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
  },
  permissionGrid: {
    gap: 5,
  },
  permissionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  permissionInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  permissionDesc: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  actionBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  actionBadgeText: {
    fontSize: 9,
    fontWeight: "700",
  },

  skeletonBody: { padding: 16, paddingTop: 4, gap: 14 },
  skeletonProfileCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  skeletonSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
});
