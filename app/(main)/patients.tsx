import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ManagePatientsHeader } from "../../components/patients/ManagePatientsHeader";
import { PatientCard, PatientData } from "../../components/patients/PatientCard";

const MOCK_PATIENTS: PatientData[] = [
  {
    id: "1",
    name: "María García",
    medicalId: "HM-2024-0142",
    email: "maria.garcia@email.com",
    phone: "0414-1234567",
    status: "active",
    lastVisit: "05 may",
    totalAppointments: 12,
  },
  {
    id: "2",
    name: "Juan Pérez",
    medicalId: "HM-2024-0089",
    email: "juan.perez@email.com",
    phone: "0412-9876543",
    status: "active",
    lastVisit: "03 may",
    totalAppointments: 8,
  },
  {
    id: "3",
    name: "Laura Hernández",
    medicalId: "HM-2023-0567",
    email: "laura.hernandez@email.com",
    phone: "0414-5551234",
    status: "active",
    lastVisit: "01 may",
    totalAppointments: 15,
  },
  {
    id: "4",
    name: "Carlos López",
    medicalId: "HM-2024-0234",
    email: "carlos.lopez@email.com",
    phone: "0424-2223333",
    status: "inactive",
    lastVisit: "15 abr",
    totalAppointments: 5,
  },
  {
    id: "5",
    name: "Ana Martínez",
    medicalId: "HM-2023-0412",
    email: "ana.martinez@email.com",
    phone: "0416-6667777",
    status: "active",
    lastVisit: "28 abr",
    totalAppointments: 20,
  },
  {
    id: "6",
    name: "Pedro Ramírez",
    medicalId: "HM-2024-0318",
    email: "pedro.ramirez@email.com",
    phone: "0426-8889999",
    status: "active",
    lastVisit: "25 abr",
    totalAppointments: 3,
  },
];

export default function PatientsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPatients, setFilteredPatients] = useState(MOCK_PATIENTS);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredPatients(MOCK_PATIENTS);
    } else {
      const lowerQuery = query.toLowerCase();
      setFilteredPatients(
        MOCK_PATIENTS.filter(
          (patient) =>
            patient.name.toLowerCase().includes(lowerQuery) ||
            patient.medicalId.toLowerCase().includes(lowerQuery) ||
            patient.email.toLowerCase().includes(lowerQuery)
        )
      );
    }
  };

  const renderItem = ({ item }: { item: PatientData }) => (
    <PatientCard patient={item} />
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <ManagePatientsHeader onSearch={handleSearch} />
      <FlatList
        data={filteredPatients}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.countText}>
            {filteredPatients.length} pacientes encontrados
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron pacientes</Text>
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