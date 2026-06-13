import { ChevronLeft, Heart } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { SafeAreaView , useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/shared/theme/colors";

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Acerca de</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.logo}>
            <Heart size={36} color={colors.accent} strokeWidth={2} />
          </View>
          <Text style={styles.appName}>SocioTech</Text>
          <Text style={styles.version}>Versión 1.0.0</Text>
        </View>
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Desarrollado por</Text>
            <Text style={styles.infoValue}>SocioTech Team</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plataforma</Text>
            <Text style={styles.infoValue}>React Native / Expo</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Licencia</Text>
            <Text style={styles.infoValue}>Privada</Text>
          </View>
        </View>
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
  content: { padding: 16, gap: 24 },
  logoSection: { alignItems: "center", paddingVertical: 32, gap: 8 },
  logo: { width: 72, height: 72, borderRadius: 20, backgroundColor: colors.accent + "15", justifyContent: "center", alignItems: "center", marginBottom: 4 },
  appName: { fontSize: 22, fontWeight: "700", color: colors.textPrimary },
  version: { fontSize: 14, color: colors.textSecondary, fontWeight: "500" },
  infoSection: { backgroundColor: colors.surface, borderRadius: 14, overflow: "hidden" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  infoLabel: { fontSize: 14, color: colors.textSecondary, fontWeight: "500" },
  infoValue: { fontSize: 14, color: colors.textPrimary, fontWeight: "600" },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
});
