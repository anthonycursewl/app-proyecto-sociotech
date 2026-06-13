import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";

export const SettingsHeader = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const userName = user ? `${user.firstName} ${user.lastName}` : "Usuario";

  return (
    <View>
      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.titleText}>Configuración</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0) ?? ''}{user?.lastName?.charAt(0) ?? ''}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: "relative", paddingHorizontal: 16, paddingBottom: 16 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  backButton: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  titleText: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  placeholder: { width: 38 },
  profileSection: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: "#E0F2F1", justifyContent: "center", alignItems: "center", marginRight: 14,
  },
  avatarText: { fontSize: 20, fontWeight: "700", color: "#4CB1B1" },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 2 },
  profileEmail: { fontSize: 13, color: "#94A3B8", fontWeight: "500" },
});