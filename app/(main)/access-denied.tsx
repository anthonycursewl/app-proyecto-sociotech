import { Text } from "@/components/common/SText";
import { colors } from "@/shared/theme/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ShieldX } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function AccessDeniedScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <ShieldX size={40} color={colors.error} strokeWidth={2} />
        </View>
        <Text style={styles.title}>Acceso no permitido</Text>
        <Text style={styles.subtitle}>
          Tu cuenta no tiene permisos para abrir esta sección
          {from ? ` (${from})` : ""}.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/(main)/home")}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.textSecondary, textAlign: "center", lineHeight: 22 },
  button: {
    marginTop: 28,
    backgroundColor: colors.textPrimary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
