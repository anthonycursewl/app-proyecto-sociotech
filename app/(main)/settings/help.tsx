import { BookOpen, ChevronLeft, ChevronRight, FileText, Headset, HelpCircle, Shield } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Alert, Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { SafeAreaView , useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/shared/theme/colors";

const HELP_ITEMS = [
  { id: "faq", title: "Preguntas Frecuentes", icon: HelpCircle, color: "#4CB1B1" },
  { id: "contact", title: "Contactar Soporte", icon: Headset, color: "#3B82F6" },
  { id: "tutorial", title: "Tutorial de Uso", icon: BookOpen, color: "#8B5CF6" },
  { id: "terms", title: "Términos y Condiciones", icon: FileText, color: "#64748B" },
  { id: "privacy", title: "Política de Privacidad", icon: Shield, color: "#64748B" },
];

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handlePress = (id: string) => {
    if (id === "contact") {
      Alert.alert("Contactar Soporte", "Envíanos un correo a soporte@sociotech.com\n\nTe responderemos en menos de 24 horas.");
    } else if (id === "faq") {
      Alert.alert("Preguntas Frecuentes", "Pronto disponible en nuestra web.");
    } else if (id === "tutorial") {
      Linking.openURL("https://sociotech.com/tutorial");
    } else {
      Alert.alert(id === "terms" ? "Términos y Condiciones" : "Política de Privacidad", "Disponible en sociotech.com/legal");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Ayuda y Soporte</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.content}>
        {HELP_ITEMS.map((item) => (
          <TouchableOpacity key={item.id} style={styles.row} onPress={() => handlePress(item.id)}>
            <View style={[styles.iconBox, { backgroundColor: item.color + "15" }]}>
              <item.icon size={20} color={item.color} strokeWidth={2} />
            </View>
            <Text style={styles.rowLabel}>{item.title}</Text>
            <ChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
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
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 14, padding: 16, gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.textPrimary },
});
