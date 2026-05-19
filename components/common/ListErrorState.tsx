import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { colors } from "@/shared/theme/colors";

interface ListErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ListErrorState({ message, onRetry }: ListErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity onPress={onRetry} accessibilityRole="button">
          <Text style={styles.retry}>Toca para reintentar</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 12 },
  message: { fontSize: 15, color: colors.error, fontWeight: "500", textAlign: "center" },
  retry: { fontSize: 14, color: colors.accent, fontWeight: "600" },
});
