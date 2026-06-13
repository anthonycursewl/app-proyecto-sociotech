import { Ban, Briefcase, CalendarSync, ChevronLeft, FileDown, FileText, Phone, RefreshCw, Stethoscope, X } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useState } from "react";
import { AppointmentSection } from "@/components/appointments/AppointmentSection";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppointmentDetailSkeleton } from "@/components/appointments/AppointmentDetailSkeleton";
import { BottomSheetModal } from "@/components/common/BottomSheetModal";
import { CancelAppointmentModal } from "@/components/appointments/CancelAppointmentModal";
import { ListErrorState } from "@/components/common/ListErrorState";
import { useAppointmentDetail } from "@/shared/hooks/useAppointmentDetail";
import { appointmentService } from "@/shared/services/appointment.service";
import { pdfService } from "@/shared/services/pdf.service";
import { setCached } from "@/shared/cache/appointmentCache";
import { useCanCancelOwnAppointment, useCanUpdateOwnAppointment } from "@/shared/permissions/capabilities";
import { mapToAdminAppointmentData } from "@/shared/mappers/appointment.mapper";
import { colors } from "@/shared/theme/colors";

const STATUS_META: Record<
  "pending" | "confirmed" | "completed" | "cancelled",
  { label: string; dot: string }
> = {
  pending: { label: "Pendiente", dot: "#F59E0B" },
  confirmed: { label: "Confirmada", dot: "#0D9488" },
  completed: { label: "Completada", dot: "#10B981" },
  cancelled: { label: "Cancelada", dot: "#EF4444" },
};

