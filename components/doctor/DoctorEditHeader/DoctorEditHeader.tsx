import * as LucideIcons from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface DoctorEditHeaderProps {
  title?: string;
}

export const DoctorEditHeader = ({ title = "Editar Perfil" }: DoctorEditHeaderProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#4CB1B1', '#3A9A9A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <LucideIcons.ChevronLeft size={22} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.titleText}>{title}</Text>
          <View style={styles.placeholder} />
        </View>

        <Text style={styles.subtitle}>Actualiza tu información profesional</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { position: "relative" },
  gradient: { position: "absolute", top: 0, left: 0, right: 0, height: 140 },
  container: { position: "relative", paddingHorizontal: 16, paddingBottom: 20 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  backButton: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  titleText: { fontSize: 20, fontWeight: "700", color: "#FFFFFF", letterSpacing: -0.5 },
  placeholder: { width: 38 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: "500", paddingHorizontal: 4 },
});