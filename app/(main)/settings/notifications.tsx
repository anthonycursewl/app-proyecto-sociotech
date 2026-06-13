import { Bell, Calendar, ChevronLeft, ClipboardCheck, MessageSquare, Tag } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Switch, View , TouchableOpacity } from "react-native";
import { Text } from "@/components/common/SText";
import { SafeAreaView , useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/shared/theme/colors";

const NOTIFICATION_OPTIONS = [
  { id: "appointments", title: "Recordatorio de citas", description: "Notificaciones 24h antes de tu cita", icon: Calendar, default: true },
  { id: "results", title: "Resultados disponibles", description: "Cuando tus resultados estén listos", icon: ClipboardCheck, default: true },
  { id: "messages", title: "Mensajes del doctor", description: "Nuevos mensajes de tu médico", icon: MessageSquare, default: true },
  { id: "promotions", title: "Ofertas y promociones", description: "Descuentos en servicios médicos", icon: Tag, default: false },
  { id: "system", title: "Notificaciones del sistema", description: "Actualizaciones y cambios importantes", icon: Bell, default: true },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = React.useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_OPTIONS.map((o) => [o.id, o.default]))
  );

  const toggle = (id: string) => setSettings((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Notificaciones</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.list}>
        {NOTIFICATION_OPTIONS.map((opt) => (
          <View key={opt.id} style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: colors.accent + "15" }]}>
              <opt.icon size={20} color={colors.accent} strokeWidth={2} />
            </View>
            <View style={styles.info}>
              <Text style={styles.rowTitle}>{opt.title}</Text>
              <Text style={styles.rowDesc}>{opt.description}</Text>
            </View>
            <Switch
              value={settings[opt.id]}
              onValueChange={() => toggle(opt.id)}
              trackColor={{ false: "#E2E8F0", true: colors.accent + "60" }}
              thumbColor={settings[opt.id] ? colors.accent : "#FFFFFF"}
            />
          </View>
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
  list: { padding: 16, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 14, padding: 14, gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  info: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: "600", color: colors.textPrimary, marginBottom: 2 },
  rowDesc: { fontSize: 12, color: colors.textSecondary, fontWeight: "500" },
});
