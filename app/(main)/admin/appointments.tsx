import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ManageAppointmentsHeader } from "../../../components/appointments/ManageAppointmentsHeader";
import { AdminAppointmentCard, AdminAppointmentData } from "../../../components/appointments/AdminAppointmentCard";

const MOCK_ADMIN_APPOINTMENTS: AdminAppointmentData[] = [
  {
    id: "1",
    patientName: "María García",
    patientId: "HM-2024-0142",
    serviceName: "Medicina General",
    doctorName: "Dr. Carlos Rodríguez",
    date: "2026-05-07",
    time: "08:00",
    durationMin: 30,
    status: "completed",
    location: "Consultorio 101",
    phone: "0414-1234567",
  },
  {
    id: "2",
    patientName: "Juan Pérez",
    patientId: "HM-2024-0089",
    serviceName: "Cardiología",
    doctorName: "Dra. Ana Martínez",
    date: "2026-05-07",
    time: "09:00",
    durationMin: 45,
    status: "confirmed",
    location: "Consultorio 203",
    phone: "0412-9876543",
  },
  {
    id: "3",
    patientName: "Laura Hernández",
    patientId: "HM-2023-0567",
    serviceName: "Pediatría",
    doctorName: "Dr. Roberto Sánchez",
    date: "2026-05-07",
    time: "10:30",
    durationMin: 30,
    status: "pending",
    location: "Consultorio 105",
    phone: "0414-5551234",
  },
  {
    id: "4",
    patientName: "Carlos López",
    patientId: "HM-2024-0234",
    serviceName: "Laboratorio Clínico",
    doctorName: "Tec. María González",
    date: "2026-05-07",
    time: "11:00",
    durationMin: 15,
    status: "confirmed",
    location: "Área de Laboratorio",
    phone: "0424-2223333",
  },
  {
    id: "5",
    patientName: "Ana Martínez",
    patientId: "HM-2023-0412",
    serviceName: "Odontología",
    doctorName: "Dra. Patricia Rojas",
    date: "2026-05-07",
    time: "14:00",
    durationMin: 40,
    status: "cancelled",
    location: "Consultorio 302",
    phone: "0416-6667777",
  },
  {
    id: "6",
    patientName: "Pedro Ramírez",
    patientId: "HM-2024-0318",
    serviceName: "Medicina General",
    doctorName: "Dr. Carlos Rodríguez",
    date: "2026-05-07",
    time: "15:30",
    durationMin: 30,
    status: "pending",
    location: "Consultorio 101",
    phone: "0426-8889999",
  },
];

export default function AdminAppointmentsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAppointments, setFilteredAppointments] = useState(MOCK_ADMIN_APPOINTMENTS);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredAppointments(MOCK_ADMIN_APPOINTMENTS);
    } else {
      const lowerQuery = query.toLowerCase();
      setFilteredAppointments(
        MOCK_ADMIN_APPOINTMENTS.filter(
          (apt) =>
            apt.patientName.toLowerCase().includes(lowerQuery) ||
            apt.serviceName.toLowerCase().includes(lowerQuery) ||
            apt.doctorName.toLowerCase().includes(lowerQuery)
        )
      );
    }
  };

  const renderItem = ({ item }: { item: AdminAppointmentData }) => (
    <AdminAppointmentCard appointment={item} />
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <ManageAppointmentsHeader onSearch={handleSearch} />
      <FlatList
        data={filteredAppointments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.countText}>
            {filteredAppointments.length} citas encontradas
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron citas</Text>
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
  countText: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 12,
    fontWeight: "500",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#94A3B8",
    fontWeight: "500",
  },
});