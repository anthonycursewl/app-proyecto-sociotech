import { BarChart3, Briefcase, Calendar, Check, CircleDot, Eye, FileText, Heart, Key, Lock, Pencil, Shield, Stethoscope, Tag as TagIcon, Trash2, Users } from "lucide-react-native";
import { Skeleton } from "@/components/common/Skeleton";
import { Text } from "@/components/common/SText";
import { Tag } from "@/components/common/Tag";
import { Permission, RoleDetail, roleService } from "@/shared/services/role.service";
import { useAvailablePermissions } from "@/shared/hooks/useAvailablePermissions";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface RoleDetailModalProps {
  visible: boolean;
  roleId: string | null;
  onClose: () => void;
  onUpdate: (updated: RoleDetail) => void;
  onDelete: (role: RoleDetail) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;
const DRAG_THRESHOLD = 60;

const RESOURCE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  users: { label: "Usuarios", icon: Users, color: "#6B6B6B", bg: "rgb(240 240 240)" },
  roles: { label: "Roles", icon: Shield, color: "#6B6B6B", bg: "rgb(240 240 240)" },
  patients: { label: "Pacientes", icon: Heart, color: "#6B6B6B", bg: "rgb(240 240 240)" },
  services: { label: "Servicios", icon: Briefcase, color: "#6B6B6B", bg: "rgb(240 240 240)" },
  "medical-records": { label: "Historias Clínicas", icon: FileText, color: '#6B6B6B', bg: "rgb(240 240 240)" },
  appointments: { label: "Citas", icon: Calendar, color: "#6B6B6B", bg: "rgb(240 240 240)" },
  doctors: { label: "Doctores", icon: Stethoscope, color: "#6B6B6B", bg: "rgb(240 240 240)" },
  reports: { label: "Reportes", icon: BarChart3, color: "#6B6B6B", bg: "rgb(240 240 240)F" },
  audit: { label: "Auditoría", icon: Eye, color: "#6B6B6B", bg: "rgb(240 240 240)" },
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

const formatRoleName = (name: string | undefined) =>
  (name ?? "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const groupPermissionsByResource = (permissions: Permission[]) => {
  const groups: Record<string, Permission[]> = {};
  permissions.forEach((p) => {
    if (!groups[p.resource]) groups[p.resource] = [];
    groups[p.resource].push(p);
  });
  return groups;
};

export const RoleDetailModal = ({
  visible,
  roleId,
  onClose,
  onUpdate,
  onDelete,
  canEdit,
  canDelete,
}: RoleDetailModalProps) => {
  const [role, setRole] = useState<RoleDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [selectedPermIds, setSelectedPermIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { permissions: allPermissions, loading: loadingPerms, fetchPermissions } = useAvailablePermissions();

  const slideY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetScale = useRef(new Animated.Value(0.95)).current;

  const hasChanges = useMemo(
    () => {
      if (!editing || !role) return false;
      if (editDescription !== (role.description ?? "")) return true;
      const currentIds = new Set(role.permissions.map((p) => p.id));
      if (selectedPermIds.size !== currentIds.size) return true;
      for (const id of selectedPermIds) {
        if (!currentIds.has(id)) return true;
      }
      return false;
    },
    [editing, editDescription, role, selectedPermIds],
  );

  const fetchRole = useCallback(async () => {
    if (!roleId) return;
    setLoading(true);
    try {
      const data = await roleService.getById(roleId);
      setRole(data);
      setEditDescription(data.description ?? "");
      setSelectedPermIds(new Set(data.permissions.map((p) => p.id)));
    } catch (err: any) {
      const message = err?.data?.message || err?.message || "No se pudo cargar el rol";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  const openAnimation = useCallback(() => {
    setIsVisible(true);
    setAnimating(true);
    fetchRole();
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(slideY, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.spring(sheetScale, {
        toValue: 1,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
    ]).start(() => setAnimating(false));
  }, [fetchRole, overlayOpacity, slideY, sheetScale]);

  const closeAnimation = useCallback(() => {
    setAnimating(true);
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetScale, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      setAnimating(false);
      setRole(null);
      setEditing(false);
      onClose();
    });
  }, [onClose, overlayOpacity, slideY, sheetScale]);

  useEffect(() => {
    if (visible && !isVisible) {
      openAnimation();
    } else if (!visible && isVisible) {
      closeAnimation();
    }
  }, [visible, isVisible, openAnimation, closeAnimation]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !editing,
      onMoveShouldSetPanResponder: (_, gs) => !editing && gs.dy > 5 && gs.vy > 0.3,
      onPanResponderMove: (_, gs) => {
        if (!editing && gs.dy > 0) {
          slideY.setValue(gs.dy);
          overlayOpacity.setValue(Math.max(0, 1 - gs.dy / (SCREEN_HEIGHT * 0.4)));
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (!editing) {
          if (gs.dy > DRAG_THRESHOLD || gs.vy > 1.5) {
            closeAnimation();
          } else {
            Animated.spring(slideY, {
              toValue: 0,
              tension: 65,
              friction: 11,
              useNativeDriver: true,
            }).start();
            Animated.timing(overlayOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }
        }
      },
    }),
  ).current;

  const handleSave = async () => {
    if (!role || saving) return;
    setSaving(true);
    try {
      const permIds = Array.from(selectedPermIds);
      const updated = await roleService.replacePermissions(role.id, { permissionIds: permIds });
      if (editDescription !== (role.description ?? "")) {
        await roleService.update(role.id, { description: editDescription });
      }
      const finalRole = { ...updated, description: editDescription };
      onUpdate(finalRole);
      setEditing(false);
      onClose();
      Alert.alert("Rol actualizado", "El rol se actualizó correctamente");
    } catch (err: any) {
      const message = err?.data?.message || err?.message || "No se pudo actualizar el rol";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!role) return;
    setEditDescription(role.description ?? "");
    setSelectedPermIds(new Set(role.permissions.map((p) => p.id)));
    setEditing(false);
  };

  const handleDelete = () => {
    if (!role || role.isSystem || !canDelete) return;
    Alert.alert(
      "Eliminar rol",
      `¿Estás seguro de que quieres mover el rol "${formatRoleName(role.name)}" a la papelera?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await roleService.delete(role.id);
              onDelete(role);
              closeAnimation();
            } catch (err: any) {
              const message = err?.data?.message || err?.message || "No se pudo eliminar el rol";
              Alert.alert("Error", message);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const togglePermission = (permId: string) => {
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  const toggleResourceAll = (resource: string, perms: Permission[]) => {
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      const allSelected = perms.every((p) => next.has(p.id));
      if (allSelected) {
        perms.forEach((p) => next.delete(p.id));
      } else {
        perms.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  const permissionGroups = useMemo(
    () => (role && role.permissions ? groupPermissionsByResource(role.permissions) : {}),
    [role],
  );

  const allPermGroups = useMemo(
    () => (allPermissions.length > 0 ? groupPermissionsByResource(allPermissions) : {}),
    [allPermissions],
  );

  if (!isVisible && !animating) return null;

  return (
    <Modal
      visible={isVisible || animating}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeAnimation}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeAnimation} />
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [
                { translateY: slideY },
                { scale: sheetScale },
              ],
            },
          ]}
        >
          <View style={styles.dragArea} {...(editing ? {} : panResponder.panHandlers)}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>
              {editing ? "Editando rol" : "Detalle del rol"}
            </Text>
            <View style={styles.headerActions}>
              {role && !role.isSystem ? (
                editing ? (
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.cancelEditBtn}
                      onPress={handleCancelEdit}
                      disabled={saving}
                    >
                      <Text style={styles.cancelEditText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveBtn, !hasChanges && styles.saveBtnDisabled]}
                      onPress={handleSave}
                      disabled={saving || !hasChanges}
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.saveText}>Guardar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    {canEdit && (
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => {
                          setEditDescription(role.description ?? "");
                          setSelectedPermIds(new Set(role.permissions.map((p) => p.id)));
                          fetchPermissions();
                          setEditing(true);
                        }}
                      >
                        <Pencil size={16} color="#4F46E5" strokeWidth={2} />
                      </TouchableOpacity>
                    )}
                    {canDelete && (
                      <TouchableOpacity
                        style={styles.deleteHeaderBtn}
                        onPress={handleDelete}
                        disabled={deleting}
                      >
                        {deleting ? (
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                        )}
                      </TouchableOpacity>
                    )}
                  </>
                )
              ) : null}
              <TouchableOpacity onPress={closeAnimation} disabled={animating}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <View style={styles.skeletonContainer}>
              <View style={styles.skeletonRow}>
                <Skeleton width={48} height={48} borderRadius={24} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Skeleton width="55%" height={18} borderRadius={6} />
                  <Skeleton width={60} height={20} borderRadius={8} />
                </View>
              </View>

              <Skeleton width="85%" height={14} borderRadius={6} style={{ marginTop: 16 }} />
              <Skeleton width="60%" height={14} borderRadius={6} style={{ marginTop: 6 }} />

              <View style={styles.skeletonMetaGrid}>
                <View style={styles.skeletonMetaItem}>
                  <Skeleton width={50} height={11} borderRadius={4} />
                  <Skeleton width="90%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
                </View>
                <View style={styles.skeletonMetaDivider} />
                <View style={styles.skeletonMetaItem}>
                  <Skeleton width={65} height={11} borderRadius={4} />
                  <Skeleton width="85%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
                </View>
              </View>

              <View style={styles.skeletonPermsSection}>
                <View style={styles.skeletonPermsHeader}>
                  <Skeleton width={18} height={18} borderRadius={4} />
                  <Skeleton width={120} height={15} borderRadius={6} />
                </View>

                <View style={styles.skeletonResourceGroup}>
                  <View style={styles.skeletonResourceHeader}>
                    <Skeleton width={28} height={28} borderRadius={8} />
                    <Skeleton width={80} height={13} borderRadius={6} />
                    <Skeleton width={24} height={18} borderRadius={10} />
                  </View>
                  <View style={styles.skeletonPerms}>
                    <Skeleton width="100%" height={42} borderRadius={10} />
                    <Skeleton width="100%" height={42} borderRadius={10} />
                    <Skeleton width="100%" height={42} borderRadius={10} />
                  </View>
                </View>

                <View style={styles.skeletonResourceGroup}>
                  <View style={styles.skeletonResourceHeader}>
                    <Skeleton width={28} height={28} borderRadius={8} />
                    <Skeleton width={70} height={13} borderRadius={6} />
                    <Skeleton width={24} height={18} borderRadius={10} />
                  </View>
                  <View style={styles.skeletonPerms}>
                    <Skeleton width="100%" height={42} borderRadius={10} />
                    <Skeleton width="100%" height={42} borderRadius={10} />
                  </View>
                </View>

                <View style={styles.skeletonResourceGroup}>
                  <View style={styles.skeletonResourceHeader}>
                    <Skeleton width={28} height={28} borderRadius={8} />
                    <Skeleton width={90} height={13} borderRadius={6} />
                    <Skeleton width={24} height={18} borderRadius={10} />
                  </View>
                  <View style={styles.skeletonPerms}>
                    <Skeleton width="100%" height={42} borderRadius={10} />
                    <Skeleton width="100%" height={42} borderRadius={10} />
                    <Skeleton width="100%" height={42} borderRadius={10} />
                    <Skeleton width="100%" height={42} borderRadius={10} />
                  </View>
                </View>
              </View>
            </View>
          ) : role ? (
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 32 }}
            >
              <View style={styles.infoSection}>
                <View style={styles.nameRow}>
                  <View style={styles.avatar}>
                    <Shield size={24} color="#4F46E5" strokeWidth={2} />
                  </View>
                  <View style={styles.nameInfo}>
                    <Text style={styles.roleName}>{formatRoleName(role.name)}</Text>
                    <Tag
                      label={role.isSystem ? "Sistema" : "Personalizado"}
                      variant={role.isSystem ? "default" : "primary"}
                    />
                  </View>
                </View>

                {editing ? (
                  <View style={styles.editField}>
                    <Text style={styles.editLabel}>Descripción</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editDescription}
                      onChangeText={setEditDescription}
                      placeholder="Descripción del rol..."
                      placeholderTextColor="#94A3B8"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                    <Text style={styles.editHelper}>Texto que verán los administradores para entender las responsabilidades de este rol. Opcional pero recomendado.</Text>
                  </View>
                ) : role.description ? (
                  <Text style={styles.description}>{role.description}</Text>
                ) : null}

                <View style={styles.metaGrid}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Creado</Text>
                    <Text style={styles.metaValue}>{formatDate(role.createdAt)}</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Actualizado</Text>
                    <Text style={styles.metaValue}>{formatDate(role.updatedAt)}</Text>
                  </View>
                </View>

                {hasChanges && (
                  <View style={styles.changesIndicator}>
                    <CircleDot size={10} color="#F59E0B" strokeWidth={2} />
                    <Text style={styles.changesText}>Cambios sin guardar</Text>
                  </View>
                )}
              </View>

              <View style={styles.permissionsSection}>
                <View style={styles.permissionsHeader}>
                  <Key size={18} color="#64748B" strokeWidth={2} />
                  <Text style={styles.permissionsTitle}>
                    {editing ? "Gestionar permisos" : `Permisos (${role.permissions.length})`}
                  </Text>
                </View>
                {editing && (
                  <Text style={styles.permissionsHelper}>Activa o desactiva los permisos que tendrá este rol. Toca el encabezado de cada recurso para seleccionar/deseleccionar todos a la vez.</Text>
                )}

                {editing ? (
                  loadingPerms ? (
                    <View style={styles.skeletonPerms}>
                      <Skeleton key="sk1" width="100%" height={42} borderRadius={10} />
                      <Skeleton key="sk2" width="100%" height={42} borderRadius={10} />
                      <Skeleton key="sk3" width="100%" height={42} borderRadius={10} />
                    </View>
                  ) : (
                    Object.entries(allPermGroups).map(([resource, perms]) => {
                      const config = RESOURCE_CONFIG[resource] || {
                        label: resource,
                        icon: TagIcon,
                        color: "#64748B",
                        bg: "#F8FAFC",
                      };
                      const Icon = config.icon;
                      const selectedCount = perms.filter((p) => selectedPermIds.has(p.id)).length;
                      const allSelected = selectedCount === perms.length;

                      return (
                      <View key={`view-res-${resource}`} style={styles.resourceGroup}>
                          <TouchableOpacity
                            style={styles.resourceHeader}
                            onPress={() => toggleResourceAll(resource, perms)}
                            activeOpacity={0.7}
                          >
                            <View style={[styles.resourceIcon, { backgroundColor: config.bg }]}>
                              <Icon size={16} color={config.color} strokeWidth={2} />
                            </View>
                            <Text style={styles.resourceLabel}>{config.label}</Text>
                            <View style={styles.resourceCount}>
                              <Text style={styles.resourceCountText}>
                                {selectedCount}/{perms.length}
                              </Text>
                            </View>
                            <View style={[styles.checkbox, allSelected && styles.checkboxChecked]}>
                              {allSelected && (
                                <Check size={12} color="#FFFFFF" strokeWidth={3} />
                              )}
                            </View>
                          </TouchableOpacity>

                          <View style={styles.permissionGrid}>
                            {perms.map((perm) => {
                              const isSelected = selectedPermIds.has(perm.id);
                              const actionConfig = ACTION_CONFIG[perm.action] || {
                                label: perm.action,
                                color: "#64748B",
                                bg: "#F1F5F9",
                              };

                              return (
                                <TouchableOpacity
                                  key={`edit-perm-${perm.id}`}
                                  style={[
                                    styles.permissionCard,
                                    isSelected && styles.permissionCardSelected,
                                  ]}
                                  onPress={() => togglePermission(perm.id)}
                                  activeOpacity={0.7}
                                >
                                  <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                                    {isSelected && (
                                      <Check size={12} color="#FFFFFF" strokeWidth={3} />
                                    )}
                                  </View>
                                  <View style={styles.permissionInfo}>
                                    <Text
                                      style={[
                                        styles.permissionDesc,
                                        isSelected && styles.permissionDescSelected,
                                      ]}
                                      numberOfLines={1}
                                    >
                                      {perm.description}
                                    </Text>
                                    <View
                                      style={[
                                        styles.actionBadge,
                                        { backgroundColor: actionConfig.bg },
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.actionBadgeText,
                                          { color: actionConfig.color },
                                        ]}
                                      >
                                        {actionConfig.label}
                                      </Text>
                                    </View>
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      );
                    })
                  )
                ) : role.permissions.length === 0 ? (
                  <View style={styles.emptyPermissions}>
                    <Lock size={32} color="#CBD5E1" strokeWidth={1.5} />
                    <Text style={styles.emptyPermissionsText}>Sin permisos asignados</Text>
                  </View>
                ) : (
                  Object.entries(permissionGroups).map(([resource, perms]) => {
                    const config = RESOURCE_CONFIG[resource] || {
                      label: resource,
                      icon: Tag,
                      color: "#64748B",
                      bg: "#F8FAFC",
                    };
                    const Icon = config.icon;

                    return (
                        <View key={`edit-res-${resource}`} style={styles.resourceGroup}>
                        <View style={styles.resourceHeader}>
                          <View style={[styles.resourceIcon, { backgroundColor: config.bg }]}>
                            <Icon size={16} color={config.color} strokeWidth={2} />
                          </View>
                          <Text style={styles.resourceLabel}>{config.label}</Text>
                          <View style={styles.resourceCount}>
                            <Text style={styles.resourceCountText}>{perms.length}</Text>
                          </View>
                        </View>

                        <View style={styles.permissionGrid}>
                          {perms.map((perm) => {
                            const actionConfig = ACTION_CONFIG[perm.action] || {
                              label: perm.action,
                              color: "#64748B",
                              bg: "#F1F5F9",
                            };

                            return (
                              <View key={`view-perm-${perm.id}`} style={styles.permissionCard}>
                                <View style={styles.permissionInfo}>
                                  <Text style={styles.permissionDesc} numberOfLines={1}>
                                    {perm.description}
                                  </Text>
                                  <View
                                    style={[
                                      styles.actionBadge,
                                      { backgroundColor: actionConfig.bg },
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        styles.actionBadgeText,
                                        { color: actionConfig.color },
                                      ]}
                                    >
                                      {actionConfig.label}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </ScrollView>
          ) : null}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SHEET_HEIGHT,
  },
  dragArea: {
    paddingVertical: 8,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  editActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cancelEditBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  cancelEditText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
  },
  saveBtnDisabled: {
    backgroundColor: "#C7D2FE",
  },
  saveText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  closeButton: {
    fontSize: 20,
    color: "#64748B",
    fontWeight: "600",
  },
  skeletonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  skeletonMetaGrid: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 16,
  },
  skeletonMetaItem: {
    flex: 1,
  },
  skeletonMetaDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 16,
    height: 28,
  },
  skeletonPermsSection: {
    marginTop: 24,
  },
  skeletonPermsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  skeletonResourceGroup: {
    marginBottom: 16,
  },
  skeletonResourceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  skeletonPerms: {
    gap: 6,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  nameInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
    lineHeight: 20,
  },
  editField: {
    marginBottom: 16,
  },
  editLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4F46E5",
    marginBottom: 6,
  },
  editHelper: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 6,
    lineHeight: 15,
  },
  editInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 60,
  },
  changesIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changesText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#F59E0B",
  },
  metaGrid: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  metaDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 16,
    height: 32,
  },
  permissionsSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  permissionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  permissionsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  permissionsHelper: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 12,
    lineHeight: 15,
  },
  emptyPermissions: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyPermissionsText: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 8,
  },
  resourceGroup: {
    marginBottom: 16,
  },
  resourceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  resourceIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  resourceLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    flex: 1,
  },
  resourceCount: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  resourceCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  permissionGrid: {
    gap: 6,
  },
  permissionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  permissionCardSelected: {
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  permissionInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  permissionDesc: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  permissionDescSelected: {
    color: "#4F46E5",
    fontWeight: "600",
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
});
