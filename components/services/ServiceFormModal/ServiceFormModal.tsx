import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { serviceService } from "@/shared/services/service.service";
import { ServiceData } from "@/components/services/ServiceCard";
import * as LucideIcons from "lucide-react-native";

interface ServiceFormData {
  name: string;
  description: string;
  durationMin: string;
  price: string;
}

interface ServiceFormModalProps {
  visible: boolean;
  editingService?: ServiceData | null;
  onClose: () => void;
  onSaved: () => void;
}

export const ServiceFormModal = ({ visible, editingService, onClose, onSaved }: ServiceFormModalProps) => {
  const isEditing = !!editingService;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ServiceFormData>({
    name: "",
    description: "",
    durationMin: "",
    price: "",
  });

  useEffect(() => {
    if (editingService) {
      setForm({
        name: editingService.name,
        description: editingService.description ?? "",
        durationMin: String(editingService.durationMin),
        price: editingService.price != null ? String(editingService.price) : "",
      });
    } else {
      setForm({ name: "", description: "", durationMin: "", price: "" });
    }
  }, [editingService, visible]);

  const updateField = (key: keyof ServiceFormData, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
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
        price: form.price ? parseFloat(form.price) : undefined,
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              {isEditing ? (
                <LucideIcons.Edit3 size={18} color="#4CB1B1" strokeWidth={2.5} />
              ) : (
                <LucideIcons.Plus size={18} color="#4CB1B1" strokeWidth={2.5} />
              )}
            </View>
            <Text style={styles.title}>{isEditing ? "Editar Servicio" : "Nuevo Servicio"}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nombre *</Text>
            <View style={styles.inputRow}>
              <LucideIcons.Tag size={16} color="#94A3B8" strokeWidth={2} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(v) => updateField("name", v)}
                placeholder="Nombre del servicio"
                placeholderTextColor="#C5CDD8"
                autoCapitalize="sentences"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Descripción</Text>
            <View style={styles.inputRow}>
              <LucideIcons.FileText size={16} color="#94A3B8" strokeWidth={2} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textarea]}
                value={form.description}
                onChangeText={(v) => updateField("description", v)}
                placeholder="Descripción del servicio"
                placeholderTextColor="#C5CDD8"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Duración (min)</Text>
              <View style={styles.inputRow}>
                <LucideIcons.Clock size={16} color="#94A3B8" strokeWidth={2} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.durationMin}
                  onChangeText={(v) => updateField("durationMin", v.replace(/[^0-9]/g, ""))}
                  placeholder="30"
                  placeholderTextColor="#C5CDD8"
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Precio ($)</Text>
              <View style={styles.inputRow}>
                <LucideIcons.DollarSign size={16} color="#94A3B8" strokeWidth={2} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.price}
                  onChangeText={(v) => updateField("price", v.replace(/[^0-9.]/g, ""))}
                  placeholder="0.00"
                  placeholderTextColor="#C5CDD8"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity style={[styles.submitButton, saving && { opacity: 0.7 }]} onPress={handleSubmit} disabled={saving} activeOpacity={0.85}>
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <LucideIcons.CheckCheck size={18} color="#FFFFFF" strokeWidth={2.5} />
            )}
            <Text style={styles.submitText}>{saving ? "Guardando..." : isEditing ? "Actualizar Servicio" : "Crear Servicio"}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40, maxHeight: "90%" },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0", alignSelf: "center", marginBottom: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 24 },
  headerIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#F0FDF9", justifyContent: "center", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "600", color: "#64748B", marginBottom: 5, letterSpacing: 0.2 },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: "#E8EDF2", minHeight: 44 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: "#0F172A", fontWeight: "500", paddingVertical: 10 },
  textarea: { height: 72, paddingTop: 10, textAlignVertical: "top" },
  row: { flexDirection: "row" },
  submitButton: { flexDirection: "row", backgroundColor: "#4CB1B1", borderRadius: 14, paddingVertical: 15, alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8, shadowColor: "#4CB1B1", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 5 },
  submitText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
