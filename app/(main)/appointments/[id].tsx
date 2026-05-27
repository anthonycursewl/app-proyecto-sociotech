import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert } from "react-native";
import { Text } from "@/components/common/SText";
import { SafeAreaView } from "react-native-safe-area-context";
import * as LucideIcons from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppointmentDetailSkeleton } from "@/components/appointments/AppointmentDetailSkeleton";
import { DetailHeader } from "@/components/appointments/DetailHeader";
import { ListErrorState } from "@/components/common/ListErrorState";
import { useAppointmentDetail } from "@/shared/hooks/useAppointmentDetail";
import { appointmentService, Appointment, AppointmentStatus } from "@/shared/services/appointment.service";
import { setCached } from "@/shared/cache/appointmentCache";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { useCanManageAppointments, useCanCancelAnyAppointment } from "@/shared/permissions/capabilities";
import { mapToAdminAppointmentData } from "@/shared/mappers/appointment.mapper";
import { colors } from "@/shared/theme/colors";

const STATUS_META: Record<
  "pending" | "confirmed" | "completed" | "cancelled",
  { label: string; dot: string; bg: string; text: string }
> = {
  pending: { label: "Pendiente", dot: "#F59E0B", bg: "#FEF3C7", text: "#B45309" },
  confirmed: { label: "Confirmada", dot: "#0D9488", bg: "#E0F2F1", text: "#0D9488" },
  completed: { label: "Completada", dot: "#10B981", bg: "#DCFCE7", text: "#15803D" },
  cancelled: { label: "Cancelada", dot: "#EF4444", bg: "#FEE2E2", text: "#B91C1C" },
};

const STATUS_FROM_API: Record<AppointmentStatus, keyof typeof STATUS_META> = {
  SCHEDULED: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "cancelled",
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

const formatPrice = (price: number | null) => {
  if (price === null || price === undefined) return null;
  return `$${price.toLocaleString("es-ES")}`;
};

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrap}>
          <Icon size={17} color="#0D9488" strokeWidth={2.5} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);

  const { appointment, loading, error, notFound, refetch, updateLocal } =
    useAppointmentDetail(id);

  const canManage = useCanManageAppointments();
  const canCancelAny = useCanCancelAnyAppointment();

  const [mutating, setMutating] = React.useState(false);

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
  const priceLabel = viewModel ? formatPrice(viewModel.servicePrice) : null;
  const isOwnAppointment =
    appointment && user && appointment.patientId === user.id;
  const canCancel =
    !!appointment &&
    !mutating &&
    (appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED") &&
    (canCancelAny || isOwnAppointment);

  const handleCancel = useCallback(() => {
    if (!appointment) return;
    Alert.alert(
      "Cancelar cita",
      "¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.",
      [
        { text: "No, mantener", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            setMutating(true);
            try {
              const updated = await appointmentService.cancel(appointment.id, {
                reason: "Cancelada por el usuario",
              });
              setCached(updated);
              updateLocal(updated);
            } catch (err) {
              Alert.alert(
                "Error",
                err instanceof Error ? err.message : "No se pudo cancelar la cita",
              );
            } finally {
              setMutating(false);
            }
          },
        },
      ],
    );
  }, [appointment, updateLocal]);

  if (loading && !appointment) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <View style={styles.bodyBackground} />
        <DetailHeader height={200} />
        <SafeAreaView style={styles.container} edges={["top"]}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <LucideIcons.ChevronLeft size={22} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalle de cita</Text>
            <View style={styles.refreshButtonPlaceholder} />
          </View>
        </SafeAreaView>
        <AppointmentDetailSkeleton />
      </View>
    );
  }

  if (notFound || (!loading && !appointment)) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <View style={styles.headerRowLight}>
          <TouchableOpacity style={styles.backButtonLight} onPress={() => router.back()}>
            <LucideIcons.ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
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
            <LucideIcons.ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        <ListErrorState message={error} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (!appointment || !date || !status) return null;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.bodyBackground} />
      <DetailHeader height={260} />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <LucideIcons.ChevronLeft size={22} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de cita</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refetch}
            disabled={loading}
          >
            <LucideIcons.RefreshCw
              size={18}
              color="#FFFFFF"
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
            {priceLabel && <Text style={styles.heroPrice}>{priceLabel}</Text>}
          </View>

          {canManage && (
            <Section title="Paciente" icon={LucideIcons.User}>
              <Text style={styles.personName}>
                — <Text style={styles.personId}>#{appointment.patientId.slice(0, 8)}</Text>
              </Text>
            </Section>
          )}

          <Section title="Profesional" icon={LucideIcons.Stethoscope}>
            <Text style={styles.personName}>
              {appointment.doctor?.fullName ?? "Profesional no disponible"}
            </Text>
            {appointment.doctor?.specialty && (
              <Text style={styles.personDetail}>{appointment.doctor.specialty}</Text>
            )}
            {appointment.doctor?.phoneNumber && (
              <View style={styles.contactRow}>
                <LucideIcons.Phone size={12} color="#0D9488" strokeWidth={2.2} />
                <Text style={styles.contactText}>{appointment.doctor.phoneNumber}</Text>
              </View>
            )}
          </Section>

          <Section title="Servicio" icon={LucideIcons.Briefcase}>
            <Text style={styles.metaName}>{appointment.service?.name ?? "—"}</Text>
            {appointment.service?.description && (
              <Text style={styles.metaDescription}>{appointment.service.description}</Text>
            )}
            {priceLabel && (
              <View style={styles.priceRow}>
                <Text style={styles.priceRowLabel}>Precio</Text>
                <Text style={styles.priceRowValue}>{priceLabel}</Text>
              </View>
            )}
          </Section>

          <Section title="Motivo de consulta" icon={LucideIcons.FileText}>
            <Text style={styles.reasonText}>{appointment.reason}</Text>
            {appointment.notes && (
              <View style={styles.notesBlock}>
                <Text style={styles.notesLabel}>Notas adicionales</Text>
                <Text style={styles.notesText}>{appointment.notes}</Text>
              </View>
            )}
          </Section>

          {appointment.cancellation && (
            <View style={styles.cancellationCard}>
              <View style={styles.cancellationHeader}>
                <LucideIcons.Ban size={14} color="#B91C1C" strokeWidth={2.5} />
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

          {canCancel && (
            <View style={styles.actionsBlock}>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionDanger]}
                onPress={handleCancel}
              >
                <LucideIcons.X size={16} color="#B91C1C" strokeWidth={2.5} />
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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: "transparent" },
  body: { flex: 1, backgroundColor: "transparent" },
  bodyBackground: {
    position: "absolute",
    top: 150,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  headerRowLight: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonLight: {
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
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  refreshButtonPlaceholder: {
    width: 38,
    height: 38,
  },
  rotating: {
    opacity: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 130,
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
  heroPrice: {
    fontSize: 16,
    color: "#0D9488",
    fontWeight: "700",
    marginTop: 6,
    fontVariant: ["tabular-nums"],
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
  personId: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
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
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  priceRowLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  priceRowValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
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
  actionPrimary: {
    backgroundColor: "#0D9488",
  },
  actionDanger: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
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
});
