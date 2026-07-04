import { AlertCircle, AlertTriangle, Briefcase, CalendarClock, ChevronLeft, UserCircle } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doctorService, DoctorDetailResponse } from "@/shared/services/doctor.service";
import { ApiError } from "@/shared/http/http.client";
import { Skeleton } from "@/components/common/Skeleton";

export default function DoctorDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doctor, setDoctor] = useState<DoctorDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await doctorService.getById(id!);
        setDoctor(data);
      } catch (err: any) {
        if (err instanceof ApiError && err.status === 404) {
          setError("Doctor no encontrado");
        } else {
          setError(err.message || "Error al cargar el doctor");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={20} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Skeleton width={160} height={20} borderRadius={10} />
            <View style={{ height: 4 }} />
            <Skeleton width={100} height={13} borderRadius={6} />
          </View>
        </View>
        <View style={styles.content}>
          <Skeleton width="100%" height={120} borderRadius={16} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={160} borderRadius={16} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={100} borderRadius={16} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !doctor) {
    return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#EF4444" strokeWidth={1.5} />
          <Text style={styles.errorText}>{error || "Doctor no encontrado"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const fullName = `${doctor.firstName} ${doctor.lastName}`.trim() || "Doctor";
  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={20} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{fullName}</Text>
          <Text style={styles.headerSubtitle}>{doctor.specialty || "—"}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.profileCard}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarInitials}>
                {doctor.firstName?.charAt(0)}{doctor.lastName?.charAt(0)}
              </Text>
            </View>
            <Text style={styles.profileName}>{fullName}</Text>
            <Text style={styles.profileSpecialty}>{doctor.specialty || "—"}</Text>
            <View style={[styles.statusBadge, doctor.isActive ? styles.activeStatus : styles.inactiveStatus]}>
              <Text style={[styles.statusText, doctor.isActive ? styles.activeText : styles.inactiveText]}>
                {doctor.isActive ? "Activo" : "Inactivo"}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <UserCircle size={17} color="#4CB1B1" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Información General</Text>
            </View>
            <InfoRow label="Nombre Completo" value={fullName} />
            <InfoRow label="Email" value={doctor.email} />
            <InfoRow label="Teléfono" value={doctor.phoneNumber || "—"} />
            <InfoRow label="Especialidad" value={doctor.specialty || "—"} />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Briefcase size={17} color="#4CB1B1" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Información Profesional</Text>
            </View>
            <InfoRow label="N° Licencia" value={doctor.licenseNumber || "—"} />
            {/* <InfoRow label="Precio Consulta" value={priceFormatted} /> */}
            <View style={styles.biographyContainer}>
              <Text style={styles.biographyLabel}>Biografía</Text>
              <Text style={styles.biographyText}>{doctor.biography || "Sin biografía"}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CalendarClock size={17} color="#4CB1B1" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Horarios de Atención</Text>
            </View>
            {doctor.schedules && doctor.schedules.length > 0 ? (
              <View style={styles.scheduleGrid}>
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                  const daySchedules = doctor.schedules.filter((s) => s.dayOfWeek === dayIndex);
                  const activeSchedule = daySchedules.find((s) => s.isActive);
                  return (
                    <View
                      key={dayIndex}
                      style={[styles.scheduleDayCard, !activeSchedule && styles.scheduleDayCardMuted]}
                    >
                      <Text style={[styles.scheduleDayLabel, activeSchedule && styles.scheduleDayLabelActive]}>
                        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][dayIndex]}
                      </Text>
                      {activeSchedule ? (
                        <Text style={styles.scheduleDayTime}>
                          {activeSchedule.startTime} - {activeSchedule.endTime}
                        </Text>
                      ) : daySchedules.length > 0 ? (
                        <Text style={styles.scheduleDayMuted}>Inactivo</Text>
                      ) : (
                        <Text style={styles.scheduleDayMuted}>—</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.noSchedules}>
                <AlertTriangle size={28} color="#F59E0B" strokeWidth={1.5} />
                <Text style={styles.noSchedulesTitle}>Sin horarios registrados</Text>
                <Text style={styles.noSchedulesText}>
                  Este doctor no tiene horarios de atención configurados.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12, color: "#64748B", marginTop: 1 },

  scrollView: { flex: 1 },
  content: { padding: 16 },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E0F2F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4CB1B1",
  },
  profileName: { fontSize: 22, fontWeight: "800", color: "#0F172A", letterSpacing: -0.5 },
  profileSpecialty: { fontSize: 13, color: "#64748B", fontWeight: "500", marginTop: 4 },
  statusBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeStatus: { backgroundColor: "#DCFCE7" },
  inactiveStatus: { backgroundColor: "#F1F5F9" },
  statusText: { fontSize: 12, fontWeight: "600" },
  activeText: { color: "#22C55E" },
  inactiveText: { color: "#94A3B8" },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: "700", color: "#0F172A", letterSpacing: -0.3 },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#FAFAFA",
  },
  infoLabel: { fontSize: 13, color: "#64748B", fontWeight: "500", flex: 1 },
  infoValue: { fontSize: 13, color: "#0F172A", fontWeight: "600", flex: 1, textAlign: "right" },

  biographyContainer: { paddingTop: 12 },
  biographyLabel: { fontSize: 13, color: "#64748B", fontWeight: "500", marginBottom: 6 },
  biographyText: { fontSize: 13, color: "#0F172A", fontWeight: "500", lineHeight: 20 },

  scheduleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  scheduleDayCard: {
    width: "30.5%",
    backgroundColor: "#F0FDFA",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  scheduleDayCardMuted: {
    backgroundColor: "#F8FAFC",
    borderColor: "#F1F5F9",
  },
  scheduleDayLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  scheduleDayLabelActive: {
    color: "#0D9488",
  },
  scheduleDayTime: {
    fontSize: 10,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
  },
  scheduleDayMuted: {
    fontSize: 10,
    fontWeight: "500",
    color: "#CBD5E1",
  },

  noSchedules: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  noSchedulesTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  noSchedulesText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
  },

  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 },
  errorText: { fontSize: 15, color: "#EF4444", fontWeight: "500", textAlign: "center" },
  retryButton: {
    backgroundColor: "#4CB1B1",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
});
