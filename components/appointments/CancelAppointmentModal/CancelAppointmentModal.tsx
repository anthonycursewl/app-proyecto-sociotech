import { AlertCircle, Ban, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "@/components/common/SText";
import { BottomSheetModal } from "@/components/common/BottomSheetModal";
interface CancelAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  title?: string;
}

export const CancelAppointmentModal = ({
  visible,
  onClose,
  onConfirm,
  title = "Cancelar cita",
}: CancelAppointmentModalProps) => {
  const [reason, setReason] = useState("");
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setMutating(true);
    setError(null);
    try {
      await onConfirm(reason.trim() || "Cancelada por el usuario");
      setReason("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cancelar la cita");
    } finally {
      setMutating(false);
    }
  };

  const handleClose = () => {
    if (mutating) return;
    setReason("");
    setError(null);
    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={handleClose} height={420}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ban size={22} color="#B91C1C" strokeWidth={2.5} />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>

        <Text style={styles.subtitle}>
          ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Motivo de cancelación (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Ya no me queda tiempo ese día"
            placeholderTextColor="#9CA3AF"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!mutating}
          />
        </View>

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
            <Text style={styles.cancelText}>No, mantener</Text>
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
                <X size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.confirmText}>Sí, cancelar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
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
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
    minHeight: 80,
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
    backgroundColor: "#B91C1C",
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
