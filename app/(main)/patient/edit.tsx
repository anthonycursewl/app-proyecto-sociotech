import { Briefcase, Cake, CheckCheck, ChevronDown, ChevronLeft, Contact, Droplets, Heart, HeartPulse, Mail, MapPin, Minus, Phone, PhoneCall, Pill, Shield, ShieldAlert, User, UserCheck, UserCircle } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View, Alert, ScrollView, Animated } from "react-native";
import { Text } from "@/components/common/SText"
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomSheetModal } from "@/components/common/BottomSheetModal";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { patientService, CreatePatientData } from "@/shared/services/patient.service";
import { getApiErrorMessage } from "@/shared/errors/apiError";
import { ApiError } from "@/shared/http/http.client";
import { SkeletonLayout } from "@/components/common/Skeleton";

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
  if (parts.length === 3) {
    const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    return `${y}-${parts[1]}-${parts[0]}`;
  }
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

const formatDateInput = (text: string): string => {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  let formatted = "";
  for (let i = 0; i < digits.length; i++) {
    if (i === 2 || i === 4) formatted += "/";
    formatted += digits[i];
  }
  return formatted;
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

export default function PatientEditScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const scrollRef = useRef<ScrollView>(null);
  const [bloodPickerOpen, setBloodPickerOpen] = useState(false);
  const [genderPickerOpen, setGenderPickerOpen] = useState(false);
  const [civilPickerOpen, setCivilPickerOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const skeletonOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"create" | "update">("create");
  const [form, setForm] = useState<FormField>(emptyForm(user ?? undefined));

  useEffect(() => {
    if (!loading && showSkeleton) {
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(skeletonOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(() => setShowSkeleton(false));
    }
  }, [loading, showSkeleton, contentOpacity, skeletonOpacity]);

  const updateField = (key: keyof FormField, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  useEffect(() => {
    (async () => {
      try {
        const profile = await patientService.getMyProfile();
        setForm({
          cedulaLetter: profile.cedula ? profile.cedula.charAt(0) : "V",
          cedulaNumber: profile.cedula ? profile.cedula.replace(/^[A-Z]-?/, "") : "",
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
  }, [user?.firstName, user?.lastName, user?.email]);

  const handleSave = async () => {
    if (!form.cedulaNumber.trim()) {
      Alert.alert("Validación", "La cédula es obligatoria");
      return;
    }
    if (!form.phone.trim()) {
      Alert.alert("Validación", "El teléfono es obligatorio");
      return;
    }
    if (!form.address.trim()) {
      Alert.alert("Validación", "La dirección es obligatoria");
      return;
    }
    if (!form.emergencyContact.trim()) {
      Alert.alert("Validación", "El contacto de emergencia es obligatorio");
      return;
    }
    if (!form.emergencyPhone.trim()) {
      Alert.alert("Validación", "El teléfono de emergencia es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        cedula: `${form.cedulaLetter}-${form.cedulaNumber}`,
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
      Alert.alert("Error", getApiErrorMessage(err) ?? "Error al guardar los datos");
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (key: keyof FormField, label: string, icon: React.ReactNode, placeholder: string, opts?: { multiline?: boolean; keyboardType?: "default" | "email-address" | "phone-pad"; autoCapitalize?: "none" | "sentences" | "words" | "characters"; editable?: boolean; helper?: string }) => (
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
      {opts?.helper && <Text style={styles.fieldHelper}>{opts.helper}</Text>}
    </View>
  );

  const renderPicker = (label: string, value: string, placeholder: string, icon: React.ReactNode, onPress: () => void, helper?: string) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={[styles.fieldContainer, styles.bloodSelector]} onPress={onPress} activeOpacity={0.7}>
        {icon}
        <Text style={[styles.bloodValue, !value && { color: "#C5CDD8" }]}>{value || placeholder}</Text>
        <ChevronDown size={16} color="#94A3B8" strokeWidth={2} />
      </TouchableOpacity>
      {helper && <Text style={styles.fieldHelper}>{helper}</Text>}
    </View>
  );

  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    options: string[],
    onSelect: (v: string) => void,
  ) => (
    <BottomSheetModal visible={visible} onClose={onClose} height={0.45}>
      <View style={styles.bloodPickerHeader}>
        <View style={styles.bloodPickerIcon}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bloodPickerTitle}>{title}</Text>
          <Text style={styles.bloodPickerSubtitle}>{subtitle}</Text>
        </View>
      </View>
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
    </BottomSheetModal>
  );

  if (showSkeleton) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <SkeletonLayout>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={20} color="#0F172A" strokeWidth={2.5} />
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
                  <SkeletonLayout.Block width={70} height={12} borderRadius={6} style={{ marginBottom: 5 }} />
                  <SkeletonLayout.FieldRow style={{ marginBottom: 14 }} />
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
                  <SkeletonLayout.FieldRow />
                </SkeletonLayout.Section>

                <SkeletonLayout.Section>
                  <SkeletonLayout.FieldRow style={{ marginBottom: 14 }} />
                  <SkeletonLayout.Block width={80} height={12} borderRadius={6} style={{ marginBottom: 5 }} />
                  <SkeletonLayout.Block height={80} borderRadius={10} style={{ marginBottom: 14 }} />
                  <SkeletonLayout.FieldRow style={{ marginBottom: 14 }} />
                  <SkeletonLayout.FieldRow />
                </SkeletonLayout.Section>

                <SkeletonLayout.Section>
                  <SkeletonLayout.FieldRow style={{ marginBottom: 14 }} />
                  <SkeletonLayout.FieldRow />
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
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={20} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Mis Datos</Text>
          <Text style={styles.headerSubtitle}>{mode === "create" ? "Registra tus datos por primera vez" : "Actualiza tu información personal"}</Text>
        </View>
      </View>

      <Animated.View style={{ flex: 1, opacity: contentOpacity }}>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        style={{ flex: 1 }}
      >
      <ScrollView ref={scrollRef} style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <FormSection title="Información Personal" icon={UserCircle}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                {renderInput("firstName", "Nombre", <User size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "Tu nombre", { autoCapitalize: "words", editable: false, helper: "Tu nombre tal como aparece en tu documento de identidad. Se toma de tu cuenta y no puede modificarse aquí." })}
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                {renderInput("lastName", "Apellido", <User size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "Tu apellido", { autoCapitalize: "words", editable: false, helper: "Tu apellido legal. Viene de tu cuenta registrada." })}
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
                  <ChevronDown size={12} color="#4CB1B1" strokeWidth={3} />
                </TouchableOpacity>
                <Minus size={14} color="#94A3B8" strokeWidth={2} style={{ marginHorizontal: 4 }} />
                <TextInput
                  style={styles.cedulaNumberInput}
                  value={form.cedulaNumber}
                  onChangeText={(v) => updateField("cedulaNumber", v.replace(/[^0-9]/g, "").slice(0, 9))}
                  placeholder="12345678"
                  placeholderTextColor="#C5CDD8"
                  keyboardType="number-pad"
                />
              </View>
              <Text style={styles.fieldHelper}>Documento nacional de identidad. Toca la letra (V/J/E) para cambiarla. Ingresa solo los 9 dígitos, sin guiones.</Text>
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Fecha de Nacimiento</Text>
              <View style={styles.fieldContainer}>
                <Cake size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />
                <TextInput
                  style={styles.fieldInput}
                  value={form.birthDate}
                  onChangeText={(v) => updateField("birthDate", formatDateInput(v))}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#C5CDD8"
                  keyboardType="number-pad"
                />
              </View>
              <Text style={styles.fieldHelper}>Día, mes y año con 2 dígitos cada uno. Ejemplo: 15/03/1990.</Text>
            </View>
            {renderPicker("Género", form.gender, "Seleccionar", <UserCheck size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, () => setGenderPickerOpen(true), "Opcional. Se usa para personalizar tu atención médica.")}
            {renderInput("phone", "Teléfono", <Phone size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "809-555-1234", { keyboardType: "phone-pad", helper: "Número principal donde el consultorio puede contactarte para confirmar tus citas." })}
            {renderInput("email", "Correo electrónico", <Mail size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "correo@ejemplo.com", { keyboardType: "email-address", autoCapitalize: "none", editable: false, helper: "Correo asociado a tu cuenta. Se utiliza para notificaciones y recuperación de contraseña." })}
            {renderInput("address", "Dirección", <MapPin size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "Calle Principal #42", { multiline: true, helper: "Dirección completa de tu residencia: calle, número, ciudad, sector. Necesaria para visitas y referencias." })}
          </FormSection>

          <FormSection title="Información Adicional" icon={Briefcase}>
            {renderInput("occupation", "Ocupación", <Briefcase size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "Ingeniero", { autoCapitalize: "sentences", helper: "Opcional. Tu profesión o actividad principal. Puede ayudar al doctor a entender tu estilo de vida." })}
            {renderPicker("Estado Civil", form.civilStatus, "Seleccionar", <Heart size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, () => setCivilPickerOpen(true), "Opcional. Se usa únicamente con fines médicos y administrativos.")}
          </FormSection>

          <FormSection title="Información Médica" icon={HeartPulse}>
            <View style={styles.inputWrapper}>
              <Text style={styles.fieldLabel}>Tipo de Sangre</Text>
              <TouchableOpacity
                style={[styles.fieldContainer, styles.bloodSelector]}
                onPress={() => setBloodPickerOpen(true)}
                activeOpacity={0.7}
              >
                <Droplets size={16} color="#EF4444" strokeWidth={2} style={styles.fieldIcon} />
                <Text style={[styles.bloodValue, !form.bloodType && { color: "#C5CDD8" }]}>{form.bloodType || "Seleccionar"}</Text>
                <ChevronDown size={16} color="#94A3B8" strokeWidth={2} />
              </TouchableOpacity>
              <Text style={styles.fieldHelper}>Opcional pero importante en emergencias. Busca esta información en tu documento o análisis previos.</Text>
            </View>
            {renderInput("allergies", "Alergias", <ShieldAlert size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "Penicilina, Polen", { multiline: true, helper: "Lista alergias conocidas separadas por comas. Incluye medicamentos, alimentos, látex, etc. Déjalo vacío si no tienes." })}
            {renderInput("currentMedications", "Medicamentos Actuales", <Pill size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "Losartán 50mg", { multiline: true, helper: "Medicamentos que tomas actualmente, separados por comas. Incluye nombre y dosis (ej. Losartán 50mg). Déjalo vacío si no tomas ninguno." })}
            {renderInput("chronicDiseases", "Enfermedades Crónicas", <Heart size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "Hipertensión, Asma", { multiline: true, helper: "Condiciones médicas crónicas diagnosticadas, separadas por comas (ej. Hipertensión, Diabetes). Déjalo vacío si no aplica." })}
          </FormSection>

          <FormSection title="Contacto de Emergencia" icon={Shield}>
            {renderInput("emergencyContact", "Nombre del Contacto", <Contact size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "María García", { autoCapitalize: "words", helper: "Nombre completo de un familiar o amigo cercano a quien llamar en caso de emergencia." })}
            {renderInput("emergencyPhone", "Teléfono", <PhoneCall size={16} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />, "809-555-5678", { keyboardType: "phone-pad", helper: "Número de teléfono del contacto de emergencia. Debe ser diferente al tuyo." })}
          </FormSection>

          <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <CheckCheck size={18} color="#FFFFFF" strokeWidth={2.5} />
            )}
            <Text style={styles.saveButtonText}>{saving ? "Guardando..." : mode === "create" ? "Crear Perfil" : "Guardar Cambios"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
      </Animated.View>

      <BottomSheetModal visible={bloodPickerOpen} onClose={() => setBloodPickerOpen(false)} height={0.45}>
        <View style={styles.bloodPickerHeader}>
          <View style={styles.bloodPickerIcon}>
            <Droplets size={18} color="#EF4444" strokeWidth={2.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bloodPickerTitle}>Tipo de Sangre</Text>
            <Text style={styles.bloodPickerSubtitle}>Información importante para emergencias</Text>
          </View>
        </View>
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
      </BottomSheetModal>

      {renderPickerModal(
        genderPickerOpen,
        () => setGenderPickerOpen(false),
        "Género",
        "Selecciona cómo prefieres identificarte",
        <UserCheck size={18} color="#0D9488" strokeWidth={2.5} />,
        GENDER_OPTIONS,
        (v) => updateField("gender", v),
      )}
      {renderPickerModal(
        civilPickerOpen,
        () => setCivilPickerOpen(false),
        "Estado Civil",
        "Información opcional con fines administrativos",
        <Heart size={18} color="#0D9488" strokeWidth={2.5} />,
        CIVIL_STATUS_OPTIONS,
        (v) => updateField("civilStatus", v),
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
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
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  headerTextWrap: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },

  scrollView: { flex: 1 },
  form: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32, gap: 0 },

  centerLoader: { flex: 1, justifyContent: "center", alignItems: "center" },

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

  row: { flexDirection: "row" },

  cedulaRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
  fieldHelper: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
    lineHeight: 15,
    paddingHorizontal: 2,
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

  bloodPickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  bloodPickerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F0FDF9",
    justifyContent: "center",
    alignItems: "center",
  },
  bloodPickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  bloodPickerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  bloodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  bloodOption: {
    flexBasis: "47%",
    flexGrow: 1,
    minWidth: 90,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#EEF2F6",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  bloodOptionSelected: {
    backgroundColor: "#F0FDF9",
    borderColor: "#4CB1B1",
    borderWidth: 1.5,
  },
  bloodOptionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 0.3,
  },
  bloodOptionTextSelected: {
    color: "#0F766E",
  },
});
