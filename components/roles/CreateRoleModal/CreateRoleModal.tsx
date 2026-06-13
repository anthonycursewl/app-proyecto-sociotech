import { CustomButton } from "@/components/common/CustomButton";
import { Text } from "@/components/common/SText";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CreateRoleModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => Promise<void>;
  creating: boolean;
}

const SHEET_HEIGHT = SCREEN_HEIGHT * 0.55;
const DRAG_THRESHOLD = 60;

export const CreateRoleModal = ({
  visible,
  onClose,
  onCreate,
  creating,
}: CreateRoleModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [animating, setAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const slideY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetScale = useRef(new Animated.Value(0.95)).current;

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
  }, [overlayOpacity, slideY, sheetScale]);

  const closeAnimation = useCallback(() => {
    if (creating) return;
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
      setName("");
      setDescription("");
      onClose();
    });
  }, [creating, onClose, overlayOpacity, slideY, sheetScale]);

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

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre del rol es obligatorio");
      return;
    }
    try {
      await onCreate(name.trim().toUpperCase(), description.trim());
      setName("");
      setDescription("");
      closeAnimation();
    } catch {
    }
  };

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
            <Text style={styles.title}>Crear nuevo rol</Text>
            <TouchableOpacity onPress={closeAnimation} disabled={creating}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.field}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: RECEPCIONISTA"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                autoCapitalize="characters"
                editable={!creating}
              />
              <Text style={styles.helper}>Nombre único que identifica al rol. Se convertirá a mayúsculas automáticamente. Ejemplos: RECEPCIONISTA, ENFERMERA, CAJERO.</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Descripción (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descripción del rol..."
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!creating}
              />
              <Text style={styles.helper}>Explica brevemente las responsabilidades de este rol para que otros administradores entiendan su propósito.</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <CustomButton
              title="Cancelar"
              variant="secondary"
              onPress={closeAnimation}
              disabled={creating}
              style={styles.cancelButton}
            />
            <CustomButton
              title="Crear rol"
              variant="primary"
              onPress={handleCreate}
              isLoading={creating}
              style={styles.createButton}
            />
          </View>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flex: 1,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  helper: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 6,
    lineHeight: 15,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  cancelButton: {
    flex: 1,
  },
  createButton: {
    flex: 2,
  },
});
