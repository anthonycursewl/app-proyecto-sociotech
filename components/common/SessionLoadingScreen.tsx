import React from "react";
import { StyleSheet, View } from "react-native";
import { Skeleton } from "@/components/common/Skeleton";

/** Pantalla mínima mientras se valida la sesión */
export function SessionLoadingScreen() {
  return (
    <View style={styles.container}>
      <Skeleton width={56} height={56} borderRadius={28} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
