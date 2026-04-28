import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../components/dashboard/Header/Header";
import { ModuleGrid } from "../../components/dashboard/ModuleGrid/ModuleGrid";

export default function HomeScreen() {
  const router = useRouter();
  const { verifyToken, user, logout, permissions } = useAuthStore()

  useEffect(() => {
    const verify = async () => {
      const success = await verifyToken();
      if (!success) {
        router.replace("/(auth)/login");
      }
    }

    console.log(permissions)

    verify();
  }, []);

  const handleLogout = () => {
    Alert.alert('¿Seguro que quieres cerrar sesión?', '', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const userName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Usuario"
    : "Cargando...";
  const role = user?.role

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <Header
        userName={userName}
        onLogout={handleLogout}
        onNotifications={() => console.log("Notificaciones")}
        role={role ?? ""}
      />
      <View style={styles.content}>
        <ModuleGrid />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
  },
});
