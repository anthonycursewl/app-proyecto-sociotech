import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View, Alert, ScrollView, Modal, Pressable } from "react-native";
import { Text } from "@/components/common/SText"
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as LucideIcons from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { patientService, CreatePatientData } from "@/shared/services/patient.service";
import { ApiError } from "@/shared/http/http.client";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDER_OPTIONS = ["Masculino", "Femenino", "Otro"];
const CIVIL_STATUS_OPTIONS = ["Soltero", "Casado", "Divorciado", "Viudo", "Unión Libre"];

const CEDULA_LETTERS = ["V", "J", "E"];

interface FormField {
  cedulaLetter: string;
  cedulaNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  occupation: string;
  civilStatus: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodType: string;
  allergies: string;
  currentMedications: string;
  chronicDiseases: string;
}

const emptyForm = (user?: { firstName?: string; lastName?: string; email?: string }): FormField => ({
  cedulaLetter: "V",
  cedulaNumber: "",
  firstName: user?.firstName ?? "",
  lastName: user?.lastName ?? "",
  birthDate: "",
  gender: "",
  phone: "",
  email: user?.email ?? "",
  address: "",
  occupation: "",
  civilStatus: "",
  emergencyContact: "",
  emergencyPhone: "",
  bloodType: "",
  allergies: "",
  currentMedications: "",
  chronicDiseases: "",
});

const toApiDate = (display: string): string => {
  if (!display) return new Date().toISOString().split("T")[0];
  if (display.includes("-")) return display;
  const parts = display.split("/");
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return display;
};

