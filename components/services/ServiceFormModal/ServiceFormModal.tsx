import { BottomSheetModal } from "@/components/common/BottomSheetModal";
import { Text } from "@/components/common/SText";
import { ServiceData } from "@/components/services/ServiceCard";
import { serviceService } from "@/shared/services/service.service";
import { CheckCheck, Clock, Edit3, FileText, Plus, Tag } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface ServiceFormData {
  name: string;
  description: string;
  durationMin: string;
}

interface ServiceFormModalProps {
  visible: boolean;
  editingService?: ServiceData | null;
  onClose: () => void;
  onSaved: () => void;
}

const DEFAULT_PRICE = 0;

export const ServiceFormModal = ({ visible, editingService, onClose, onSaved }: ServiceFormModalProps) => {
  const isEditing = !!editingService;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ServiceFormData>({
    name: "",
    description: "",
    durationMin: "",
  });

  useEffect(() => {
    if (editingService) {
      setForm({
        name: editingService.name,
        description: editingService.description ?? "",
        durationMin: String(editingService.durationMin),
      });
    } else {
      setForm({ name: "", description: "", durationMin: "" });
    }
  }, [editingService, visible]);

  const updateField = (key: keyof ServiceFormData, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert("Validación", "El nombre del servicio es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        durationMin: form.durationMin ? parseInt(form.durationMin, 10) : undefined,
        price: DEFAULT_PRICE,
      };

      if (isEditing) {
        await serviceService.update(editingService!.id, payload);
      } else {
        await serviceService.create(payload as { name: string; description?: string; durationMin?: number; price?: number });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo guardar el servicio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} height={0.6}>
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            {isEditing ? (
              <Edit3 size={18} color="#4CB1B1" strokeWidth={2.5} />
            ) : (
              <Plus size={18} color="#4CB1B1" strokeWidth={2.5} />
            )}
          </View>
          <Text style={styles.title}>{isEditing ? "Editar Servicio" : "Nuevo Servicio"}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nombre *</Text>
          <View style={styles.inputRow}>
            <Tag size={16} color="#94A3B8" strokeWidth={2} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(v) => updateField("name", v)}
              placeholder="Nombre del servicio"
              placeholderTextColor="#C5CDD8"
              autoCapitalize="sentences"
            />
          </View>
          <Text style={styles.helper}>Nombre claro con el que identificarás este servicio. Ejemplos: Consulta general, Limpieza dental, Terapia física.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Descripción</Text>
          <View style={styles.inputRow}>
            <FileText size={16} color="#94A3B8" strokeWidth={2} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.description}
              onChangeText={(v) => updateField("description", v)}
              placeholder="Describe brevemente el servicio"
              placeholderTextColor="#C5CDD8"
              multiline
              textAlignVertical="top"
            />
          </View>
          <Text style={styles.helper}>Detalla qué incluye la consulta o qué puede esperar el paciente durante este servicio.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Duración (min)</Text>
          <View style={styles.inputRow}>
            <Clock size={16} color="#94A3B8" strokeWidth={2} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={form.durationMin}
              onChangeText={(v) => updateField("durationMin", v.replace(/[^0-9]/g, ""))}
              placeholder="30"
              placeholderTextColor="#C5CDD8"
              keyboardType="number-pad"
            />
          </View>
          <Text style={styles.helper}>Duración estimada en minutos. Ejemplos: 30, 45, 60. Se usará para calcular los espacios de cita disponibles.</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, saving && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <CheckCheck size={18} color="#FFFFFF" strokeWidth={2.5} />
          )}
          <Text style={styles.submitText}>{saving ? "Guardando..." : isEditing ? "Actualizar Servicio" : "Crear Servicio"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  headerIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#F0FDF9", justifyContent: "center", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  field: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "600", color: "#64748B", marginBottom: 5, letterSpacing: 0.2 },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: "#E8EDF2", minHeight: 44 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: "#0F172A", fontWeight: "500", paddingVertical: 10 },
  textarea: { height: 72, paddingTop: 10, textAlignVertical: "top" },
  helper: { fontSize: 11, color: "#94A3B8", marginTop: 5, lineHeight: 15, paddingHorizontal: 2 },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#4CB1B1",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: "#4CB1B1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  submitText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
