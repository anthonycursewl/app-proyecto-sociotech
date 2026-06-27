import { ChevronLeft } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MedicalRecordView } from "@/components/medical-records/MedicalRecordView";
import { ListErrorState } from "@/components/common/ListErrorState";
import { medicalRecordService, MedicalRecordResponse } from "@/shared/services/medicalRecord.service";
import { colors } from "@/shared/theme/colors";

export default function PatientMedicalRecordDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [record, setRecord] = useState<MedicalRecordResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await medicalRecordService.getById(id);
      setRecord(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (loading && !record) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !record) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        <ListErrorState message={error} onRetry={fetch} />
      </SafeAreaView>
    );
  }

  if (!record) return null;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historia Clínica</Text>
          <View style={styles.headerSpacer} />
        </View>

        <MedicalRecordView record={record} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: "transparent" },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 32,
  },
});
