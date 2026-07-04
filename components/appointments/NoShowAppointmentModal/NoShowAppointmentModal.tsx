import { AlertCircle, UserX } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/components/common/SText";
import { BottomSheetModal } from "@/components/common/BottomSheetModal";
import { Appointment } from "@/shared/services/appointment.service";
interface NoShowAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  appointment: Appointment;
}

export const NoShowAppointmentModal = ({
  visible,
  onClose,
  onConfirm,
  appointment,
}: NoShowAppointmentModalProps) => {
  const [mutating, setMutating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const patientName = appointment.patient?.fullName ?? `#${appointment.patientId.slice(0, 8)}`;

  const handleConfirm = async () => {
    setMutating(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo marcar como no show");
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
    <BottomSheetModal visible={visible} onClose={handleClose} height={380}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <UserX size={28} color="#6B7280" strokeWidth={2} />
        </View>

        <Text style={styles.title}>Marcar como no show</Text>

        <Text style={styles.description}>
          El paciente <Text style={styles.bold}>{patientName}</Text> no se presentó a la cita.
          La cita quedará marcada como vencida y no se podrá reactivar.
        </Text>

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
              <ActivityIndicator color="#6B7280" />
            ) : (
              <>
                <UserX size={16} color="#6B7280" strokeWidth={2.5} />
                <Text style={styles.confirmText}>Sí, marcar no show</Text>
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
    paddingTop: 12,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  bold: {
    fontWeight: "700",
    color: "#111827",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    width: "100%",
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#B91C1C",
    fontWeight: "500",
  },
  actions: {
    width: "100%",
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
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.2,
  },
});
