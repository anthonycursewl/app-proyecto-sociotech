import { Text } from "@/components/common/SText";
import { Skeleton } from "@/components/common/Skeleton";
import { useRolesList } from "@/shared/hooks/useRolesList";
import { AdminUserListItem } from "@/shared/services/user.service";
import { RoleListItem } from "@/shared/services/role.service";
import * as LucideIcons from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface RolePickerModalProps {
  visible: boolean;
  user: AdminUserListItem | null;
  onClose: () => void;
  onSelectRole: (roleId: string, roleName: string) => void;
  selecting?: boolean;
}

const formatRoleLabel = (name: string) =>
  name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const SHEET_HEIGHT = SCREEN_HEIGHT * 0.7;
const DRAG_THRESHOLD = 60;

export const RolePickerModal = ({
  visible,
  user,
  onClose,
  onSelectRole,
  selecting,
}: RolePickerModalProps) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const slideY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetScale = useRef(new Animated.Value(0.95)).current;

  const {
    roles,
    loading,
    loadingMore,
    hasNext,
    error,
    initialized,
    load,
    loadMore,
    refresh,
    reset,
  } = useRolesList();

  const openAnimation = useCallback(() => {
    setIsVisible(true);
    setAnimating(true);
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
  }, []);

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
      reset();
      onClose();
    });
  }, []);

  useEffect(() => {
    if (visible && !isVisible) {
      if (!initialized) load();
      openAnimation();
    } else if (!visible && isVisible) {
      closeAnimation();
    }
  }, [visible, isVisible, initialized, load, openAnimation, closeAnimation]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5 && gestureState.vy > 0.5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideY.setValue(gestureState.dy);
          overlayOpacity.setValue(Math.max(0, 1 - gestureState.dy / (SCREEN_HEIGHT * 0.4)));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DRAG_THRESHOLD || gestureState.vy > 1.5) {
          Animated.parallel([
            Animated.timing(overlayOpacity, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(slideY, {
              toValue: SCREEN_HEIGHT,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setIsVisible(false);
            setAnimating(false);
            reset();
            onClose();
          });
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
      },
    }),
  ).current;

  const handleSelectRole = (role: RoleListItem) => {
    if (role.id === user?.roleId || selecting) return;
    setSelectedRole(role.id);

    const currentRole = formatRoleLabel(user?.roleName ?? "");
    const newRole = formatRoleLabel(role.name);

    Alert.alert(
      "Confirmar cambio de rol",
      `¿Cambiar el rol de ${user?.firstName} ${user?.lastName} de "${currentRole}" a "${newRole}"?`,
      [
        { text: "Cancelar", style: "cancel", onPress: () => setSelectedRole(null) },
        {
          text: "Confirmar",
          style: "destructive",
          onPress: () => onSelectRole(role.id, role.name),
        },
      ],
    );
  };

  if (!user) return null;

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
          {...panResponder.panHandlers}
        >
          <View style={styles.dragArea} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Cambiar rol</Text>
            <Text style={styles.subtitle}>
              {user.firstName} {user.lastName} · rol actual: {formatRoleLabel(user.roleName)}
            </Text>
          </View>

          {!initialized || loading ? (
            <View style={styles.skeletonList}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.skeletonRoleRow}>
                  <Skeleton width={32} height={32} borderRadius={8} />
                  <View style={styles.skeletonRoleInfo}>
                    <Skeleton width={100} height={14} borderRadius={6} />
                    <Skeleton width={160} height={10} borderRadius={4} style={{ marginTop: 6 }} />
                  </View>
                </View>
              ))}
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={refresh}>
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              style={styles.list}
              showsVerticalScrollIndicator={false}
              onScroll={({ nativeEvent }) => {
                const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                const isCloseToBottom =
                  layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
                if (isCloseToBottom && hasNext && !loadingMore) {
                  loadMore();
                }
              }}
              scrollEventThrottle={400}
            >
              {roles.map((role) => {
                const isCurrent = role.id === user.roleId;
                const isSelected = role.id === selectedRole;
                const isHighlight = isCurrent || isSelected;

                return (
                  <TouchableOpacity
                    key={role.id}
                    style={[styles.roleOption, isHighlight && styles.roleOptionHighlight]}
                    onPress={() => handleSelectRole(role)}
                    disabled={isCurrent || selecting}
                    activeOpacity={0.85}
                  >
                    <View style={styles.roleIconContainer}>
                      <LucideIcons.Shield
                        size={18}
                        color={isHighlight ? "#0D9488" : "#94A3B8"}
                        strokeWidth={2}
                      />
                    </View>
                    <View style={styles.roleInfo}>
                      <Text style={[styles.roleName, isHighlight && styles.roleNameHighlight]}>
                        {formatRoleLabel(role.name)}
                      </Text>
                      {role.description ? (
                        <Text style={styles.roleDescription} numberOfLines={2}>
                          {role.description}
                        </Text>
                      ) : null}
                    </View>
                    {isCurrent ? (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Actual</Text>
                      </View>
                    ) : isSelected ? (
                      <LucideIcons.Check size={18} color="#0D9488" strokeWidth={2.5} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}

              {loadingMore && (
                <View style={styles.loadMoreContainer}>
                  <ActivityIndicator size="small" color="#94A3B8" />
                </View>
              )}

              {roles.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <LucideIcons.ShieldOff size={32} color="#CBD5E1" strokeWidth={1.5} />
                  <Text style={styles.emptyText}>No hay roles disponibles para asignar</Text>
                </View>
              ) : null}
            </ScrollView>
          )}

          {selecting && (
            <View style={styles.selectingRow}>
              <ActivityIndicator size="small" color="#0D9488" />
              <Text style={styles.selectingText}>Actualizando rol…</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={closeAnimation}
            disabled={selecting || animating}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingBottom: 28,
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
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: "800", color: "#0F172A", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#64748B" },
  skeletonList: { paddingVertical: 8 },
  skeletonRoleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  skeletonRoleInfo: { flex: 1 },
  errorContainer: { paddingVertical: 24, alignItems: "center" },
  errorText: { fontSize: 14, color: "#EF4444", textAlign: "center", marginBottom: 12 },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  retryText: { fontSize: 14, fontWeight: "600", color: "#64748B" },
  list: { maxHeight: 320 },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#F8FAFC",
  },
  roleOptionHighlight: {
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#99F6E4",
  },
  roleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  roleInfo: { flex: 1 },
  roleName: { fontSize: 15, fontWeight: "600", color: "#334155" },
  roleNameHighlight: { color: "#0D9488" },
  roleDescription: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#0D9488",
  },
  currentBadgeText: { fontSize: 11, fontWeight: "600", color: "#FFFFFF" },
  emptyContainer: { paddingVertical: 32, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#94A3B8", textAlign: "center", marginTop: 8 },
  loadMoreContainer: { paddingVertical: 12, alignItems: "center" },
  selectingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  selectingText: { fontSize: 13, color: "#0D9488", fontWeight: "500" },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  cancelText: { fontSize: 15, fontWeight: "600", color: "#64748B" },
});
