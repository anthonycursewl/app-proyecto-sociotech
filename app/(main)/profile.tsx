import { Calendar, Check, CheckCircle, ChevronLeft, LogOut, Mail, PenLine, ShieldCheck, User, X } from "lucide-react-native";
import { Text } from "@/components/common/SText";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ACCENT = "#4CB1B1";
const ACCENT_DARK = "#3A9494";
const ACCENT_LIGHT = "#E0F7F7";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateUser, loading } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");

  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-20)).current;

  const editModeAnim = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
    }
  }, [user]);

  const showSuccessToast = useCallback(() => {
    setShowToast(true);
    toastOpacity.setValue(0);
    toastTranslateY.setValue(-20);

    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(toastTranslateY, {
        toValue: 0,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: -20,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => setShowToast(false));
    }, 2500);
  }, [toastOpacity, toastTranslateY]);

  const toggleEditMode = useCallback(() => {
    const entering = !isEditing;
    setIsEditing(entering);

    Animated.parallel([
      Animated.spring(editModeAnim, {
        toValue: entering ? 1 : 0,
        friction: 8,
        tension: 65,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(avatarScale, {
          toValue: 0.92,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(avatarScale, {
          toValue: 1,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    if (!entering && user) {
      // Reset values on cancel
      setFirstName(user.firstName);
      setLastName(user.lastName);
    }
  }, [isEditing, user, editModeAnim, avatarScale]);

  const handleSave = useCallback(async () => {
    if (!user) return;

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst || !trimmedLast) {
      Alert.alert("Error", "El nombre y apellido son obligatorios.");
      return;
    }

    Keyboard.dismiss();

    const ok = await updateUser({
      firstName: trimmedFirst,
      lastName: trimmedLast,
    });

    if (!ok) {
      Alert.alert("Error", "No se pudieron guardar los datos.");
      return;
    }

    // Sync local state immediately
    setFirstName(trimmedFirst);
    setLastName(trimmedLast);

    setIsEditing(false);
    Animated.spring(editModeAnim, {
      toValue: 0,
      friction: 8,
      tension: 65,
      useNativeDriver: false,
    }).start();

    showSuccessToast();
  }, [user, firstName, lastName, updateUser, editModeAnim, showSuccessToast]);

  const handleLogout = () => {
    Alert.alert("¿Cerrar sesión?", "¿Seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ACCENT} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initials = `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`;
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  const memberSince = new Date(user.createdAt).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const cardBorderColor = editModeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#F1F5F9", ACCENT],
  });

  const hasChanges =
    (firstName?.trim() ?? "") !== (user?.firstName ?? "") ||
    (lastName?.trim() ?? "") !== (user?.lastName ?? "");

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
      <StatusBar style="dark" />

      {/* Success Toast */}
      {showToast && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastOpacity,
              transform: [{ translateY: toastTranslateY }],
            },
          ]}
        >
          <CheckCircle size={18} color="#22C55E" strokeWidth={2.5} />
          <Text style={styles.toastText}>Perfil actualizado correctamente</Text>
        </Animated.View>
      )}

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Mi Perfil</Text>
        <TouchableOpacity
          style={[styles.editToggle, isEditing && styles.editToggleActive]}
          onPress={isEditing ? undefined : toggleEditMode}
          activeOpacity={isEditing ? 1 : 0.7}
        >
          {isEditing ? (
            <PenLine size={18} color="#FFFFFF" strokeWidth={2.5} />
          ) : (
            <PenLine size={18} color={ACCENT} strokeWidth={2.5} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Section */}
        <Animated.View style={[styles.avatarSection, { transform: [{ scale: avatarScale }] }]}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.name}>{fullName}</Text>
        </Animated.View>

        {/* Editable Info Card */}
        <Animated.View style={[styles.card, { borderColor: cardBorderColor, borderWidth: 1.5 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Información Personal</Text>
            {isEditing && (
              <View style={styles.editingBadge}>
                <View style={styles.editingDot} />
                <Text style={styles.editingLabel}>Editando</Text>
              </View>
            )}
          </View>

          {/* First Name */}
          <View style={styles.fieldGroup}>
            <View style={styles.fieldLabel}>
              <User size={15} color="#94A3B8" strokeWidth={2} />
              <Text style={styles.fieldLabelText}>Nombre</Text>
            </View>
            {isEditing ? (
              <>
                <TextInput
                  style={styles.fieldInput}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Tu nombre"
                  placeholderTextColor="#CBD5E1"
                  autoCapitalize="words"
                />
                <Text style={styles.fieldHelper}>Tu nombre real. Se mostrará en tus citas, recetas y mensajes con el consultorio.</Text>
              </>
            ) : (
              <Text style={styles.fieldValue}>{user.firstName}</Text>
            )}
          </View>

          <View style={styles.fieldDivider} />

          {/* Last Name */}
          <View style={styles.fieldGroup}>
            <View style={styles.fieldLabel}>
              <User size={15} color="#94A3B8" strokeWidth={2} />
              <Text style={styles.fieldLabelText}>Apellido</Text>
            </View>
            {isEditing ? (
              <>
                <TextInput
                  style={styles.fieldInput}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Tu apellido"
                  placeholderTextColor="#CBD5E1"
                  autoCapitalize="words"
                />
                <Text style={styles.fieldHelper}>Tu apellido legal, tal como aparece en tu documento de identidad.</Text>
              </>
            ) : (
              <Text style={styles.fieldValue}>{user.lastName}</Text>
            )}
          </View>

          <View style={styles.fieldDivider} />

          {/* Email (read-only) */}
          <View style={styles.fieldGroup}>
            <View style={styles.fieldLabel}>
              <Mail size={15} color="#94A3B8" strokeWidth={2} />
              <Text style={styles.fieldLabelText}>Correo electrónico</Text>
            </View>
            <Text style={styles.fieldValue}>{user.email}</Text>
          </View>
        </Animated.View>

        {/* Action Buttons for Edit Mode */}
        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.saveBtn, !hasChanges && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={loading || !hasChanges}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.saveBtnText}>Guardar Cambios</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={toggleEditMode}
              disabled={loading}
              activeOpacity={0.8}
            >
              <X size={18} color="#64748B" strokeWidth={2.5} />
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Account Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Cuenta</Text>
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.fieldLabel}>
              <Calendar size={15} color="#94A3B8" strokeWidth={2} />
              <Text style={styles.fieldLabelText}>Miembro desde</Text>
            </View>
            <Text style={styles.fieldValue}>{memberSince}</Text>
          </View>

          <View style={styles.fieldDivider} />

          <View style={styles.fieldGroup}>
            <View style={styles.fieldLabel}>
              <ShieldCheck size={15} color="#94A3B8" strokeWidth={2} />
              <Text style={styles.fieldLabelText}>Estado de cuenta</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                user.isActive ? styles.activeStatus : styles.inactiveStatus,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: user.isActive ? "#22C55E" : "#EF4444" },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  user.isActive ? styles.activeText : styles.inactiveText,
                ]}
              >
                {user.isActive ? "Activa" : "Inactiva"}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={18} color="#EF4444" strokeWidth={2.5} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* Version info */}
        <Text style={styles.versionText}>Versión 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 15,
    color: "#94A3B8",
  },

  // Toast
  toast: {
    position: "absolute",
    top: 100,
    left: 24,
    right: 24,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
  },
  toastText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  // Top Bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  editToggle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: ACCENT_LIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  editToggleActive: {
    backgroundColor: ACCENT,
  },

  // Scroll
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Avatar
  avatarSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: ACCENT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: ACCENT,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: ACCENT_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
    color: ACCENT_DARK,
  },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  editingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: ACCENT_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
  editingLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: ACCENT_DARK,
  },

  // Fields
  fieldGroup: {
    paddingVertical: 10,
    gap: 6,
  },
  fieldLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fieldLabelText: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    paddingLeft: 23,
  },
  fieldInput: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 2,
  },
  fieldHelper: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
    lineHeight: 15,
    paddingHorizontal: 2,
  },
  fieldDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },

  // Edit Actions
  editActions: {
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  saveBtn: {
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    backgroundColor: "#CBD5E1",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cancelBtn: {
    backgroundColor: "#F1F5F9",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
  },

  // Status
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 23,
    alignSelf: "flex-start",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  activeStatus: {
    backgroundColor: "#DCFCE7",
  },
  inactiveStatus: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  activeText: {
    color: "#22C55E",
  },
  inactiveText: {
    color: "#EF4444",
  },

  // Logout
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
  },

  // Version
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#CBD5E1",
    marginTop: 20,
  },
});
