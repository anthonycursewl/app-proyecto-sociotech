import { RotateCcw, ShieldOff, Trash2 } from "lucide-react-native";
import { Text } from "@/components/common/SText";
import { RoleListItem } from "@/shared/services/role.service";
import { colors } from "@/shared/theme/colors";
import { useRoleTrash } from "@/shared/hooks/useRoleTrash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface TrashModalProps {
  visible: boolean;
  onClose: () => void;
  onRestore: (role: RoleListItem) => void;
}

const SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;
const DRAG_THRESHOLD = 60;

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

const formatRoleName = (name: string) =>
  name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const TrashModal = ({ visible, onClose, onRestore }: TrashModalProps) => {
  const { trashItems, loading, refreshing, fetchTrash, refresh, restoreRole, deletePermanent } =
    useRoleTrash();
  const [animating, setAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const slideY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetScale = useRef(new Animated.Value(0.95)).current;

  const openAnimation = useCallback(() => {
    setIsVisible(true);
    setAnimating(true);
    fetchTrash();
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
  }, [fetchTrash, overlayOpacity, slideY, sheetScale]);

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
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 10 && Math.abs(gs.dx) < Math.abs(gs.dy) && gs.vy > 0.3,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) {
          slideY.setValue(gs.dy);
          overlayOpacity.setValue(Math.max(0, 1 - gs.dy / (SCREEN_HEIGHT * 0.4)));
        }
      },
      onPanResponderRelease: (_, gs) => {
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
      },
    }),
  ).current;

  const handleRestore = async (role: RoleListItem) => {
    try {
      await restoreRole(role.id);
      onRestore(role);
      Alert.alert("Rol restaurado", `El rol "${role.name}" ha sido restaurado`);
    } catch (err: any) {
      const message = err?.data?.message || err?.message || "No se pudo restaurar el rol";
      Alert.alert("Error", message);
    }
  };

  const handleDeletePermanent = async (role: RoleListItem) => {
    Alert.alert(
      "Eliminación permanente",
      `¿Estás seguro de que quieres eliminar permanentemente el rol "${role.name}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePermanent(role.id);
              Alert.alert("Eliminado", `El rol "${role.name}" ha sido eliminado permanentemente`);
            } catch (err: any) {
              const message =
                err?.data?.message || err?.message || "No se pudo eliminar el rol";
              Alert.alert("Error", message);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: RoleListItem }) => (
    <View style={styles.trashItem}>
      <View style={styles.trashItemHeader}>
        <View style={styles.trashItemName}>
          <ShieldOff size={16} color="#94A3B8" strokeWidth={2} />
          <Text style={styles.trashItemTitle}>{formatRoleName(item.name)}</Text>
        </View>
        <Text style={styles.deletedAt}>{formatDate(item.deletedAt!)}</Text>
      </View>

      {item.description ? (
        <Text style={styles.trashItemDesc} numberOfLines={1}>
          {item.description}
        </Text>
      ) : null}

      <View style={styles.trashItemActions}>
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={() => handleRestore(item)}
          activeOpacity={0.85}
        >
          <RotateCcw size={14} color="#22C55E" strokeWidth={2} />
          <Text style={styles.restoreButtonText}>Restaurar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deletePermButton}
          onPress={() => handleDeletePermanent(item)}
          activeOpacity={0.85}
        >
          <Trash2 size={14} color="#EF4444" strokeWidth={2} />
          <Text style={styles.deletePermButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
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
          <View style={styles.dragArea} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Trash2 size={20} color="#64748B" strokeWidth={2} />
              <Text style={styles.title}>Papelera</Text>
            </View>
            <TouchableOpacity onPress={closeAnimation} disabled={animating}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading && trashItems.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : trashItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Trash2 size={48} color="#CBD5E1" strokeWidth={1.5} />
              <Text style={styles.emptyText}>La papelera está vacía</Text>
            </View>
          ) : (
            <FlashList
              data={trashItems}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              refreshing={refreshing}
              onRefresh={refresh}
            />
          )}
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
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  loadingContainer: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 12,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  trashItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  trashItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  trashItemName: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  trashItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  deletedAt: {
    fontSize: 11,
    color: "#94A3B8",
  },
  trashItemDesc: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 10,
  },
  trashItemActions: {
    flexDirection: "row",
    gap: 8,
  },
  restoreButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 10,
    paddingVertical: 8,
  },
  restoreButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#22C55E",
  },
  deletePermButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 10,
    paddingVertical: 8,
  },
  deletePermButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
  },
});
