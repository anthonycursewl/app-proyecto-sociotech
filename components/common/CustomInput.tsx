import React, { useState } from "react";
import { StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { Eye, EyeOff } from "lucide-react-native";

interface CustomInputProps extends TextInputProps {
  label: string;
  isPassword?: boolean;
}

export const CustomInput = ({ 
  label, 
  onFocus, 
  onBlur, 
  isPassword,
  secureTextEntry,
  ...props 
}: CustomInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={[
      styles.container,
      isFocused && styles.containerFocused
    ]}>
      <Text style={[
        styles.label,
        isFocused && styles.labelFocused
      ]}>
        {label}
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#94A3B8"
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity 
            onPress={togglePasswordVisibility}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <EyeOff size={20} color="#64748B" strokeWidth={2} />
            ) : (
              <Eye size={20} color="#64748B" strokeWidth={2} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#bbbbbbff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  containerFocused: {
    borderColor: "#0F172A", // Darker border on focus for premium feel
    backgroundColor: "#FFFFFF",
    shadowOpacity: 0.08,
  },
  label: {
    fontSize: 14,
    fontWeight: 'normal',
    color: "#838383ff",
    marginBottom: 4,
  },
  labelFocused: {
    color: "#0F172A",
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#17181aff",
    padding: 0,
    margin: 0,
    height: 24,
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
  },
});
