import React from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Text } from "@/components/common/SText"

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary";
  isLoading?: boolean;
}

export const CustomButton = ({
  title,
  variant = "primary",
  isLoading = false,
  style,
  disabled,
  ...props
}: CustomButtonProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.button,
        variant === "secondary" && styles.buttonSecondary,
        (disabled || isLoading) && styles.buttonDisabled,
        style,
      ]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : "#0F172A"} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "secondary" && styles.textSecondary,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  textSecondary: {
    color: "#0F172A",
  },
});
