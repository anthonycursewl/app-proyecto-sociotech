import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as LucideIcons from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";

export default function PatientEditScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: "0414-1234567",
    cedula: "V-30.123.456",
    birthDate: "15/03/1990",
    address: "Calle 123, Caracas",
    emergencyContact: "María García",
    emergencyPhone: "0414-9876543",
    bloodType: "O+",
    allergies: "Ninguna",
    chronicConditions: "Ninguna",
  });

  const updateField = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = () => {
    Alert.alert("Éxito", "Datos actualizados correctamente", [
      { text: "OK", onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <LinearGradient
          colors={['#4CB1B1', '#3A9A9A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        />
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <LucideIcons.ChevronLeft size={22} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Mis Datos</Text>
            <Text style={styles.headerSubtitle}>Actualiza tu información personal</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Personal</Text>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  value={form.firstName}
                  onChangeText={(v) => updateField("firstName", v)}
                  placeholder="Nombre"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Apellido</Text>
                <TextInput
                  style={styles.input}
                  value={form.lastName}
                  onChangeText={(v) => updateField("lastName", v)}
                  placeholder="Apellido"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cédula</Text>
              <TextInput
                style={styles.input}
                value={form.cedula}
                onChangeText={(v) => updateField("cedula", v)}
                placeholder="V-30.123.456"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha de Nacimiento</Text>
              <TextInput
                style={styles.input}
                value={form.birthDate}
                onChangeText={(v) => updateField("birthDate", v)}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#94A3B8"
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
              <Text style={styles.label}>Dirección</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.address}
                onChangeText={(v) => updateField("address", v)}
                placeholder="Tu dirección"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Médica</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Sangre</Text>
              <TouchableOpacity style={styles.selectButton}>
                <Text style={styles.selectText}>{form.bloodType}</Text>
                <LucideIcons.ChevronDown size={18} color="#64748B" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Alergias</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.allergies}
                onChangeText={(v) => updateField("allergies", v)}
                placeholder="Alergias conocidas"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Enfermedades Crónicas</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.chronicConditions}
                onChangeText={(v) => updateField("chronicConditions", v)}
                placeholder="Enfermedades crónicas"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contacto de Emergencia</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={form.emergencyContact}
                onChangeText={(v) => updateField("emergencyContact", v)}
                placeholder="Nombre del contacto"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={form.emergencyPhone}
                onChangeText={(v) => updateField("emergencyPhone", v)}
                placeholder="0414-0000000"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const LinearGradient = require('expo-linear-gradient').LinearGradient;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { position: "relative" },
  headerGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 130 },
  headerContent: { position: "relative", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: { width: 38, height: 38, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#FFFFFF", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  headerPlaceholder: { width: 38 },
  scrollView: { flex: 1 },
  form: { padding: 16 },
  section: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 16 },
  row: { flexDirection: "row" },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#64748B", marginBottom: 6 },
  input: { backgroundColor: "#F8FAFC", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#0F172A", fontWeight: "500", borderWidth: 1, borderColor: "#F1F5F9" },
  textArea: { height: 80, paddingTop: 12 },
  selectButton: { backgroundColor: "#F8FAFC", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#F1F5F9" },
  selectText: { fontSize: 15, color: "#0F172A", fontWeight: "500" },
  saveButton: { backgroundColor: "#4CB1B1", borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 40, shadowColor: "#4CB1B1", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  saveButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
});