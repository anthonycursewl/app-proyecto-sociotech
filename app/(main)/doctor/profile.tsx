import { CalendarClock, ChevronRight, ClipboardList, Eye, EyeOff, Settings, UserPen, Users } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Text } from "@/components/common/SText"
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { DoctorProfileHeader } from "../../../components/doctors/DoctorProfileHeader";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { doctorService } from "@/shared/services/doctor.service";

const QUICK_ACTIONS = [
  { id: "schedule", title: "Mi Agenda", icon: CalendarClock, color: "#4CB1B1", route: "/admin/appointments" },
  { id: "patients", title: "Mis Pacientes", icon: Users, color: "#8B5CF6", route: "/patients" },
  { id: "records", title: "Historias Clínicas", icon: ClipboardList, color: "#F59E0B", route: "/admin/records" },
  { id: "editProfile", title: "Editar Perfil", icon: UserPen, color: "#3B82F6", route: "/doctor/edit-profile" },
  { id: "settings", title: "Configuración", icon: Settings, color: "#64748B", route: "/settings" },
];

export default function DoctorProfileScreen() {
  const router = useRouter();
  const [visibilityLoading, setVisibilityLoading] = useState(false);
  const doctorProfile = useAuthStore((s) => s.doctorProfile);
  const loadDoctorProfile = useAuthStore((s) => s.loadDoctorProfile);
  const setDoctorProfile = useAuthStore((s) => s.setDoctorProfile);

  useEffect(() => {
    if (!doctorProfile) loadDoctorProfile();
  }, []);

  const handleToggleVisibility = useCallback(async () => {
    if (visibilityLoading) return;
    setVisibilityLoading(true);
    try {
      const updated = await doctorService.toggleVisibility();
      setDoctorProfile(updated);
    } catch {
      Alert.alert("Error", "No se pudo cambiar la visibilidad del perfil.");
    } finally {
      setVisibilityLoading(false);
    }
  }, [visibilityLoading, setDoctorProfile]);

  const isVisible = doctorProfile?.isVisible ?? true;

  const renderAction = useCallback(
    ({ item }: { item: typeof QUICK_ACTIONS[0] }) => (
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => router.navigate({ pathname: item.route as any })}
      >
        <View style={[styles.actionIcon, { backgroundColor: item.color + "15" }]}>
          <item.icon size={22} color={item.color} strokeWidth={2.5} />
        </View>
        <Text style={styles.actionText}>{item.title}</Text>
        <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
      </TouchableOpacity>
    ),
    [router],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <DoctorProfileHeader />
      <FlashList
        data={QUICK_ACTIONS}
        renderItem={renderAction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <TouchableOpacity
              style={[styles.actionCard, styles.visibilityCard]}
              onPress={handleToggleVisibility}
              disabled={visibilityLoading}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: (isVisible ? "#4CB1B1" : "#94A3B8") + "15" }]}>
                {visibilityLoading ? (
                  <ActivityIndicator size={22} color={isVisible ? "#4CB1B1" : "#94A3B8"} />
                ) : isVisible ? (
                  <Eye size={22} color="#4CB1B1" strokeWidth={2.5} />
                ) : (
                  <EyeOff size={22} color="#94A3B8" strokeWidth={2.5} />
                )}
              </View>
              <View style={styles.visibilityContent}>
                <Text style={styles.actionText}>Visibilidad del Perfil</Text>
                <Text style={styles.visibilityDescription}>
                  {isVisible
                    ? "Los pacientes pueden encontrarte en las búsquedas públicas."
                    : "Tu perfil está oculto para los pacientes."}
                </Text>
              </View>
              <View style={[styles.visibilityBadge, isVisible ? styles.visibleBadge : styles.hiddenBadge]}>
                <Text style={[styles.visibilityBadgeText, isVisible ? styles.visibleBadgeText : styles.hiddenBadgeText]}>
                  {isVisible ? "Visible" : "Oculto"}
                </Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  list: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 12,
  },
  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F8FAFC",
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  visibilityCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  visibilityContent: {
    flex: 1,
    marginRight: 10,
  },
  visibilityDescription: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 2,
    lineHeight: 15,
  },
  visibilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  visibleBadge: {
    backgroundColor: "#DCFCE7",
  },
  hiddenBadge: {
    backgroundColor: "#F1F5F9",
  },
  visibilityBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  visibleBadgeText: {
    color: "#22C55E",
  },
  hiddenBadgeText: {
    color: "#94A3B8",
  },
});