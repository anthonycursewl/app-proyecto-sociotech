import React from "react";
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { BottomSheetModal } from "@/components/common/BottomSheetModal";
import type { AuditActionFilter, AuditResourceFilter, AuditResultFilter } from "@/shared/entities/AuditLog";
import { colors } from "@/shared/theme/colors";

const ACTION_FILTERS: { label: string; value: AuditActionFilter }[] = [
  { label: "Todas", value: "all" },
  { label: "Usuarios", value: "users:create" },
  { label: "Roles", value: "roles:create" },
  { label: "Pacientes", value: "patients:create" },
  { label: "Doctores", value: "doctors:create" },
  { label: "Citas", value: "appointments:create" },
  { label: "Cancelar cita", value: "appointments:cancel" },
  { label: "Historial", value: "medical-records:create" },
  { label: "Firmar", value: "medical-records:sign" },
  { label: "PDF", value: "pdf:prescription" },
];

const RESOURCE_FILTERS: { label: string; value: AuditResourceFilter }[] = [
  { label: "Todos", value: "all" },
  { label: "Usuarios", value: "User" },
  { label: "Pacientes", value: "Patient" },
  { label: "Doctores", value: "Doctor" },
  { label: "Horarios", value: "DoctorSchedule" },
  { label: "Citas", value: "Appointment" },
  { label: "Historial", value: "MedicalRecord" },
  { label: "Servicios", value: "Service" },
  { label: "Roles", value: "Role" },
];

const RESULT_FILTERS: { label: string; value: AuditResultFilter }[] = [
  { label: "Todos", value: "all" },
  { label: "Éxito", value: "success" },
  { label: "Fallos", value: "failure" },
];

const DATE_PRESETS: { label: string; getRange: () => { from: string; to: string } }[] = [
  {
    label: "Hoy",
    getRange: () => {
      const d = new Date();
      const s = d.toISOString().slice(0, 10);
      return { from: s, to: s };
    },
  },
  {
    label: "Últimos 7 días",
    getRange: () => {
      const to = new Date();
      const from = new Date(to);
      from.setDate(from.getDate() - 7);
      return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
    },
  },
  {
    label: "Últimos 30 días",
    getRange: () => {
      const to = new Date();
      const from = new Date(to);
      from.setDate(from.getDate() - 30);
      return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
    },
  },
  {
    label: "Este mes",
    getRange: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const to = now;
      return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
    },
  },
  {
    label: "Mes pasado",
    getRange: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
    },
  },
];

interface AuditFilterModalProps {
  visible: boolean;
  onClose: () => void;
  actionFilter: AuditActionFilter;
  resourceFilter: AuditResourceFilter;
  resultFilter: AuditResultFilter;
  userId: string;
  resourceId: string;
  from: string;
  to: string;
  onActionFilterChange: (filter: AuditActionFilter) => void;
  onResourceFilterChange: (filter: AuditResourceFilter) => void;
  onResultFilterChange: (filter: AuditResultFilter) => void;
  onUserIdChange: (value: string) => void;
  onResourceIdChange: (value: string) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onClearFilters: () => void;
}

export const AuditFilterModal = ({
  visible,
  onClose,
  actionFilter,
  resourceFilter,
  resultFilter,
  userId,
  resourceId,
  from,
  to,
  onActionFilterChange,
  onResourceFilterChange,
  onResultFilterChange,
  onUserIdChange,
  onResourceIdChange,
  onFromChange,
  onToChange,
  onClearFilters,
}: AuditFilterModalProps) => {
  const hasActiveFilter = actionFilter !== "all" || resourceFilter !== "all" || resultFilter !== "all"
    || !!userId || !!resourceId || !!from || !!to;

  const handleDatePreset = (getRange: () => { from: string; to: string }) => {
    const { from: f, to: t } = getRange();
    onFromChange(f);
    onToChange(t);
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} height={0.85}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Filtros</Text>
          {hasActiveFilter && (
            <TouchableOpacity onPress={onClearFilters} style={styles.clearAllBtn}>
              <Text style={styles.clearAllText}>Limpiar todo</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>Acción</Text>
          <View style={styles.chipsWrap}>
            {ACTION_FILTERS.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[styles.chip, actionFilter === f.value && styles.chipActive]}
                onPress={() => onActionFilterChange(f.value)}
              >
                <Text style={[styles.chipText, actionFilter === f.value && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Recurso</Text>
          <View style={styles.chipsWrap}>
            {RESOURCE_FILTERS.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[styles.chip, resourceFilter === f.value && styles.chipActive]}
                onPress={() => onResourceFilterChange(f.value)}
              >
                <Text style={[styles.chipText, resourceFilter === f.value && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Resultado</Text>
          <View style={styles.chipsWrap}>
            {RESULT_FILTERS.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[styles.chip, resultFilter === f.value && styles.chipActive]}
                onPress={() => onResultFilterChange(f.value)}
              >
                <Text style={[styles.chipText, resultFilter === f.value && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Búsqueda avanzada</Text>

          <TextInput
            style={styles.textInput}
            placeholder="User ID (UUID)"
            placeholderTextColor={colors.textMuted}
            value={userId}
            onChangeText={onUserIdChange}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.textInput}
            placeholder="Resource ID (UUID)"
            placeholderTextColor={colors.textMuted}
            value={resourceId}
            onChangeText={onResourceIdChange}
            autoCapitalize="none"
          />

          <Text style={styles.sectionLabel}>Rango de fechas</Text>
          <View style={styles.datePresetsRow}>
            {DATE_PRESETS.map((preset, i) => (
              <TouchableOpacity
                key={i}
                style={styles.datePresetChip}
                onPress={() => handleDatePreset(preset.getRange)}
              >
                <Text style={styles.datePresetText}>{preset.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.dateInputsRow}>
            <View style={styles.dateInputWrap}>
              <Text style={styles.dateInputLabel}>Desde</Text>
              <TextInput
                style={styles.textInput}
                placeholder="2026-06-01"
                placeholderTextColor={colors.textMuted}
                value={from}
                onChangeText={onFromChange}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.dateInputWrap}>
              <Text style={styles.dateInputLabel}>Hasta</Text>
              <TextInput
                style={styles.textInput}
                placeholder="2026-06-30"
                placeholderTextColor={colors.textMuted}
                value={to}
                onChangeText={onToChange}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  clearAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "#FEE2E2" },
  clearAllText: { fontSize: 12, fontWeight: "700", color: "#EF4444" },
  scroll: { flex: 1 },
  sectionLabel: {
    fontSize: 12, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginTop: 16,
  },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  chipTextActive: { color: "#FFFFFF" },
  textInput: {
    backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 14, height: 44,
    fontSize: 14, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, marginTop: 8,
  },
  datePresetsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  datePresetChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: colors.accent + "12", borderWidth: 1, borderColor: colors.accent + "30",
  },
  datePresetText: { fontSize: 12, fontWeight: "600", color: colors.accent },
  dateInputsRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  dateInputWrap: { flex: 1 },
  dateInputLabel: { fontSize: 11, fontWeight: "600", color: colors.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
});
