import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as LucideIcons from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { patientService, PatientResponse } from "@/shared/services/patient.service";
import { ApiError } from "@/shared/http/http.client";
import { Skeleton } from "@/components/common/Skeleton";

export default function PatientDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await patientService.getById(id!);
        setPatient(data);
      } catch (err: any) {
        if (err instanceof ApiError && err.status === 404) {
          setError("Paciente no encontrado");
        } else {
          setError(err.message || "Error al cargar el paciente");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="light" />
        <LinearGradient colors={['#8B5CF6', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.headerGradient} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <LucideIcons.ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Skeleton width={160} height={20} borderRadius={10} />
            <View style={{ height: 4 }} />
            <Skeleton width={100} height={13} borderRadius={6} />
          </View>
        </View>
        <View style={styles.content}>
          <Skeleton width="100%" height={180} borderRadius={16} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={180} borderRadius={16} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={140} borderRadius={16} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !patient) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <LucideIcons.AlertCircle size={48} color="#EF4444" strokeWidth={1.5} />
          <Text style={styles.errorText}>{error || "Paciente no encontrado"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const fullName = `${patient.firstName ?? ""} ${patient.lastName ?? ""}`.trim() || "Paciente";

  const genderLabel = patient.gender ? (patient.gender === "Masculino" ? "Masculino" : patient.gender === "Femenino" ? "Femenino" : patient.gender) : "No especificado";

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#8B5CF6', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
      />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <LucideIcons.ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{fullName}</Text>
          <Text style={styles.headerSubtitle}>{patient.medicalId || "—"}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.profileCard}>
            <Text style={styles.profileName}>{fullName}</Text>
            {patient.medicalId && <Text style={styles.profileMedicalId}>{patient.medicalId}</Text>}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LucideIcons.UserCircle size={17} color="#8B5CF6" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Información Personal</Text>
            </View>
            <InfoRow label="Nombre Completo" value={fullName} />
            <InfoRow label="Email" value={patient.email ?? "—"} />
            <InfoRow label="Teléfono" value={patient.phone} />
            {patient.cedula && <InfoRow label="Cédula" value={patient.cedula} />}
            <InfoRow label="Género" value={genderLabel} />
            <InfoRow label="Fecha de Nacimiento" value={patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) : "—"} />
            {patient.occupation && <InfoRow label="Ocupación" value={patient.occupation} />}
            {patient.civilStatus && <InfoRow label="Estado Civil" value={patient.civilStatus} />}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LucideIcons.HeartPulse size={17} color="#8B5CF6" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Información Médica</Text>
            </View>
            <InfoRow label="Tipo de Sangre" value={patient.bloodType || "No especificado"} />
            <InfoRow label="Alergias" value={patient.allergies?.length ? patient.allergies.join(", ") : "Ninguna"} />
            <InfoRow label="Medicamentos Actuales" value={patient.currentMedications?.length ? patient.currentMedications.join(", ") : "Ninguno"} />
            <InfoRow label="Enfermedades Crónicas" value={patient.chronicDiseases?.length ? patient.chronicDiseases.join(", ") : "Ninguna"} />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LucideIcons.Shield size={17} color="#8B5CF6" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Contacto de Emergencia</Text>
            </View>
            <InfoRow label="Nombre" value={patient.emergencyContact || "—"} />
            <InfoRow label="Teléfono" value={patient.emergencyPhone || "—"} />
            <InfoRow label="Dirección" value={patient.address || "—"} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  headerGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 140 },

  header: {
    position: "relative",
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
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 1 },

  scrollView: { flex: 1 },
  content: { padding: 16 },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  profileName: { fontSize: 22, fontWeight: "800", color: "#0F172A", letterSpacing: -0.5 },
  profileMedicalId: { fontSize: 13, color: "#64748B", fontWeight: "500", marginTop: 4 },

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
