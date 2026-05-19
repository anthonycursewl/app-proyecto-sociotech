import React from "react";
import { StyleSheet, View } from "react-native";
import { Skeleton } from "@/components/common/Skeleton";
import { Text } from "@/components/common/SText";
import { colors } from "@/shared/theme/colors";

/** Pantalla mínima mientras se valida la sesión (Fase 1) */
export function SessionLoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={styles.headerText}>
          <Skeleton width="70%" height={18} borderRadius={6} />
          <Skeleton width="45%" height={14} borderRadius={6} style={{ marginTop: 8 }} />
        </View>
      </View>
      <View style={styles.grid}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} width="47%" height={100} borderRadius={16} />
        ))}
      </View>
      <Text style={styles.label}>Verificando sesión…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  headerText: {
    flex: 1,
    marginLeft: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  label: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 13,
    color: colors.textMuted,
  },
});
