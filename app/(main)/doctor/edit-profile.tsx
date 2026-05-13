import * as LucideIcons from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { DoctorEditHeader } from "../../../components/doctor/DoctorEditHeader";

const SPECIALTIES = [
  "Medicina General", "Cardiología", "Pediatría", "Odontología",
  "Cirugía General", "Oftalmología", "Dermatología", "Neurología",
  "Ginecología", "Ortopedia", "Psiquiatría", "Urología",
];

export default function DoctorEditProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: "0414-1234567",
    specialty: "Medicina General",
    license: "MED-2024-1234",
    yearsExperience: "5",
    bio: "Médico profesional con experiencia en atención primaria...",
  });

  const updateField = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = () => {
    Alert.alert("Éxito", "Perfil actualizado correctamente");
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="light" />
      <DoctorEditHeader />

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={form.firstName}
              onChangeText={(v) => updateField("firstName", v)}
              placeholder="Tu nombre"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Apellido</Text>
            <TextInput
              style={styles.input}
              value={form.lastName}
              onChangeText={(v) => updateField("lastName", v)}
              placeholder="Tu apellido"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(v) => updateField("email", v)}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={(v) => updateField("phone", v)}
              placeholder="0414-0000000"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Profesional</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Especialidad</Text>
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectText}>{form.specialty}</Text>
              <LucideIcons.ChevronDown size={18} color="#64748B" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número de Licencia</Text>
            <TextInput
              style={styles.input}
              value={form.license}
              onChangeText={(v) => updateField("license", v)}
              placeholder="MED-XXXX-XXXX"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Años de Experiencia</Text>
            <TextInput
              style={styles.input}
              value={form.yearsExperience}
              onChangeText={(v) => updateField("yearsExperience", v)}
              placeholder="5"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Biografía</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.bio}
              onChangeText={(v) => updateField("bio", v)}
              placeholder="Cuéntanos sobre ti..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  form: { padding: 16 },
  section: {
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 16 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#64748B", marginBottom: 6 },
  input: {
    backgroundColor: "#F8FAFC", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: "#0F172A", fontWeight: "500", borderWidth: 1, borderColor: "#F1F5F9",
  },
  textArea: { height: 100, paddingTop: 12 },
  selectButton: {
    backgroundColor: "#F8FAFC", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderWidth: 1, borderColor: "#F1F5F9",
  },
  selectText: { fontSize: 15, color: "#0F172A", fontWeight: "500" },
  saveButton: {
    backgroundColor: "#4CB1B1", borderRadius: 12, paddingVertical: 16,
    alignItems: "center", marginBottom: 40,
    shadowColor: "#4CB1B1", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },
  saveButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
});
