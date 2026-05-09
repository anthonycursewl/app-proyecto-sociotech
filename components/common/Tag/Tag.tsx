import React from "react";
import { Text, View, StyleSheet } from "react-native";

interface TagProps {
  label: string;
  variant?: "default" | "primary" | "success" | "warning";
}

export const Tag = ({ label, variant = "default" }: TagProps) => {
  const variantStyles = {
    default: {
      backgroundColor: "#F1F5F9",
      textColor: "#64748B",
    },
    primary: {
      backgroundColor: "#E0F2F1",
      textColor: "#0D9488",
    },
    success: {
      backgroundColor: "#DCFCE7",
      textColor: "#22C55E",
    },
    warning: {
      backgroundColor: "#FEF3C7",
      textColor: "#D97706",
    },
  };

  const { backgroundColor, textColor } = variantStyles[variant];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
});