import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface DoctorEditHeaderProps {
  title?: string;
}

export const DoctorEditHeader = ({ title = "Editar Perfil" }: DoctorEditHeaderProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.titleText}>{title}</Text>
        <View style={styles.placeholder} />
      </View>

      <Text style={styles.subtitle}>Actualiza tu información profesional</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 20 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  backButton: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  titleText: { fontSize: 20, fontWeight: "700", color: "#0F172A", letterSpacing: -0.5 },
  placeholder: { width: 38 },
  subtitle: { fontSize: 14, color: "#64748B", fontWeight: "500", paddingHorizontal: 4 },
});
