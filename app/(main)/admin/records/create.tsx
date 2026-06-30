import { Text } from "@/components/common/SText";
import { MedicalRecordForm } from "@/components/medical-records/MedicalRecordForm";
import { doctorService } from "@/shared/services/doctor.service";
import { medicalRecordService, PrescriptionData, VitalSignsData } from "@/shared/services/medicalRecord.service";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MedicalRecordCreateScreen() {
  const router = useRouter();
  const doctorProfile = useAuthStore((s) => s.doctorProfile);
  const { patientId, doctorId: paramDoctorId, appointmentId } = useLocalSearchParams<{
    patientId: string;
    doctorId?: string;
    appointmentId?: string;
  }>();

  const [resolvedDoctorId, setResolvedDoctorId] = useState<string | null>(
    paramDoctorId || doctorProfile?.id || null,
  );
  const [resolvingDoctor, setResolvingDoctor] = useState(!paramDoctorId && !doctorProfile);

  useEffect(() => {
    async function resolveDoctor() {
      if (paramDoctorId || doctorProfile?.id) return;
      try {
        const profile = await doctorService.getMyProfile();
        setResolvedDoctorId(profile.id);
      } catch {
      } finally {
        setResolvingDoctor(false);
      }
    }
    if (!resolvedDoctorId && resolvingDoctor) resolveDoctor();
  }, [paramDoctorId, doctorProfile, resolvedDoctorId, resolvingDoctor]);

  const handleSubmit = useCallback(
    async (data: {
      chiefComplaint: string;
      symptoms: string[];
      diagnosis: string;
      treatment: string;
      notes: string;
      vitalSigns?: VitalSignsData;
      prescriptions?: PrescriptionData[];
    }) => {
      if (!resolvedDoctorId) {
        throw new Error("No se pudo determinar el ID del doctor. Por favor, intente más tarde.");
      }
      await medicalRecordService.create({
        patientId,
        doctorId: resolvedDoctorId,
        appointmentId: appointmentId || undefined,
        ...data,
      });
      router.back();
    },
    [patientId, resolvedDoctorId, appointmentId, router],
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nueva Historia Clínica</Text>
          <View style={styles.headerSpacer} />
        </View>

        {resolvingDoctor ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#0D9488" />
            <Text style={styles.loadingText}>Cargando perfil del doctor...</Text>
          </View>
        ) : (
          <MedicalRecordForm onSubmit={handleSubmit} />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAFC" },
  container: { flex: 1, backgroundColor: "transparent" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  headerSpacer: { width: 38 },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
});
