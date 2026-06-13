import { Text } from "@/components/common/SText";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.05, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) return;
    const success = await login(trimmedEmail, trimmedPassword);
    if (success) {
      router.replace("/(main)/home");
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (error) clearError();
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (error) clearError();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#F0F2F5" }]} />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
          >
            <Animated.View
              entering={FadeInUp.duration(600).springify()}
              style={styles.header}
            >
              <Animated.View style={[styles.logoGlow, glowStyle]}>
                <Image
                  source={require("@/assets/logo/LOGO_DOC_2_no_bg.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                  tintColor="#000000"
                />
              </Animated.View>
              <Text style={styles.tagline}>
                Gestión inteligente para tu salud
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInUp.delay(200).duration(600).springify()}
              style={styles.form}
            >
              <Text style={styles.formTitle}>Acceder</Text>
              <Text style={styles.formSubtitle}>Ingresa tus credenciales</Text>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    focused === "email" && styles.inputLabelActive,
                  ]}
                >
                  Correo electrónico
                </Text>
                <View
                  style={[
                    styles.inputRow,
                    focused === "email" && styles.inputRowActive,
                  ]}
                >
                  <Mail
                    size={18}
                    color={focused === "email" ? "#4CB1B1" : "#94A3B8"}
                    strokeWidth={2}
                  />
                  <TextInput
                    style={styles.inputField}
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder="tu@correo.com"
                    placeholderTextColor="#C5CDD8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                  />
                </View>
                <Text style={styles.inputHelper}>El correo con el que te registraste en la plataforma.</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[
                    styles.inputLabel,
                    focused === "password" && styles.inputLabelActive,
                  ]}
                >
                  Contraseña
                </Text>
                <View
                  style={[
                    styles.inputRow,
                    focused === "password" && styles.inputRowActive,
                  ]}
                >
                  <Lock
                    size={18}
                    color={focused === "password" ? "#4CB1B1" : "#94A3B8"}
                    strokeWidth={2}
                  />
                  <TextInput
                    style={styles.inputField}
                    value={password}
                    onChangeText={handlePasswordChange}
                    placeholder="••••••••"
                    placeholderTextColor="#C5CDD8"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                      onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color="#94A3B8" strokeWidth={2} />
                    ) : (
                      <Eye size={18} color="#94A3B8" strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.inputHelper}>Tu contraseña actual. Toca el ícono de ojo para mostrarla u ocultarla.</Text>
              </View>

              <TouchableOpacity
                style={styles.forgotRow}
                onPress={() => router.replace("/(auth)/forgot-password")}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>¿No tienes cuenta? </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/register")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.registerText}>Crear cuenta</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    paddingTop: 60,
  },
  logoGlow: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  logoImage: {
    width: 240,
    height: 80,
  },
  appName: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  tagline: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  form: {
    paddingTop: 28,
    paddingHorizontal: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  formSubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 3,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputHelper: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 5,
    lineHeight: 15,
    paddingHorizontal: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputLabelActive: {
    color: "#4CB1B1",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: "#E8EDF2",
    minHeight: 48,
    gap: 10,
  },
  inputRowActive: {
    borderColor: "#4CB1B1",
    backgroundColor: "#FFFFFF",
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#0F172A",
    paddingVertical: 12,
    padding: 0,
  },
  forgotRow: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    color: "#4CB1B1",
    fontWeight: "600",
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4CB1B1",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 4,
  },
  footerText: {
    fontSize: 13,
    color: "#94A3B8",
  },
  registerText: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "700",
  },
});
