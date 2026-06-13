import { ChevronLeft, Pencil } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MedicalRecordView } from "@/components/medical-records/MedicalRecordView";
import { MedicalRecordForm } from "@/components/medical-records/MedicalRecordForm";
import { ListErrorState } from "@/components/common/ListErrorState";
import { medicalRecordService, MedicalRecordResponse, VitalSignsData, PrescriptionData } from "@/shared/services/medicalRecord.service";
import { useCanSignMedicalRecords, useCanUpdateMedicalRecords } from "@/shared/permissions/capabilities";

export default function AdminMedicalRecordDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [record, setRecord] = useState<MedicalRecordResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const canSign = useCanSignMedicalRecords();
  const canUpdate = useCanUpdateMedicalRecords();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await medicalRecordService.getById(id);
      setRecord(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleSign = useCallback(async () => {
    const updated = await medicalRecordService.sign(id);
    setRecord(updated);
    setEditing(false);
  }, [id]);

  const handleUpdate = useCallback(
    async (data: {
      chiefComplaint: string;
      symptoms: string[];
      diagnosis: string;
      diagnosisCode?: string;
      treatment: string;
      notes: string;
      vitalSigns?: VitalSignsData;
      prescriptions?: PrescriptionData[];
    }) => {
      const updated = await medicalRecordService.update(id, data);
      setRecord(updated);
      setEditing(false);
    },
    [id],
  );

  const editable = canUpdate && record && !record.isSigned && !editing;

  if (loading && !record) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#0D9488" />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !record) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        <ListErrorState message={error} onRetry={fetch} />
      </SafeAreaView>
    );
  }

  if (!record) return null;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editing ? "Editar HC" : "Historia Clínica"}
          </Text>
          {editable && !editing && (
            <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
              <Pencil size={16} color="#0D9488" strokeWidth={2.5} />
            </TouchableOpacity>
          )}
          {editing && (
            <TouchableOpacity style={styles.editButton} onPress={() => setEditing(false)}>
              <Text style={styles.cancelEditText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>

        {editing ? (
          <MedicalRecordForm
            initialData={{
              chiefComplaint: record.chiefComplaint,
              symptoms: record.symptoms.join(", "),
              diagnosis: record.diagnosis,
              diagnosisCode: record.diagnosisCode ?? undefined,
              treatment: record.treatment,
              notes: record.notes,
              vitalSigns: {
                bloodPressure: record.bloodPressure ?? undefined,
                heartRate: record.heartRate ?? undefined,
                temperature: record.temperature ?? undefined,
                weight: record.weight ?? undefined,
                height: record.height ?? undefined,
                respiratoryRate: record.respiratoryRate ?? undefined,
                oxygenSaturation: record.oxygenSaturation ?? undefined,
              },
              prescriptions: record.prescriptions.map((p) => ({
                medicationName: p.medicationName,
                dosage: p.dosage ?? undefined,
                frequency: p.frequency ?? undefined,
                duration: p.duration ?? undefined,
                instructions: p.instructions ?? undefined,
              })),
            }}
            onSubmit={handleUpdate}
            submitLabel="Guardar cambios"
          />
        ) : (
          <MedicalRecordView
            record={record}
            canSign={canSign && !record.isSigned}
            onSign={handleSign}
          />
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
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F0FDFA",
  },
  cancelEditText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#B91C1C",
  },
});
