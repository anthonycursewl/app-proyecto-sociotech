import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "@/components/common/SText"
import { SafeAreaView } from "react-native-safe-area-context";
import { ManageDoctorsHeader } from "../../../components/doctors/ManageDoctorsHeader";
import { DoctorCard, DoctorData } from "../../../components/doctors/DoctorCard";

const MOCK_DOCTORS: DoctorData[] = [
  {
    id: "1",
    name: "Dr. Carlos Rodríguez",
    specialty: "Medicina General",
    email: "carlos.rodriguez@sociotech.com",
    phone: "0414-1234567",
    status: "active",
    patientsCount: 48,
    todayAppointments: 12,
  },
  {
    id: "2",
    name: "Dra. Ana Martínez",
    specialty: "Cardiología",
    email: "ana.martinez@sociotech.com",
    phone: "0412-9876543",
    status: "active",
    patientsCount: 35,
    todayAppointments: 8,
  },
  {
    id: "3",
    name: "Dr. Roberto Sánchez",
    specialty: "Pediatría",
    email: "roberto.sanchez@sociotech.com",
    phone: "0414-5551234",
    status: "active",
    patientsCount: 62,
    todayAppointments: 15,
  },
  {
    id: "4",
    name: "Dra. Patricia Rojas",
    specialty: "Odontología",
    email: "patricia.rojas@sociotech.com",
    phone: "0424-2223333",
    status: "active",
    patientsCount: 28,
    todayAppointments: 6,
  },
  {
    id: "5",
    name: "Dr. Miguel Torres",
    specialty: "Cirugía General",
    email: "miguel.torres@sociotech.com",
    phone: "0416-6667777",
    status: "inactive",
    patientsCount: 41,
    todayAppointments: 0,
  },
  {
    id: "6",
    name: "Dra. Lucía Fernández",
    specialty: "Oftalmología",
    email: "lucia.fernandez@sociotech.com",
    phone: "0426-8889999",
    status: "active",
    patientsCount: 22,
    todayAppointments: 4,
  },
];

export default function ManageDoctorsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState(MOCK_DOCTORS);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredDoctors(MOCK_DOCTORS);
    } else {
      const lowerQuery = query.toLowerCase();
      setFilteredDoctors(
        MOCK_DOCTORS.filter(
          (doctor) =>
            doctor.name.toLowerCase().includes(lowerQuery) ||
            doctor.specialty.toLowerCase().includes(lowerQuery)
        )
      );
    }
  };

  const renderItem = ({ item }: { item: DoctorData }) => (
    <DoctorCard doctor={item} />
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <ManageDoctorsHeader onSearch={handleSearch} />
      <FlatList
        data={filteredDoctors}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.countText}>
            {filteredDoctors.length} doctores encontrados
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron doctores</Text>
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