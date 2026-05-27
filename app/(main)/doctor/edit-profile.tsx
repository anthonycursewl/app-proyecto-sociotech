import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View, Alert, ScrollView, Modal, Pressable, Animated, Switch } from "react-native";
import { Text } from "@/components/common/SText"
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as LucideIcons from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { doctorService, CreateDoctorData, DoctorSchedule as ScheduleType } from "@/shared/services/doctor.service";
import { getApiErrorMessage } from "@/shared/errors/apiError";
import { ApiError } from "@/shared/http/http.client";
import { SkeletonLayout } from "@/components/common/Skeleton";

const SPECIALTIES = [
  "Medicina General", "Cardiología", "Pediatría", "Odontología",
  "Cirugía General", "Oftalmología", "Dermatología", "Neurología",
  "Ginecología", "Ortopedia", "Psiquiatría", "Urología",
  "Medicina Interna", "Anestesiología", "Radiología", "Traumatología",
];

const DAY_LABELS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  specialty: string;
  licenseNumber: string;
  consultationPrice: string;
  biography: string;
}

interface ScheduleForm {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const emptyProfileForm = (user?: { firstName?: string; lastName?: string; email?: string }): ProfileForm => ({
  firstName: user?.firstName ?? "",
  lastName: user?.lastName ?? "",
  email: user?.email ?? "",
  phoneNumber: "",
  specialty: "",
  licenseNumber: "",
  consultationPrice: "",
  biography: "",
});

const emptyScheduleForm = (): ScheduleForm => ({
  dayOfWeek: 1,
  startTime: "08:00",
  endTime: "12:00",
});

const formatTimeInput = (text: string): string => {
  const digits = text.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

const formatPriceInput = (text: string): string => {
  const cleaned = text.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 2) return parts[0] + "." + parts.slice(1).join("");
  if (parts.length === 2 && parts[1].length > 2) return parts[0] + "." + parts[1].slice(0, 2);
  return cleaned;
};

type SectionIcon = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: SectionIcon;
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

export default function DoctorEditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const scrollRef = useRef<ScrollView>(null);
  const [specialtyPickerOpen, setSpecialtyPickerOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleType | null>(null);

  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const skeletonOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"create" | "update">("create");
  const [form, setForm] = useState<ProfileForm>(emptyProfileForm(user ?? undefined));
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>(emptyScheduleForm());
  const [savingSchedule, setSavingSchedule] = useState(false);

  useEffect(() => {
    if (!loading && showSkeleton) {
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(skeletonOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(() => setShowSkeleton(false));
    }
  }, [loading, showSkeleton, contentOpacity, skeletonOpacity]);

  const updateField = (key: keyof ProfileForm, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  useEffect(() => {
    (async () => {
      let profileFound = false;
      try {
        const profile = await doctorService.getMyProfile();
        setForm({
          firstName: user?.firstName ?? "",
          lastName: user?.lastName ?? "",
          email: user?.email ?? "",
          phoneNumber: profile.phoneNumber ?? "",
          specialty: profile.specialty ?? "",
          licenseNumber: profile.licenseNumber ?? "",
          consultationPrice: profile.consultationPrice?.toFixed(2) ?? "",
          biography: profile.biography ?? "",
        });
        setMode("update");
        profileFound = true;
      } catch (err: any) {
        if (err instanceof ApiError && err.status === 403) {
          setMode("create");
        }
      }

      try {
        const schedulesData = await doctorService.listMySchedules();
        setSchedules(schedulesData);
      } catch {
        if (!profileFound) setMode("create");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSaveProfile = async () => {
    if (mode === "create") {
      if (!form.consultationPrice) {
        Alert.alert("Validación", "El precio de la consulta es obligatorio");
        return;
      }
      if (!form.biography.trim()) {
        Alert.alert("Validación", "La biografía es obligatoria");
        return;
      }
      if (!form.phoneNumber.trim()) {
        Alert.alert("Validación", "El teléfono es obligatorio");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        specialty: form.specialty || undefined,
        licenseNumber: form.licenseNumber || undefined,
        consultationPrice: form.consultationPrice ? parseFloat(form.consultationPrice) : undefined,
        biography: form.biography || undefined,
        phoneNumber: form.phoneNumber || undefined,
      };

      if (mode === "create") {
        await doctorService.createMyProfile(payload as CreateDoctorData);
      } else {
        await doctorService.updateMyProfile(payload);
      }

      Alert.alert("Éxito", "Perfil guardado correctamente", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert("Error", getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setScheduleForm(emptyScheduleForm());
    setScheduleModalOpen(true);
  };

  const handleEditSchedule = (schedule: ScheduleType) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
    setScheduleModalOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!scheduleForm.startTime || !scheduleForm.endTime) {
      Alert.alert("Validación", "Las horas de inicio y fin son obligatorias");
      return;
    }

    setSavingSchedule(true);
    try {
      if (editingSchedule) {
        const updated = await doctorService.updateSchedule(editingSchedule.id, {
          startTime: scheduleForm.startTime,
          endTime: scheduleForm.endTime,
          isActive: editingSchedule.isActive,
        });
        setSchedules(prev => prev.map(s => s.id === updated.id ? updated : s));
      } else {
        const created = await doctorService.createSchedule({
          dayOfWeek: scheduleForm.dayOfWeek,
          startTime: scheduleForm.startTime,
          endTime: scheduleForm.endTime,
        });
        setSchedules(prev => [...prev, created]);
      }
      setScheduleModalOpen(false);
    } catch (err: any) {
      Alert.alert("Error", getApiErrorMessage(err));
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleDeleteSchedule = (schedule: ScheduleType) => {
    Alert.alert(
      "Eliminar horario",
      `¿Eliminar horario de ${DAY_LABELS[schedule.dayOfWeek]}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await doctorService.deleteSchedule(schedule.id);
              setSchedules(prev => prev.filter(s => s.id !== schedule.id));
            } catch (err: any) {
              Alert.alert("Error", getApiErrorMessage(err));
            }
          },
        },
      ]
    );
  };

  const handleToggleScheduleActive = async (schedule: ScheduleType) => {
    try {
      const updated = await doctorService.updateSchedule(schedule.id, {
        isActive: !schedule.isActive,
      });
      setSchedules(prev => prev.map(s => s.id === updated.id ? updated : s));
    } catch (err: any) {
      Alert.alert("Error", getApiErrorMessage(err));
    }
  };

  const renderInput = (key: keyof ProfileForm, label: string, icon: React.ReactNode, placeholder: string, opts?: { multiline?: boolean; keyboardType?: "default" | "email-address" | "phone-pad" | "decimal-pad" | "number-pad"; autoCapitalize?: "none" | "sentences" | "words" | "characters"; editable?: boolean }) => (
    <View key={key} style={styles.inputWrapper}>
      <Text style={[styles.fieldLabel, opts?.editable === false && { color: "#94A3B8" }]}>{label}</Text>
      <View style={[styles.fieldContainer, opts?.editable === false && { backgroundColor: "#F1F5F9" }]}>
        {icon}
        <TextInput
          style={[styles.fieldInput, opts?.multiline && styles.fieldTextarea, opts?.editable === false && { color: "#64748B" }]}
          value={form[key]}
          onChangeText={(v) => updateField(key, v)}
          placeholder={placeholder}
          placeholderTextColor="#C5CDD8"
          keyboardType={opts?.keyboardType ?? "default"}
          autoCapitalize={opts?.autoCapitalize ?? "none"}
          multiline={opts?.multiline}
          textAlignVertical={opts?.multiline ? "top" : "center"}
          editable={opts?.editable}
        />
      </View>
    </View>
  );

  const renderPicker = (label: string, value: string, placeholder: string, icon: React.ReactNode, onPress: () => void) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={[styles.fieldContainer, styles.pickerSelector]} onPress={onPress} activeOpacity={0.7}>
        {icon}
        <Text style={[styles.pickerValue, !value && { color: "#C5CDD8" }]}>{value || placeholder}</Text>
        <LucideIcons.ChevronDown size={16} color="#94A3B8" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );

  if (showSkeleton) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="light" />
        <LinearGradient colors={['#4CB1B1', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.headerGradient} />
        <SkeletonLayout>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <LucideIcons.ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <SkeletonLayout.Block width={140} height={18} borderRadius={9} />
            <View style={{ height: 4 }} />
            <SkeletonLayout.Block width={200} height={12} borderRadius={6} />
          </View>
        </View>
        <Animated.View style={{ flex: 1, opacity: skeletonOpacity }}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
                <SkeletonLayout.Section>
                  <SkeletonLayout.FieldRow columns={2} style={{ marginBottom: 14 }} />
                  <SkeletonLayout.Block width={120} height={12} borderRadius={6} style={{ marginBottom: 5 }} />
                  <SkeletonLayout.FieldRow style={{ marginBottom: 14 }} />
                  <SkeletonLayout.Block width={60} height={12} borderRadius={6} style={{ marginBottom: 5 }} />
                  <SkeletonLayout.Block height={44} borderRadius={10} style={{ marginBottom: 14 }} />
                  <SkeletonLayout.FieldRow style={{ marginBottom: 14 }} />
                  <SkeletonLayout.Block width={140} height={12} borderRadius={6} style={{ marginBottom: 5 }} />
                  <SkeletonLayout.Block height={44} borderRadius={10} style={{ marginBottom: 14 }} />
                  <SkeletonLayout.Block width={90} height={12} borderRadius={6} style={{ marginBottom: 5 }} />
                  <SkeletonLayout.Block height={80} borderRadius={10} />
                </SkeletonLayout.Section>

                <SkeletonLayout.Section>
                  <SkeletonLayout.FieldRow style={{ marginBottom: 14 }} />
                  <SkeletonLayout.Block width={70} height={12} borderRadius={6} style={{ marginBottom: 5 }} />
                  <SkeletonLayout.Block height={44} borderRadius={10} style={{ marginBottom: 14 }} />
                  <SkeletonLayout.FieldRow style={{ marginBottom: 14 }} />
                  <SkeletonLayout.FieldRow style={{ marginBottom: 14 }} />
                  <SkeletonLayout.Block width={80} height={12} borderRadius={6} style={{ marginBottom: 5 }} />
                  <SkeletonLayout.Block height={100} borderRadius={10} />
                </SkeletonLayout.Section>

                <SkeletonLayout.Section>
                  <SkeletonLayout.Block width={100} height={18} borderRadius={9} style={{ marginBottom: 12 }} />
                  <SkeletonLayout.Block height={56} borderRadius={12} style={{ marginBottom: 8 }} />
                  <SkeletonLayout.Block height={56} borderRadius={12} style={{ marginBottom: 8 }} />
                  <SkeletonLayout.Block height={44} borderRadius={10} />
                </SkeletonLayout.Section>
            </View>
          </ScrollView>
        </Animated.View>
        </SkeletonLayout>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#4CB1B1', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
      />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <LucideIcons.ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Mi Perfil Doctor</Text>
          <Text style={styles.headerSubtitle}>{mode === "create" ? "Completa tu perfil profesional" : "Actualiza tu información profesional"}</Text>
        </View>
      </View>

      <Animated.View style={{ flex: 1, opacity: contentOpacity }}>
      <ScrollView ref={scrollRef} style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <FormSection title="Información Personal" icon={LucideIcons.UserCircle}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                {renderInput("firstName", "Nombre", <LucideIcons.User size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "Tu nombre", { autoCapitalize: "words", editable: false })}
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                {renderInput("lastName", "Apellido", <LucideIcons.User size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "Tu apellido", { autoCapitalize: "words", editable: false })}
              </View>
            </View>
            {renderInput("phoneNumber", "Teléfono", <LucideIcons.Phone size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "+584141234567", { keyboardType: "phone-pad" })}
            {renderInput("email", "Correo electrónico", <LucideIcons.Mail size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "correo@ejemplo.com", { keyboardType: "email-address", autoCapitalize: "none", editable: false })}
          </FormSection>

          <FormSection title="Información Profesional" icon={LucideIcons.Stethoscope}>
            {renderPicker("Especialidad", form.specialty, "Seleccionar especialidad", <LucideIcons.Stethoscope size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, () => setSpecialtyPickerOpen(true))}
            {renderInput("licenseNumber", "Número de Licencia", <LucideIcons.IdCard size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "LIC-XXXXX")}
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Precio de Consulta ($)</Text>
              <View style={styles.fieldContainer}>
                <LucideIcons.DollarSign size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />
                <TextInput
                  style={styles.fieldInput}
                  value={form.consultationPrice}
                  onChangeText={(v) => updateField("consultationPrice", formatPriceInput(v))}
                  placeholder="150.00"
                  placeholderTextColor="#C5CDD8"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            {renderInput("biography", "Biografía", <LucideIcons.FileText size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "Cuéntanos sobre tu experiencia profesional...", { multiline: true })}
          </FormSection>

          <FormSection title="Horarios" icon={LucideIcons.Clock}>
            {schedules.length === 0 && !loading && (
              <Text style={styles.emptyText}>No has configurado horarios aún</Text>
            )}
            {schedules.map((schedule) => (
              <View key={schedule.id} style={styles.scheduleCard}>
                <View style={styles.scheduleLeft}>
                  <Text style={styles.scheduleDay}>{DAY_LABELS[schedule.dayOfWeek]}</Text>
                  <Text style={styles.scheduleTime}>{schedule.startTime} - {schedule.endTime}</Text>
                </View>
                <View style={styles.scheduleActions}>
                  <Switch
                    value={schedule.isActive}
                    onValueChange={() => handleToggleScheduleActive(schedule)}
                    trackColor={{ false: "#E2E8F0", true: "#A7F3D0" }}
                    thumbColor={schedule.isActive ? "#4CB1B1" : "#CBD5E1"}
                  />
                  <TouchableOpacity onPress={() => handleEditSchedule(schedule)} style={styles.scheduleEditBtn} activeOpacity={0.7}>
                    <LucideIcons.Pencil size={16} color="#94A3B8" strokeWidth={2} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteSchedule(schedule)} style={styles.scheduleDeleteBtn} activeOpacity={0.7}>
                    <LucideIcons.Trash2 size={16} color="#EF4444" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addScheduleBtn} onPress={handleAddSchedule} activeOpacity={0.7}>
              <LucideIcons.Plus size={18} color="#4CB1B1" strokeWidth={2.5} />
              <Text style={styles.addScheduleText}>Agregar Horario</Text>
            </TouchableOpacity>
          </FormSection>

          <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.7 }]} onPress={handleSaveProfile} disabled={saving} activeOpacity={0.85}>
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <LucideIcons.CheckCheck size={18} color="#FFFFFF" strokeWidth={2.5} />
            )}
            <Text style={styles.saveButtonText}>{saving ? "Guardando..." : mode === "create" ? "Crear Perfil" : "Guardar Cambios"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </Animated.View>

      <Modal visible={specialtyPickerOpen} transparent animationType="fade" onRequestClose={() => setSpecialtyPickerOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSpecialtyPickerOpen(false)}>
          <Pressable style={styles.pickerSheet} onPress={() => {}}>
            <View style={styles.pickerHandle} />
            <Text style={styles.pickerTitle}>Especialidad</Text>
            <View style={styles.pickerGrid}>
              {SPECIALTIES.map((spec) => {
                const selected = form.specialty === spec;
                return (
                  <TouchableOpacity key={spec} style={[styles.pickerOption, selected && styles.pickerOptionSelected]} onPress={() => { updateField("specialty", spec); setSpecialtyPickerOpen(false); }} activeOpacity={0.7}>
                    <Text style={[styles.pickerOptionText, selected && styles.pickerOptionTextSelected]}>{spec}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={scheduleModalOpen} transparent animationType="fade" onRequestClose={() => setScheduleModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setScheduleModalOpen(false)}>
          <Pressable style={styles.pickerSheet} onPress={() => {}}>
            <View style={styles.pickerHandle} />
            <Text style={styles.pickerTitle}>{editingSchedule ? "Editar Horario" : "Agregar Horario"}</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Día de la Semana</Text>
              <View style={styles.dayGrid}>
                {DAY_LABELS.map((label, idx) => {
                  const selected = scheduleForm.dayOfWeek === idx;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.dayOption, selected && styles.dayOptionSelected]}
                      onPress={() => setScheduleForm(prev => ({ ...prev, dayOfWeek: idx }))}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dayOptionText, selected && styles.dayOptionTextSelected]}>
                        {label.slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.fieldLabel}>Hora Inicio</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={scheduleForm.startTime}
                    onChangeText={(v) => setScheduleForm(prev => ({ ...prev, startTime: formatTimeInput(v) }))}
                    placeholder="08:00"
                    placeholderTextColor="#C5CDD8"
                    keyboardType="number-pad"
                  />
                </View>
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.fieldLabel}>Hora Fin</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={scheduleForm.endTime}
                    onChangeText={(v) => setScheduleForm(prev => ({ ...prev, endTime: formatTimeInput(v) }))}
                    placeholder="12:00"
                    placeholderTextColor="#C5CDD8"
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, savingSchedule && { opacity: 0.7 }, { marginTop: 8 }]}
              onPress={handleSaveSchedule}
              disabled={savingSchedule}
              activeOpacity={0.85}
            >
              {savingSchedule ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <LucideIcons.CheckCheck size={18} color="#FFFFFF" strokeWidth={2.5} />
              )}
              <Text style={styles.saveButtonText}>{savingSchedule ? "Guardando..." : editingSchedule ? "Actualizar Horario" : "Crear Horario"}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  headerGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 140 },

  header: {
    position: "relative",
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTextWrap: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginTop: 1,
  },

  scrollView: { flex: 1 },
  form: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32, gap: 0 },

  row: { flexDirection: "row" },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },

  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    paddingVertical: 16,
  },

  inputWrapper: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 44,
  },
  fieldIcon: { marginRight: 8 },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
    paddingVertical: 10,
    paddingRight: 6,
  },
  fieldTextarea: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: "top",
  },

  pickerSelector: { justifyContent: "space-between" },
  pickerValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#0F172A",
  },

  scheduleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  scheduleLeft: {
    flex: 1,
  },
  scheduleDay: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  scheduleTime: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 2,
  },
  scheduleActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scheduleEditBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  addScheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    marginTop: 4,
  },
  addScheduleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CB1B1",
  },

  saveButton: {
    flexDirection: "row",
    backgroundColor: "#4CB1B1",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    shadowColor: "#4CB1B1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  pickerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 20,
  },
  pickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  pickerOption: {
    width: "46%",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
  },
  pickerOptionSelected: {
    backgroundColor: "#F0FDF9",
    borderColor: "#4CB1B1",
  },
  pickerOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  pickerOptionTextSelected: {
    color: "#4CB1B1",
  },

  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  dayOption: {
    width: "13.3%",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  dayOptionSelected: {
    backgroundColor: "#F0FDF9",
    borderColor: "#4CB1B1",
  },
  dayOptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  dayOptionTextSelected: {
    color: "#4CB1B1",
  },

  timeInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "500",
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    textAlign: "center",
  },
});