const formatLongDate = (dateStr: string) => {
  if (!dateStr || dateStr === "—") return { day: "—", month: "", weekday: "" };
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return { day: dateStr, month: "", weekday: "" };
  return {
    day: date.toLocaleDateString("es-ES", { day: "numeric" }),
    month: date.toLocaleDateString("es-ES", { month: "short" }).replace(".", ""),
    weekday: date.toLocaleDateString("es-ES", { weekday: "long" }),
  };
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PatientAppointmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { appointment, loading, error, notFound, refetch, updateLocal } =
    useAppointmentDetail(id);

  const canCancelOwn = useCanCancelOwnAppointment();
  const canUpdateOwn = useCanUpdateOwnAppointment();

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const viewModel = useMemo(
    () => (appointment ? mapToAdminAppointmentData(appointment) : null),
    [appointment],
  );

  const date = useMemo(
    () => (viewModel ? formatLongDate(viewModel.date) : null),
    [viewModel],
  );
  const statusKey = viewModel?.status ?? null;
  const status = statusKey ? STATUS_META[statusKey] : null;
  const canCancel =
    !!appointment &&
    (appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED") &&
    canCancelOwn;

  const canReschedule =
    !!appointment &&
    (appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED") &&
    canUpdateOwn;

  const handleCancelConfirm = useCallback(
    async (reason: string) => {
      if (!appointment) return;
      const updated = await appointmentService.cancel(appointment.id, { reason });
      setCached(updated);
      updateLocal(updated);
    },
    [appointment, updateLocal],
  );

  if (notFound || (!loading && !appointment)) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <View style={styles.headerRowLight}>
          <TouchableOpacity style={styles.backButtonLight} onPress={() => router.back()}>
            <ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        <ListErrorState
          message="No se encontró la cita solicitada"
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  if (error && !appointment) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <View style={styles.headerRowLight}>
          <TouchableOpacity style={styles.backButtonLight} onPress={() => router.back()}>
            <ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        <ListErrorState message={error} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (!loading && (!appointment || !date || !status)) return null;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container} edges={["top"]}>
        {loading && !appointment ? (
          <AppointmentDetailSkeleton />
        ) : (
          <>
        <View style={styles.headerRowLight}>
          <TouchableOpacity style={styles.backButtonLight} onPress={() => router.back()}>
            <ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>Detalle de cita</Text>
          <TouchableOpacity
            style={styles.refreshButtonLight}
            onPress={refetch}
            disabled={loading}
          >
            <RefreshCw
              size={18}
              color="#0F172A"
              strokeWidth={2.5}
              style={loading ? styles.rotating : undefined}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View>
                <Text style={styles.heroDateWeekday}>{date.weekday}</Text>
                <Text style={styles.heroDateDay}>{date.day}</Text>
                <Text style={styles.heroDateMonth}>{date.month}</Text>
              </View>
              <View style={styles.heroTimeBlock}>
                <Text style={styles.heroTime}>{appointment.timeSlot}</Text>
                <Text style={styles.heroDuration}>
                  {appointment.service?.durationMin ?? appointment.durationMinutes} min
                </Text>
              </View>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
              <Text style={styles.statusLabel}>{status.label}</Text>
            </View>

            <Text style={styles.heroService} numberOfLines={2}>
              {appointment.service?.name ?? "Servicio no disponible"}
            </Text>
          </View>

          <AppointmentSection title="Profesional" icon={Stethoscope}>
            <Text style={styles.personName}>
              {appointment.doctor?.fullName ?? "Profesional no disponible"}
            </Text>
            {appointment.doctor?.specialty && (
              <Text style={styles.personDetail}>{appointment.doctor.specialty}</Text>
            )}
            {appointment.doctor?.phoneNumber && (
              <View style={styles.contactRow}>
                <Phone size={12} color="#0D9488" strokeWidth={2.2} />
                <Text style={styles.contactText}>{appointment.doctor.phoneNumber}</Text>
              </View>
            )}
          </AppointmentSection>

          <AppointmentSection title="Servicio" icon={Briefcase}>
            <Text style={styles.metaName}>{appointment.service?.name ?? "—"}</Text>
            {appointment.service?.description && (
              <Text style={styles.metaDescription}>{appointment.service.description}</Text>
            )}
          </AppointmentSection>

          <AppointmentSection title="Motivo de consulta" icon={FileText}>
            <Text style={styles.reasonText}>{appointment.reason}</Text>
            {appointment.notes && (
              <View style={styles.notesBlock}>
                <Text style={styles.notesLabel}>Notas adicionales</Text>
                <Text style={styles.notesText}>{appointment.notes}</Text>
              </View>
            )}
          </AppointmentSection>

          {appointment.cancellation && (
            <View style={styles.cancellationCard}>
              <View style={styles.cancellationHeader}>
                <Ban size={14} color="#B91C1C" strokeWidth={2.5} />
                <Text style={styles.cancellationTitle}>Cita cancelada</Text>
              </View>
              <View style={styles.cancellationRow}>
                <Text style={styles.cancellationLabel}>Fecha:</Text>
                <Text style={styles.cancellationValue}>
                  {formatDateTime(appointment.cancellation.cancelledAt)}
                </Text>
              </View>
              {appointment.cancellation.cancellationReason && (
                <View style={styles.cancellationRow}>
                  <Text style={styles.cancellationLabel}>Motivo:</Text>
                  <Text style={styles.cancellationValue}>
                    {appointment.cancellation.cancellationReason}
                  </Text>
                </View>
              )}
            </View>
          )}

          {canReschedule && (
            <View style={styles.actionsBlock}>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionReschedule]}
                onPress={() =>
                  router.navigate({
                    pathname: "/appointments/create",
                    params: {
                      rescheduleId: appointment.id,
                      doctorId: appointment.doctorId,
                      serviceId: appointment.serviceId,
                    },
                  })
                }
              >
                <CalendarSync size={16} color="#0D9488" strokeWidth={2.5} />
                <Text style={[styles.actionText, { color: "#0D9488" }]}>
                  Reagendar cita
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.actionsBlock}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionPdf]}
              onPress={() => setDownloadModalVisible(true)}
            >
              <FileDown size={16} color={colors.accent} strokeWidth={2.5} />
              <Text style={[styles.actionText, { color: colors.accent }]}>
                Descargar PDF
              </Text>
            </TouchableOpacity>
          </View>

          <BottomSheetModal
            visible={downloadModalVisible}
            onClose={() => setDownloadModalVisible(false)}
            height={0.4}
          >
            <View style={styles.downloadSheetContent}>
              <View style={styles.downloadSheetIcon}>
                <FileDown size={28} color={colors.accent} strokeWidth={2} />
              </View>
              <Text style={styles.downloadSheetTitle}>Descargar PDF</Text>
              <Text style={styles.downloadSheetSubtitle}>
                Se descargará un PDF con los detalles de la cita médica.
              </Text>
              {downloading ? (
                <View style={styles.downloadSheetLoading}>
                  <ActivityIndicator size={28} color={colors.accent} />
                  <Text style={styles.downloadSheetLoadingText}>Descargando...</Text>
                </View>
              ) : (
                <View style={styles.downloadSheetActions}>
                  <TouchableOpacity
                    style={styles.downloadSheetCancel}
                    onPress={() => setDownloadModalVisible(false)}
                  >
                    <Text style={styles.downloadSheetCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.downloadSheetConfirm}
                    onPress={async () => {
                      setDownloading(true);
                      await pdfService.downloadAppointment(appointment.id);
                      setDownloading(false);
                      setDownloadModalVisible(false);
                    }}
                  >
                    <FileDown size={16} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.downloadSheetConfirmText}>Descargar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </BottomSheetModal>

          {canCancel && (
            <View style={styles.actionsBlock}>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionDanger]}
                onPress={() => setCancelModalVisible(true)}
              >
                <X size={16} color="#B91C1C" strokeWidth={2.5} />
                <Text style={[styles.actionText, { color: "#B91C1C" }]}>
                  Cancelar cita
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ID: {appointment.id}
            </Text>
            <Text style={styles.footerText}>
              Creada: {formatDateTime(appointment.createdAt)}
            </Text>
          </View>
        </ScrollView>
          </>
        )}
      </SafeAreaView>

      {!!appointment && (
        <CancelAppointmentModal
          visible={cancelModalVisible}
          onClose={() => setCancelModalVisible(false)}
          onConfirm={handleCancelConfirm}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: "transparent" },
  body: { flex: 1, backgroundColor: "transparent" },
  headerRowLight: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  backButtonLight: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleLight: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  refreshButtonLight: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  rotating: {
    opacity: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEF0F3",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  heroDateWeekday: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    textTransform: "capitalize",
    marginBottom: 4,
  },
  heroDateDay: {
    fontSize: 32,
    color: "#111827",
    fontWeight: "600",
    lineHeight: 36,
    fontVariant: ["tabular-nums"],
  },
  heroDateMonth: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 2,
  },
  heroTimeBlock: {
    alignItems: "flex-end",
  },
  heroTime: {
    fontSize: 28,
    color: "#0D9488",
    fontWeight: "700",
    letterSpacing: -0.6,
    fontVariant: ["tabular-nums"],
  },
  heroDuration: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    marginTop: 2,
  },
  heroDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  heroService: {
    fontSize: 18,
    color: "#111827",
    fontWeight: "700",
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEF0F3",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  personName: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
    lineHeight: 20,
  },
  personDetail: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 2,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  contactText: {
    fontSize: 13,
    color: "#0D9488",
    fontWeight: "600",
  },
  metaName: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
    lineHeight: 20,
  },
  metaDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginTop: 6,
  },
  reasonText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  notesBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  notesLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 19,
    fontStyle: "italic",
  },
  cancellationCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#B91C1C",
  },
  cancellationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cancellationTitle: {
    fontSize: 13,
    color: "#B91C1C",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cancellationRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  cancellationLabel: {
    fontSize: 12,
    color: "#7F1D1D",
    fontWeight: "700",
  },
  cancellationValue: {
    flex: 1,
    fontSize: 12,
    color: "#7F1D1D",
    fontWeight: "500",
  },
  actionsBlock: {
    gap: 10,
    marginTop: 4,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionDanger: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  actionReschedule: {
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  actionPdf: {
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: colors.accent + "40",
  },
  actionText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  footer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  downloadSheetContent: {
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  downloadSheetIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  downloadSheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  downloadSheetSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 8,
  },
  downloadSheetActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  downloadSheetCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },
  downloadSheetCancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  downloadSheetConfirm: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  downloadSheetConfirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  downloadSheetLoading: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
  },
  downloadSheetLoadingText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.accent,
  },
});