const fromApiDate = (iso: string): string => {
  if (!iso) return "";
  if (iso.includes("/")) return iso;
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const arrayToText = (arr?: string[]): string => (arr && arr.length > 0) ? arr.join(", ") : "";
const textToArray = (text: string): string[] => text.split(",").map(s => s.trim()).filter(Boolean);

export default function PatientEditScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const scrollRef = useRef<ScrollView>(null);
  const [bloodPickerOpen, setBloodPickerOpen] = useState(false);
  const [genderPickerOpen, setGenderPickerOpen] = useState(false);
  const [civilPickerOpen, setCivilPickerOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"create" | "update">("create");
  const [form, setForm] = useState<FormField>(emptyForm(user ?? undefined));

  const updateField = (key: keyof FormField, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  useEffect(() => {
    (async () => {
      try {
        const profile = await patientService.getMyProfile();
        setForm({
          cedulaLetter: "V",
          cedulaNumber: "",
          firstName: user?.firstName ?? "",
          lastName: user?.lastName ?? "",
          birthDate: fromApiDate(profile.dateOfBirth),
          gender: profile.gender ?? "",
          phone: profile.phone ?? "",
          email: user?.email ?? "",
          address: profile.address ?? "",
          occupation: profile.occupation ?? "",
          civilStatus: profile.civilStatus ?? "",
          emergencyContact: profile.emergencyContact ?? "",
          emergencyPhone: profile.emergencyPhone ?? "",
          bloodType: profile.bloodType ?? "",
          allergies: arrayToText(profile.allergies),
          currentMedications: arrayToText(profile.currentMedications),
          chronicDiseases: arrayToText(profile.chronicDiseases),
        });
        setMode("update");
      } catch (err: any) {
        if (err instanceof ApiError && err.status === 404) {
          setMode("create");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        dateOfBirth: toApiDate(form.birthDate),
        phone: form.phone,
        address: form.address,
        emergencyContact: form.emergencyContact,
        emergencyPhone: form.emergencyPhone,
        gender: form.gender || undefined,
        occupation: form.occupation || undefined,
        civilStatus: form.civilStatus || undefined,
        bloodType: form.bloodType || undefined,
        allergies: textToArray(form.allergies),
        currentMedications: textToArray(form.currentMedications),
        chronicDiseases: textToArray(form.chronicDiseases),
      };

      if (mode === "create") {
        await patientService.createMyProfile(payload as CreatePatientData);
      } else {
        await patientService.updateMyProfile(payload);
      }

      Alert.alert("Éxito", "Datos guardados correctamente", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudieron guardar los datos");
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (key: keyof FormField, label: string, icon: React.ReactNode, placeholder: string, opts?: { multiline?: boolean; keyboardType?: "default" | "email-address" | "phone-pad"; autoCapitalize?: "none" | "sentences" | "words" | "characters" }) => (
    <View key={key} style={styles.inputWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldContainer}>
        {icon}
        <TextInput
          style={[styles.fieldInput, opts?.multiline && styles.fieldTextarea]}
          value={form[key]}
          onChangeText={(v) => updateField(key, v)}
          placeholder={placeholder}
          placeholderTextColor="#C5CDD8"
          keyboardType={opts?.keyboardType ?? "default"}
          autoCapitalize={opts?.autoCapitalize ?? "none"}
          multiline={opts?.multiline}
          textAlignVertical={opts?.multiline ? "top" : "center"}
        />
      </View>
    </View>
  );

  const renderPicker = (label: string, value: string, placeholder: string, icon: React.ReactNode, onPress: () => void) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={[styles.fieldContainer, styles.bloodSelector]} onPress={onPress} activeOpacity={0.7}>
        {icon}
        <Text style={[styles.bloodValue, !value && { color: "#C5CDD8" }]}>{value || placeholder}</Text>
        <LucideIcons.ChevronDown size={16} color="#94A3B8" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );

  const renderPickerModal = (visible: boolean, onClose: () => void, title: string, options: string[], onSelect: (v: string) => void) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.bloodPickerSheet} onPress={() => {}}>
          <View style={styles.bloodPickerHandle} />
          <Text style={styles.bloodPickerTitle}>{title}</Text>
          <View style={styles.bloodGrid}>
            {options.map((opt) => {
              const selected = form.gender === opt || form.civilStatus === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.bloodOption, selected && styles.bloodOptionSelected]}
                  onPress={() => { onSelect(opt); onClose(); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.bloodOptionText, selected && styles.bloodOptionTextSelected]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="light" />
        <LinearGradient colors={['#4CB1B1', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.headerGradient} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <LucideIcons.ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Mis Datos</Text>
            <Text style={styles.headerSubtitle}>Cargando...</Text>
          </View>
        </View>
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#4CB1B1" />
        </View>
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
          <Text style={styles.headerTitle}>Mis Datos</Text>
          <Text style={styles.headerSubtitle}>{mode === "create" ? "Registra tus datos por primera vez" : "Actualiza tu información personal"}</Text>
        </View>
      </View>

      <ScrollView ref={scrollRef} style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Información Personal */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LucideIcons.UserCircle size={14} color="#4CB1B1" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Información Personal</Text>
            </View>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                {renderInput("firstName", "Nombre", <LucideIcons.User size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "Tu nombre", { autoCapitalize: "words" })}
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                {renderInput("lastName", "Apellido", <LucideIcons.User size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "Tu apellido", { autoCapitalize: "words" })}
              </View>
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Cédula / RIF</Text>
              <View style={styles.cedulaRow}>
                <TouchableOpacity
                  style={styles.cedulaLetterBtn}
                  onPress={() => {
                    const idx = CEDULA_LETTERS.indexOf(form.cedulaLetter);
                    updateField("cedulaLetter", CEDULA_LETTERS[(idx + 1) % CEDULA_LETTERS.length]);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cedulaLetterText}>{form.cedulaLetter}</Text>
                  <LucideIcons.ChevronDown size={12} color="#4CB1B1" strokeWidth={3} />
                </TouchableOpacity>
                <LucideIcons.Minus size={14} color="#94A3B8" strokeWidth={2} style={{ marginHorizontal: 4 }} />
                <TextInput
                  style={styles.cedulaNumberInput}
                  value={form.cedulaNumber}
                  onChangeText={(v) => updateField("cedulaNumber", v.replace(/[^0-9]/g, "").slice(0, 9))}
                  placeholder="12345678"
                  placeholderTextColor="#C5CDD8"
                  keyboardType="number-pad"
                />
              </View>
            </View>
            {renderInput("birthDate", "Fecha de Nacimiento", <LucideIcons.Cake size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "DD/MM/AAAA")}
            {renderPicker("Género", form.gender, "Seleccionar", <LucideIcons.UserCheck size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, () => setGenderPickerOpen(true))}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                {renderInput("phone", "Teléfono", <LucideIcons.Phone size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "809-555-1234", { keyboardType: "phone-pad" })}
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                {renderInput("email", "Correo electrónico", <LucideIcons.Mail size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "correo@ejemplo.com", { keyboardType: "email-address", autoCapitalize: "none" })}
              </View>
            </View>
            {renderInput("address", "Dirección", <LucideIcons.MapPin size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "Calle Principal #42", { multiline: true })}
          </View>

          {/* Información Adicional */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LucideIcons.Briefcase size={14} color="#4CB1B1" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Información Adicional</Text>
            </View>
            {renderInput("occupation", "Ocupación", <LucideIcons.Briefcase size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "Ingeniero", { autoCapitalize: "sentences" })}
            {renderPicker("Estado Civil", form.civilStatus, "Seleccionar", <LucideIcons.Heart size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, () => setCivilPickerOpen(true))}
          </View>

          {/* Información Médica */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LucideIcons.HeartPulse size={14} color="#4CB1B1" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Información Médica</Text>
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Tipo de Sangre</Text>
              <TouchableOpacity
                style={[styles.fieldContainer, styles.bloodSelector]}
                onPress={() => setBloodPickerOpen(true)}
                activeOpacity={0.7}
              >
                <LucideIcons.Droplets size={16} color="#EF4444" strokeWidth={2} style={styles.fieldIcon} />
                <Text style={[styles.bloodValue, !form.bloodType && { color: "#C5CDD8" }]}>{form.bloodType || "Seleccionar"}</Text>
                <LucideIcons.ChevronDown size={16} color="#94A3B8" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            {renderInput("allergies", "Alergias", <LucideIcons.ShieldAlert size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "Penicilina, Polen", { multiline: true })}
            {renderInput("currentMedications", "Medicamentos Actuales", <LucideIcons.Pill size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "Losartán 50mg", { multiline: true })}
            {renderInput("chronicDiseases", "Enfermedades Crónicas", <LucideIcons.Heart size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "Hipertensión, Asma", { multiline: true })}
          </View>

          {/* Contacto de Emergencia */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LucideIcons.Shield size={14} color="#4CB1B1" strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Contacto de Emergencia</Text>
            </View>
            {renderInput("emergencyContact", "Nombre del Contacto", <LucideIcons.Contact size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "María García", { autoCapitalize: "words" })}
            {renderInput("emergencyPhone", "Teléfono", <LucideIcons.PhoneCall size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "809-555-5678", { keyboardType: "phone-pad" })}
          </View>

          <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <LucideIcons.CheckCheck size={18} color="#FFFFFF" strokeWidth={2.5} />
            )}
            <Text style={styles.saveButtonText}>{saving ? "Guardando..." : mode === "create" ? "Crear Perfil" : "Guardar Cambios"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={bloodPickerOpen} transparent animationType="fade" onRequestClose={() => setBloodPickerOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setBloodPickerOpen(false)}>
          <Pressable style={styles.bloodPickerSheet} onPress={() => {}}>
            <View style={styles.bloodPickerHandle} />
            <Text style={styles.bloodPickerTitle}>Tipo de Sangre</Text>
            <View style={styles.bloodGrid}>
              {BLOOD_TYPES.map((bt) => {
                const selected = form.bloodType === bt;
                return (
                  <TouchableOpacity key={bt} style={[styles.bloodOption, selected && styles.bloodOptionSelected]} onPress={() => { updateField("bloodType", bt); setBloodPickerOpen(false); }} activeOpacity={0.7}>
                    <Text style={[styles.bloodOptionText, selected && styles.bloodOptionTextSelected]}>{bt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {renderPickerModal(genderPickerOpen, () => setGenderPickerOpen(false), "Género", GENDER_OPTIONS, (v) => updateField("gender", v))}
      {renderPickerModal(civilPickerOpen, () => setCivilPickerOpen(false), "Estado Civil", CIVIL_STATUS_OPTIONS, (v) => updateField("civilStatus", v))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  headerGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 105 },

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
    color: "rgba(255,255,255,0.7)",
    marginTop: 1,
  },

  scrollView: { flex: 1 },
  form: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },

  centerLoader: { flex: 1, justifyContent: "center", alignItems: "center" },

  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF2",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: -0.2,
    textTransform: "uppercase",
  },

  row: { flexDirection: "row" },

  cedulaRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8EDF2",
    minHeight: 44,
    paddingRight: 12,
  },
  cedulaLetterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#F0FDF9",
    borderTopLeftRadius: 11,
    borderBottomLeftRadius: 11,
    paddingHorizontal: 14,
    alignSelf: "stretch",
    minWidth: 48,
    justifyContent: "center",
  },
  cedulaLetterText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#4CB1B1",
  },
  cedulaNumberInput: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
    paddingVertical: 10,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E8EDF2",
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
    height: 64,
    paddingTop: 10,
    textAlignVertical: "top",
  },

  bloodSelector: { justifyContent: "space-between" },
  bloodValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: 1,
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
  bloodPickerSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  bloodPickerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginBottom: 20,
  },
  bloodPickerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 20,
  },
  bloodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  bloodOption: {
    width: "46%",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
  },
  bloodOptionSelected: {
    backgroundColor: "#F0FDF9",
    borderColor: "#4CB1B1",
  },
  bloodOptionText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  bloodOptionTextSelected: {
    color: "#4CB1B1",
  },
});
