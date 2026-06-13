import { Calendar, ChevronLeft, ClipboardList, Expand, FileDown, FileText, HeartPulse, Mail, Phone, Plus, RefreshCw, Shield, UserCircle } from "lucide-react-native";
import { ListErrorState } from "@/components/common/ListErrorState";
import { Text } from "@/components/common/SText";
import { BottomSheetModal } from "@/components/common/BottomSheetModal";
import { PatientDetailSkeleton } from "@/components/patients/PatientDetailSkeleton";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { MedicalRecordListItem } from "@/components/medical-records/MedicalRecordListItem";
import { useMedicalRecordsByPatient } from "@/shared/hooks/useMedicalRecordsByPatient";
import { patientService, PatientResponse } from "@/shared/services/patient.service";
import { pdfService } from "@/shared/services/pdf.service";
import { colors } from "@/shared/theme/colors";

type TabKey = "perfil" | "historial";

const formatDate = (iso: string) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

export default function PatientProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>("perfil");
  const [fullProfileVisible, setFullProfileVisible] = useState(false);
  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadHistory = useCallback(async () => {
    if (!patient || downloading) return;
    setDownloading(true);
    await pdfService.downloadClinicalHistory(patient.id);
    setDownloading(false);
  }, [patient, downloading]);
  const [patientLoading, setPatientLoading] = useState(true);
  const [patientError, setPatientError] = useState<string | null>(null);

  const { records, loading, refreshing, error, refresh, reload } =
    useMedicalRecordsByPatient(id);

  const fetchPatient = useCallback(async () => {
    if (!id) return;
    setPatientLoading(true);
    setPatientError(null);
    try {
      const res = await patientService.getById(id);
      setPatient(res);
    } catch (err) {
      setPatientError(err instanceof Error ? err.message : "Error al cargar paciente");
    } finally {
      setPatientLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  const fullName = patient
    ? `${patient.firstName ?? ""} ${patient.lastName ?? ""}`.trim() || "Paciente"
    : "Paciente";
  const initials = fullName
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const dob = patient ? formatDate(patient.dateOfBirth) : null;
  const genderLabel = patient?.gender
    ? patient.gender === "Masculino"
      ? "Masculino"
      : patient.gender === "Femenino"
      ? "Femenino"
      : patient.gender
    : "No especificado";

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paciente</Text>
          <View style={styles.headerSpacer} />
        </View>

        {patientError ? (
          <ListErrorState message={patientError} onRetry={fetchPatient} />
        ) : patient ? (
          <>
            <View style={styles.profileCard}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>{initials || "?"}</Text>
              </View>
            <View style={styles.profileNameBlock}>
              <Text style={styles.profileName} numberOfLines={2}>
                {fullName}
              </Text>
              {patient.medicalId && (
                <Text style={styles.profileSubtitle}>ID: {patient.medicalId}</Text>
              )}
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.createHcButton}
                onPress={() =>
                  router.navigate({
                    pathname: "/admin/records/create",
                    params: { patientId: patient.id },
                  })
                }
                activeOpacity={0.8}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.createHcButtonText}>Añadir registro</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.downloadHistoryButton}
                onPress={handleDownloadHistory}
                disabled={downloading}
                activeOpacity={0.8}
              >
                {downloading ? (
                  <ActivityIndicator size={16} color={colors.accent} />
                ) : (
                  <FileDown size={16} color={colors.accent} strokeWidth={2.5} />
                )}
                <Text style={styles.downloadHistoryText}>
                  {downloading ? "Descargando..." : "Descargar historial"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.profileMetaRow}>
                {patient.email && (
                  <View style={styles.profileMetaItem}>
                    <Mail size={12} color="#94A3B8" strokeWidth={2.2} />
                    <Text style={styles.profileMetaText} numberOfLines={1}>
                      {patient.email}
                    </Text>
                  </View>
                )}
                {patient.phone && (
                  <View style={styles.profileMetaItem}>
                    <Phone size={12} color="#94A3B8" strokeWidth={2.2} />
                    <Text style={styles.profileMetaText} numberOfLines={1}>
                      {patient.phone}
                    </Text>
                  </View>
                )}
                {dob && (
                  <View style={styles.profileMetaItem}>
                    <Calendar size={12} color="#94A3B8" strokeWidth={2.2} />
                    <Text style={styles.profileMetaText}>{dob}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.tabsRow}>
              <TouchableOpacity
                style={[styles.tab, activeTab === "perfil" && styles.tabActive]}
                onPress={() => setActiveTab("perfil")}
                activeOpacity={0.7}
              >
                <UserCircle
                  size={14}
                  color={activeTab === "perfil" ? "#FFFFFF" : "#0F172A"}
                  strokeWidth={2.5}
                />
                <Text
                  style={[styles.tabText, activeTab === "perfil" && styles.tabActiveText]}
                >
                  Perfil
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === "historial" && styles.tabActive]}
                onPress={() => setActiveTab("historial")}
                activeOpacity={0.7}
              >
                <ClipboardList
                  size={14}
                  color={activeTab === "historial" ? "#FFFFFF" : "#0F172A"}
                  strokeWidth={2.5}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "historial" && styles.tabActiveText,
                  ]}
                >
                  Historial Clínico
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === "perfil" ? (
              <>
                <ScrollView
                  style={styles.tabBody}
                  contentContainerStyle={styles.tabBodyContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <UserCircle size={17} color="#0D9488" strokeWidth={2.5} />
                      <Text style={styles.sectionTitle}>Información Personal</Text>
                    </View>
                    <InfoRow label="Nombre Completo" value={fullName} />
                    <InfoRow label="Email" value={patient.email ?? "—"} />
                    <InfoRow label="Teléfono" value={patient.phone} />
                    {patient.cedula && <InfoRow label="Cédula" value={patient.cedula} />}
                    <InfoRow label="Género" value={genderLabel} />
                    <InfoRow
                      label="Fecha de Nacimiento"
                      value={
                        dob
                          ? new Date(patient.dateOfBirth).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "—"
                      }
                    />
                    {patient.occupation && (
                      <InfoRow label="Ocupación" value={patient.occupation} />
                    )}
                    {patient.civilStatus && (
                      <InfoRow label="Estado Civil" value={patient.civilStatus} />
                    )}
                  </View>

                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <HeartPulse size={17} color="#0D9488" strokeWidth={2.5} />
                      <Text style={styles.sectionTitle}>Información Médica</Text>
                    </View>
                    <InfoRow
                      label="Tipo de Sangre"
                      value={patient.bloodType || "No especificado"}
                    />
                  </View>

                </ScrollView>

                <View style={styles.fadeContainer} pointerEvents="box-none">
                  <TouchableOpacity
                    style={styles.seeMoreButton}
                    onPress={() => setFullProfileVisible(true)}
                    activeOpacity={0.85}
                  >
                    <Expand size={14} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.seeMoreButtonText}>Ver más detalles</Text>
                  </TouchableOpacity>
                </View>

                <BottomSheetModal
                  visible={fullProfileVisible}
                  onClose={() => setFullProfileVisible(false)}
                  height={0.9}
                >
                  <ScrollView
                    style={styles.modalScroll}
                    contentContainerStyle={styles.modalContent}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.modalHeader}>
                      <View style={styles.modalIcon}>
                        <UserCircle size={20} color="#0D9488" strokeWidth={2.5} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalTitle}>Perfil Completo</Text>
                        <Text style={styles.modalSubtitle}>{fullName}</Text>
                      </View>
                    </View>

                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <UserCircle size={17} color="#0D9488" strokeWidth={2.5} />
                        <Text style={styles.sectionTitle}>Información Personal</Text>
                      </View>
                      <InfoRow label="Nombre Completo" value={fullName} />
                      <InfoRow label="Email" value={patient.email ?? "—"} />
                      <InfoRow label="Teléfono" value={patient.phone} />
                      {patient.cedula && <InfoRow label="Cédula" value={patient.cedula} />}
                      <InfoRow label="Género" value={genderLabel} />
                      <InfoRow
                        label="Fecha de Nacimiento"
                        value={
                          dob
                            ? new Date(patient.dateOfBirth).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })
                            : "—"
                        }
                      />
                      {patient.occupation && (
                        <InfoRow label="Ocupación" value={patient.occupation} />
                      )}
                      {patient.civilStatus && (
                        <InfoRow label="Estado Civil" value={patient.civilStatus} />
                      )}
                      {patient.address && <InfoRow label="Dirección" value={patient.address} />}
                    </View>

                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <HeartPulse size={17} color="#0D9488" strokeWidth={2.5} />
                        <Text style={styles.sectionTitle}>Información Médica</Text>
                      </View>
                      <InfoRow
                        label="Tipo de Sangre"
                        value={patient.bloodType || "No especificado"}
                      />
                      <InfoRow
                        label="Alergias"
                        value={
                          patient.allergies?.length
                            ? patient.allergies.join(", ")
                            : "Ninguna"
                        }
                      />
                      <InfoRow
                        label="Medicamentos Actuales"
                        value={
                          patient.currentMedications?.length
                            ? patient.currentMedications.join(", ")
                            : "Ninguno"
                        }
                      />
                      <InfoRow
                        label="Enfermedades Crónicas"
                        value={
                          patient.chronicDiseases?.length
                            ? patient.chronicDiseases.join(", ")
                            : "Ninguna"
                        }
                      />
                    </View>

                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Shield size={17} color="#0D9488" strokeWidth={2.5} />
                        <Text style={styles.sectionTitle}>Contacto de Emergencia</Text>
                      </View>
                      <InfoRow label="Nombre" value={patient.emergencyContact || "—"} />
                      <InfoRow label="Teléfono" value={patient.emergencyPhone || "—"} />
                    </View>
                  </ScrollView>
                </BottomSheetModal>
              </>
            ) : loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={colors.accent} />
              </View>
            ) : error && records.length === 0 ? (
              <ListErrorState message={error} onRetry={reload} />
            ) : (
              <ScrollView
                style={styles.tabBody}
                contentContainerStyle={styles.tabBodyContent}
                showsVerticalScrollIndicator={false}
              >
                {records.map((r) => (
                  <MedicalRecordListItem
                    key={r.id}
                    record={r}
                    onPress={() =>
                      router.navigate({ pathname: "/admin/records/[id]", params: { id: r.id } })
                    }
                    showPatient={false}
                    doctorName="Doctor tratante"
                  />
                ))}
                {!loading && records.length === 0 && (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIcon}>
                      <FileText size={28} color="#94A3B8" strokeWidth={2} />
                    </View>
                    <Text style={styles.emptyTitle}>Sin historias clínicas</Text>
                    <Text style={styles.emptySubtitle}>
                      Este paciente aún no tiene historias clínicas registradas.
                    </Text>
                  </View>
                )}
                {refreshing && (
                  <ActivityIndicator
                    color={colors.accent}
                    style={{ paddingVertical: 12 }}
                  />
                )}
                <TouchableOpacity
                  style={styles.refreshLink}
                  onPress={refresh}
                  disabled={refreshing}
                >
                  <RefreshCw size={12} color="#0D9488" strokeWidth={2.5} />
                  <Text style={styles.refreshText}>Actualizar</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </>
        ) : null}

        <PatientDetailSkeleton loading={patientLoading} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
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
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  headerSpacer: { width: 38 },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEF0F3",
    alignItems: "center",
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarLargeText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0D9488",
  },
  profileNameBlock: {
    alignItems: "center",
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  createHcButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#0D9488",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  createHcButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.2,
    textAlign: "center",
  },
  profileSubtitle: {
    fontSize: 12,
    color: "#0D9488",
    fontWeight: "600",
    marginTop: 2,
  },
  profileMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  profileMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  profileMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
    maxWidth: 180,
  },
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },
  tabActive: {
    backgroundColor: "#0F172A",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  tabActiveText: {
    color: "#FFFFFF",
  },
  tabBody: {
    flex: 1,
  },
  tabBodyContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  fadeContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingBottom: 28,
  },
  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  seeMoreButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 16,
    marginBottom: 4,
  },
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
    marginTop: 2,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEF0F3",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#FAFAFA",
    gap: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  refreshLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0D9488",
  },
  downloadHistoryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  downloadHistoryText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.accent,
  },
});
