import { Check, ChevronLeft, Monitor, Moon, Sun } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { SafeAreaView , useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/shared/theme/colors";

type ThemeOption = "light" | "dark" | "system";

const THEMES: { id: ThemeOption; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Oscuro", icon: Moon },
  { id: "system", label: "Sistema", icon: Monitor },
];

export default function AppearanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<ThemeOption>("light");

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Apariencia</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Tema</Text>
        {THEMES.map((theme) => (
          <TouchableOpacity key={theme.id} style={[styles.option, selected === theme.id && styles.optionSelected]} onPress={() => setSelected(theme.id)}>
            <theme.icon size={20} color={selected === theme.id ? colors.accent : colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.optionLabel, selected === theme.id && styles.optionLabelSelected]}>{theme.label}</Text>
            {selected === theme.id && <Check size={20} color={colors.accent} strokeWidth={2.5} />}
          </TouchableOpacity>
        ))}
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
  content: { padding: 16, gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  option: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 14, padding: 16, gap: 12 },
  optionSelected: { borderWidth: 1, borderColor: colors.accent + "40" },
  optionLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  optionLabelSelected: { color: colors.accent },
});
