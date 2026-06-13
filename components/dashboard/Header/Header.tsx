import { useRouter } from "expo-router";
import { Bell, LogOut, User } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import { Animated, LayoutChangeEvent, Modal, Pressable, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
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
  if (hour >= 6 && hour < 12) return "Buenos días";
  if (hour >= 12 && hour < 19) return "Buenas tardes";
  return "Buenas noches";
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0]?.[0]?.toUpperCase() ?? "U";
};

export const Header = ({ userName, onLogout, onNotifications, role }: HeaderProps) => {
  const router = useRouter();
  const greeting = getGreeting();
  const insets = useSafeAreaInsets();
  const initials = getInitials(userName);
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarY, setAvatarY] = useState(0);
  const [dropdownWidth, setDropdownWidth] = useState(180);
  const [dropdownHeight, setDropdownHeight] = useState(88);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const avatarRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);

  const roles: Record<string, string> = {
    PATIENT: "Paciente",
    DOCTOR: "Doctor",
    ASSISTANT: "Asistente",
    ADMIN: "Administrador",
    SUPER_ADMIN: "Super Admin",
  };

  const roleLabel = role && roles[role] ? roles[role] : "Usuario";

  const openMenu = useCallback(() => {
    avatarRef.current?.measureInWindow((x: number, y: number) => {
      setAvatarY(y);
    });
    setMenuOpen(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 250,
    }).start();
  }, [scaleAnim]);

  const closeMenu = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => setMenuOpen(false));
  }, [scaleAnim]);

  const handleProfilePress = () => {
    closeMenu();
    router.navigate("/(main)/profile");
  };

  const handleLogoutPress = () => {
    closeMenu();
    onLogout();
  };

  const dropdownTop = avatarY > 0 ? avatarY + 48 : insets.top + 72;

  const onDropdownLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setDropdownWidth(width);
    setDropdownHeight(height);
  };

  const translateX = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [dropdownWidth / 2, 0],
  });

  const translateY = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-dropdownHeight / 2, 0],
  });

  return (
    <View>
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <View style={styles.topRow}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
            <Text style={styles.roleLabel}>{roleLabel}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onNotifications} style={styles.iconButton}>
              <Bell size={20} color="#475569" strokeWidth={1.8} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>

            <TouchableOpacity ref={avatarRef} onPress={openMenu} style={styles.avatarButton}>
              <Text style={styles.avatarText}>{initials}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal visible={menuOpen} transparent onRequestClose={closeMenu}>
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <Animated.View
            onLayout={onDropdownLayout}
            style={[
              styles.dropdown,
              { top: dropdownTop },
              {
                opacity: scaleAnim,
                transform: [
                  { translateX },
                  { translateY },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            <TouchableOpacity style={styles.dropdownItem} onPress={handleProfilePress}>
              <User size={16} color="#475569" strokeWidth={1.8} />
              <Text style={styles.dropdownText}>Ver Perfil</Text>
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity style={styles.dropdownItem} onPress={handleLogoutPress}>
              <LogOut size={16} color="#EF4444" strokeWidth={1.8} />
              <Text style={[styles.dropdownText, styles.dropdownDanger]}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};
