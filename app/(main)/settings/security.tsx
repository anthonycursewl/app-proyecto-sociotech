import { ChevronLeft } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { SafeAreaView , useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/shared/theme/colors";

export default function SecurityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }
    Alert.alert("Éxito", "Contraseña actualizada correctamente");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Seguridad</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Cambiar Contraseña</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Contraseña actual</Text>
          <TextInput style={styles.input} placeholder="Tu contraseña actual" placeholderTextColor={colors.textMuted} secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />
          <Text style={styles.inputHelper}>La contraseña que usas actualmente para iniciar sesión.</Text>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nueva contraseña</Text>
          <TextInput style={styles.input} placeholder="Mínimo 6 caracteres" placeholderTextColor={colors.textMuted} secureTextEntry value={newPassword} onChangeText={setNewPassword} />
          <Text style={styles.inputHelper}>Mínimo 6 caracteres. Combina letras, números y símbolos para mayor seguridad.</Text>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirmar nueva contraseña</Text>
          <TextInput style={styles.input} placeholder="Repite la nueva contraseña" placeholderTextColor={colors.textMuted} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
          <Text style={styles.inputHelper}>Repite la nueva contraseña para confirmar que la escribiste correctamente.</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Actualizar Contraseña</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 16 },
  backButton: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.surface, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  placeholder: { width: 38 },
  content: { padding: 16, gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: "600", color: colors.textSecondary, letterSpacing: 0.2 },
  inputHelper: { fontSize: 11, color: colors.textMuted, lineHeight: 15, paddingHorizontal: 2 },
  input: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
  button: { backgroundColor: colors.accent, borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
