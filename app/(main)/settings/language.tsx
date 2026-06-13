import { Check, ChevronLeft } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { SafeAreaView , useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/shared/theme/colors";

const LANGUAGES = [
  { id: "es", label: "Español", native: "Español", flag: "🇪🇸" },
  { id: "en", label: "English", native: "English", flag: "🇺🇸" },
  { id: "fr", label: "Français", native: "Français", flag: "🇫🇷" },
];

export default function LanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState("es");

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Idioma</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.content}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity key={lang.id} style={[styles.option, selected === lang.id && styles.optionSelected]} onPress={() => setSelected(lang.id)}>
            <Text style={styles.flag}>{lang.flag}</Text>
            <View style={styles.optionInfo}>
              <Text style={styles.optionLabel}>{lang.label}</Text>
              <Text style={styles.optionNative}>{lang.native}</Text>
            </View>
            {selected === lang.id && <Check size={20} color={colors.accent} strokeWidth={2.5} />}
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
  option: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 14, padding: 16, gap: 12 },
  optionSelected: { borderWidth: 1, borderColor: colors.accent + "40" },
  flag: { fontSize: 28 },
  optionInfo: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  optionNative: { fontSize: 12, color: colors.textSecondary, fontWeight: "500", marginTop: 1 },
});
