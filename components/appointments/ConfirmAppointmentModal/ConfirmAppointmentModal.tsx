import { AlertCircle, Briefcase, Calendar, CheckCircle, Clock, User } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/components/common/SText";
import { BottomSheetModal } from "@/components/common/BottomSheetModal";
import { Appointment } from "@/shared/services/appointment.service";
interface ConfirmAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  appointment: Appointment;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

export const ConfirmAppointmentModal = ({
  visible,
  onClose,
  onConfirm,
  appointment,
}: ConfirmAppointmentModalProps) => {
  const [mutating, setMutating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleConfirm = async () => {
    setMutating(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo confirmar la cita");
    } finally {
      setMutating(false);
    }
  };

  const handleClose = () => {
    if (mutating) return;
    setError(null);
    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={handleClose} height={480}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <CheckCircle size={22} color="#0D9488" strokeWidth={2.5} />
          </View>
          <Text style={styles.title}>Confirmar cita</Text>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            Revisa los detalles antes de confirmar la cita.
          </Text>

          <View style={styles.detailRow}>
            <Briefcase size={14} color="#0D9488" strokeWidth={2.5} />
            <View style={styles.detailTextBlock}>
              <Text style={styles.detailLabel}>Servicio</Text>
              <Text style={styles.detailValue}>
                {appointment.service?.name ?? "—"}
              </Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <User size={14} color="#0D9488" strokeWidth={2.5} />
            <View style={styles.detailTextBlock}>
              <Text style={styles.detailLabel}>Paciente</Text>
              <Text style={styles.detailValue}>
                #{appointment.patientId.slice(0, 8)}
              </Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Calendar size={14} color="#0D9488" strokeWidth={2.5} />
            <View style={styles.detailTextBlock}>
              <Text style={styles.detailLabel}>Fecha y hora</Text>
              <Text style={styles.detailValue}>
                {formatDate(appointment.scheduledAt)} · {appointment.timeSlot}
              </Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Clock size={14} color="#0D9488" strokeWidth={2.5} />
            <View style={styles.detailTextBlock}>
              <Text style={styles.detailLabel}>Duración</Text>
              <Text style={styles.detailValue}>
                {appointment.service?.durationMin ?? appointment.durationMinutes} min
              </Text>
            </View>
          </View>
        </ScrollView>

        {error && (
          <View style={styles.errorBox}>
            <AlertCircle size={14} color="#B91C1C" strokeWidth={2.5} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
            disabled={mutating}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>No, volver</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, mutating && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={mutating}
            activeOpacity={0.8}
          >
            {mutating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <CheckCircle size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.confirmText}>Sí, confirmar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 4,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 18,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailTextBlock: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 12,
    marginLeft: 26,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#B91C1C",
    fontWeight: "500",
  },
  actions: {
    gap: 10,
    marginTop: "auto",
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0D9488",
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
