import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { AppointmentsHeader } from "../../components/appointments/AppointmentsHeader";
import { AppointmentCard, AppointmentData } from "../../components/appointments/AppointmentCard";

const MOCK_PATIENT_APPOINTMENTS: AppointmentData[] = [
  {
    id: "1",
    patientName: "Tú",
    serviceName: "Medicina General",
    doctorName: "Dr. Carlos Rodríguez",
    date: "2026-05-10",
    time: "09:00",
    durationMin: 30,
    status: "confirmed",
    location: "Consultorio 101",
  },
  {
    id: "2",
    patientName: "Tú",
    serviceName: "Cardiología",
    doctorName: "Dra. Ana Martínez",
    date: "2026-05-15",
    time: "10:30",
    durationMin: 45,
    status: "pending",
    location: "Consultorio 203",
  },
  {
    id: "3",
    patientName: "Tú",
    serviceName: "Laboratorio Clínico",
    doctorName: "Tec. María González",
    date: "2026-05-08",
    time: "08:00",
    durationMin: 15,
    status: "completed",
    location: "Área de Laboratorio",
  },
];

export default function PatientAppointmentsScreen() {
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAppointments, setFilteredAppointments] = useState(MOCK_PATIENT_APPOINTMENTS);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredAppointments(MOCK_PATIENT_APPOINTMENTS);
    } else {
      const lowerQuery = query.toLowerCase();
      setFilteredAppointments(
        MOCK_PATIENT_APPOINTMENTS.filter(
          (apt) =>
            apt.serviceName.toLowerCase().includes(lowerQuery) ||
            apt.doctorName.toLowerCase().includes(lowerQuery)
        )
      );
    }
  };

  const upcomingAppointments = filteredAppointments.filter(
    (apt) => apt.status === "confirmed" || apt.status === "pending"
  );

  const pastAppointments = filteredAppointments.filter(
    (apt) => apt.status === "completed" || apt.status === "cancelled"
  );

  const renderItem = ({ item }: { item: AppointmentData }) => (
    <AppointmentCard appointment={item} />
  );

  const userName = user ? `${user.firstName} ${user.lastName}` : "Paciente";

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <AppointmentsHeader
        title="Mis Citas"
        onSearch={handleSearch}
      />
      <FlatList
        data={filteredAppointments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.greetingText}>Hola, {userName.split(" ")[0]}</Text>
            <Text style={styles.countText}>
              {upcomingAppointments.length} próximas citas
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes citas programadas</Text>
            <Text style={styles.emptySubtext}>Contacta a tu médico para agendar una cita</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  list: {
    padding: 16,
  },
  headerSection: {
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  countText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});