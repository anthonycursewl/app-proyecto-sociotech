import { useRouter } from "expo-router";
import * as LucideIcons from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { NoiseGradient } from "@/components/common/NoiseGradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./Header.styles";

const noiseTexture = require("../../../assets/images/noise.png");

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
    <NoiseGradient
      colors={["#0D9488", "#14B8A6", "rgba(20, 184, 166, 0.6)", "transparent"]}
      locations={[0, 0.35, 0.65, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      noiseSource={noiseTexture}
      noiseOpacity={0.18}
      style={[styles.container, { paddingTop: insets.top + 20 }]}
    >
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
    </NoiseGradient>
  );
};
