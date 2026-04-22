import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomButton } from "../../components/common/CustomButton";
import { CustomInput } from "../../components/common/CustomInput";

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading, error } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return;

    // Al usar el valor de retorno directo, evitamos el problema del estado asíncrono
    const success = await login(email, password);

    if (success) {
      router.replace("/(main)/home");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inner}>
              <Animated.View
                entering={FadeInDown.duration(1000).springify()}
                style={styles.header}
              >
                <Text style={styles.title}>Sociotech</Text>
                <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
              </Animated.View>

              <Animated.View
                entering={FadeInUp.delay(200).duration(1000).springify()}
                style={styles.form}
              >
                <CustomInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <CustomInput
                  label="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  isPassword
                />

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>

                {error && (
                  <Text style={styles.errorText}>{error}</Text>
                )}

                <CustomButton
                  title="Entrar"
                  onPress={handleLogin}
                  isLoading={loading}
                />

                <View style={styles.footer}>
                  <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
                  <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                    <Text style={styles.signUpText}>Regístrate</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 8,
  },
  form: {
    width: "100%",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  forgotText: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "500",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
  },
  footerText: {
    color: "#64748B",
    fontSize: 14,
  },
  signUpText: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
  },
});
