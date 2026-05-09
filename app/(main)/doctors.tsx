import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as LucideIcons from "lucide-react-native";

const MOCK_DOCTORS = [
  { id: "1", name: "Dr. Carlos Rodríguez", specialty: "Medicina General", email: "carlos@sociotech.com", status: "active" },
  { id: "2", name: "Dra. Ana Martínez", specialty: "Cardiología", email: "ana@sociotech.com", status: "active" },
  { id: "3", name: "Dr. Roberto Sánchez", specialty: "Pediatría", email: "roberto@sociotech.com", status: "active" },
];

export default function DoctorsScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDoctors = MOCK_DOCTORS.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Doctores</Text>
        <Text style={styles.subtitle}>Personal médico disponible</Text>
      </View>
      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No se encontraron doctores</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.doctorCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.split(" ").pop()?.[0] ?? "D"}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.specialty}>{item.specialty}</Text>
            </View>
            <View style={[styles.badge, item.status === "active" ? styles.activeBadge : styles.inactiveBadge]}>
              <Text style={[styles.badgeText, item.status === "active" ? styles.activeText : styles.inactiveText]}>
                {item.status === "active" ? "Activo" : "Inactivo"}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: "800", color: "#0F172A" },
  subtitle: { fontSize: 14, color: "#64748B", marginTop: 4 },
  list: { padding: 16 },
  empty: { paddingVertical: 40, alignItems: "center" },
  emptyText: { fontSize: 15, color: "#94A3B8" },
  doctorCard: {
    backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16, marginBottom: 10,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#4CB1B1", justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
  specialty: { fontSize: 13, color: "#64748B", marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  activeBadge: { backgroundColor: "#DCFCE7" },
  inactiveBadge: { backgroundColor: "#F1F5F9" },
  badgeText: { fontSize: 11, fontWeight: "600" },
  activeText: { color: "#16A34A" },
  inactiveText: { color: "#64748B" },
});