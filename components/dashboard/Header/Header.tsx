import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as LucideIcons from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./Header.styles";

interface HeaderProps {
  userName: string;
  onLogout: () => void;
  onNotifications?: () => void;
  role: string;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "¡Buenos días!";
  if (hour >= 12 && hour < 19) return "¡Buenas tardes!";
  return "¡Buenas noches!";
};

export const Header = ({ userName, onLogout, onNotifications, role }: HeaderProps) => {
  const router = useRouter();
  const greeting = getGreeting();
  const insets = useSafeAreaInsets();
  const roles: Record<string, string> = {
    PATIENT: "Paciente",
    DOCTOR: "Doctor",
    ASSISTANT: "Asistente",
    ADMIN: "Administrador",
    SUPER_ADMIN: "Super Admin",
  };

  const roleLabel = role && roles[role] ? roles[role].toLocaleUpperCase() : "Usuario";

  const handleProfilePress = () => {
    router.push("/(main)/profile");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <LinearGradient
        colors={["rgba(76, 177, 177, 0.15)", "transparent"]}
        style={[styles.gradient, { height: 120 + insets.top }]}
      />
      <View style={styles.userInfo}>
        <TouchableOpacity onPress={handleProfilePress}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.welcomeText}>{greeting}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconButton}>
          <LucideIcons.Mail size={22} color="#1E293B" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onNotifications} style={styles.iconButton}>
          <LucideIcons.Bell size={22} color="#1E293B" strokeWidth={2} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <LucideIcons.LogOut size={18} color="#EF4444" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
