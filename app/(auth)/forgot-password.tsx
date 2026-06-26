import { Text } from "@/components/common/SText";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CheckCircle, ChevronLeft, Eye, EyeOff, Lock, Mail, RefreshCw } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
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

const RESEND_COOLDOWN = 60;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword, resetPassword, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.05, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulse]);

  useEffect(() => {
    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const startResendCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN);
    resendTimerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (resendTimerRef.current) clearInterval(resendTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clearErrors = () => {
    if (validationError) setValidationError(null);
    if (error) clearError();
  };

  const handleSendCode = async () => {
    clearErrors();
    if (!email.trim()) {
      setValidationError("Ingresa tu correo electrónico");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError("Ingresa un correo electrónico válido");
      return;
    }
    setSendingCode(true);
    const success = await forgotPassword(email.trim());
    setSendingCode(false);
    if (success) {
      setCodeSent(true);
      setOtpCode("");
      startResendCooldown();
    }
  };

  const handleReset = async () => {
    clearErrors();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setValidationError("Ingresa el código de 6 dígitos");
      return;
    }
    if (!password.trim()) {
      setValidationError("Ingresa una nueva contraseña");
      return;
    }
    if (password.length < 6) {
      setValidationError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setValidationError("Las contraseñas no coinciden");
      return;
    }
    setResetting(true);
    const success = await resetPassword(email.trim(), otpCode.trim(), password);
    setResetting(false);
    if (success) {
      setCodeVerified(true);
    }
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
              contentContainerStyle={styles.inner}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
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
                {codeVerified ? (
                  <>
                    <View style={styles.successBox}>
                      <CheckCircle size={24} color="#15803D" strokeWidth={2.5} />
                      <Text style={styles.successTitle}>Contraseña restablecida</Text>
                    </View>
                    <Text style={styles.successSubtext}>
                      Tu contraseña se ha actualizado correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.
                    </Text>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => router.replace("/(auth)/login")}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.buttonText}>Volver al inicio</Text>
                    </TouchableOpacity>
                  </>
                ) : codeSent ? (
                  <>
                    <TouchableOpacity
                      style={styles.backLink}
                      onPress={() => { setCodeSent(false); setOtpCode(""); clearErrors(); }}
                      activeOpacity={0.7}
                    >
                      <ChevronLeft size={18} color="#4CB1B1" strokeWidth={2.5} />
                      <Text style={styles.backLinkText}>Cambiar correo</Text>
                    </TouchableOpacity>

                    <Text style={styles.formTitle}>Restablecer contraseña</Text>
                    <Text style={styles.formSubtitle}>
                      Ingresa el código de 6 dígitos enviado a{" "}
                      <Text style={{ fontWeight: "700", color: "#0F172A" }}>{email}</Text>
                    </Text>

                    <View style={styles.inputGroup}>
                      <Text
                        style={[
                          styles.inputLabel,
                          focused === "otp" && styles.inputLabelActive,
                        ]}
                      >
                        Código de verificación
                      </Text>
                      <View
                        style={[
                          styles.inputRow,
                          styles.otpInputRow,
                          focused === "otp" && styles.inputRowActive,
                        ]}
                      >
                        <TextInput
                          style={styles.otpInput}
                          value={otpCode}
                          onChangeText={(v) => {
                            const digits = v.replace(/[^0-9]/g, "").slice(0, 6);
                            setOtpCode(digits);
                            clearErrors();
                          }}
                          placeholder="000000"
                          placeholderTextColor="#C5CDD8"
                          keyboardType="number-pad"
                          maxLength={6}
                          onFocus={() => setFocused("otp")}
                          onBlur={() => setFocused(null)}
                          returnKeyType="next"
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text
                        style={[
                          styles.inputLabel,
                          focused === "password" && styles.inputLabelActive,
                        ]}
                      >
                        Nueva contraseña
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
                          onChangeText={(v) => { setPassword(v); clearErrors(); }}
                          placeholder="Min. 6 caracteres"
                          placeholderTextColor="#C5CDD8"
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoComplete="new-password"
                          onFocus={() => setFocused("password")}
                          onBlur={() => setFocused(null)}
                          returnKeyType="next"
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
                    </View>

                    <View style={styles.inputGroup}>
                      <Text
                        style={[
                          styles.inputLabel,
                          focused === "confirmPassword" && styles.inputLabelActive,
                        ]}
                      >
                        Confirmar contraseña
                      </Text>
                      <View
                        style={[
                          styles.inputRow,
                          focused === "confirmPassword" && styles.inputRowActive,
                        ]}
                      >
                        <Lock
                          size={18}
                          color={focused === "confirmPassword" ? "#4CB1B1" : "#94A3B8"}
                          strokeWidth={2}
                        />
                        <TextInput
                          style={styles.inputField}
                          value={confirmPassword}
                          onChangeText={(v) => { setConfirmPassword(v); clearErrors(); }}
                          placeholder="Repite tu contraseña"
                          placeholderTextColor="#C5CDD8"
                          secureTextEntry={!showConfirmPassword}
                          autoCapitalize="none"
                          autoComplete="new-password"
                          onFocus={() => setFocused("confirmPassword")}
                          onBlur={() => setFocused(null)}
                          returnKeyType="done"
                        />
                        <TouchableOpacity
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                          activeOpacity={0.7}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} color="#94A3B8" strokeWidth={2} />
                          ) : (
                            <Eye size={18} color="#94A3B8" strokeWidth={2} />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    {(validationError || error) && (
                      <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{validationError || error}</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[styles.button, (resetting || otpCode.length < 6 || !password) && styles.buttonDisabled]}
                      onPress={handleReset}
                      disabled={resetting || otpCode.length < 6 || !password}
                      activeOpacity={0.85}
                    >
                      {resetting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.buttonText}>Restablecer contraseña</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.resendRow}
                      onPress={handleSendCode}
                      disabled={resendCooldown > 0 || sendingCode}
                      activeOpacity={0.7}
                    >
                      <RefreshCw
                        size={14}
                        color={resendCooldown > 0 ? "#C5CDD8" : "#4CB1B1"}
                        strokeWidth={2.5}
                      />
                      <Text
                        style={[
                          styles.resendText,
                          resendCooldown > 0 && styles.resendTextDisabled,
                        ]}
                      >
                        {resendCooldown > 0
                          ? `Reenviar código en ${resendCooldown}s`
                          : "Reenviar código"}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.backRow}>
                      <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                      >
                        <View style={styles.backButtonSmall}>
                          <ChevronLeft size={20} color="#4CB1B1" strokeWidth={2.5} />
                        </View>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.formTitle}>¿Olvidaste tu contraseña?</Text>
                    <Text style={styles.formSubtitle}>
                      Ingresa tu correo y te enviaremos un código para restablecerla.
                    </Text>

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
                          onChangeText={(v) => { setEmail(v); clearErrors(); }}
                          placeholder="tu@correo.com"
                          placeholderTextColor="#C5CDD8"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          onFocus={() => setFocused("email")}
                          onBlur={() => setFocused(null)}
                          returnKeyType="done"
                          onSubmitEditing={handleSendCode}
                        />
                      </View>
                    </View>

                    {(validationError || error) && (
                      <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{validationError || error}</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[styles.button, sendingCode && styles.buttonDisabled]}
                      onPress={handleSendCode}
                      disabled={sendingCode}
                      activeOpacity={0.85}
                    >
                      {sendingCode ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.buttonText}>Enviar código</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}

                <View style={styles.footer}>
                  <TouchableOpacity
                    onPress={() => router.replace("/(auth)/login")}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.footerLink}>Volver al inicio de sesión</Text>
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
  inner: {
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
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
  tagline: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  form: {
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  backRow: {
    marginBottom: 12,
  },
  backButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  backLinkText: {
    fontSize: 14,
    color: "#4CB1B1",
    fontWeight: "600",
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
    marginBottom: 20,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 18,
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
  otpInputRow: {
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  otpInput: {
    flex: 0,
    width: "100%",
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: 12,
    paddingVertical: 12,
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
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 20,
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4CB1B1",
  },
  resendTextDisabled: {
    color: "#C5CDD8",
  },
  successBox: {
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingVertical: 8,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#15803D",
    textAlign: "center",
  },
  successSubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  footerLink: {
    fontSize: 13,
    color: "#4CB1B1",
    fontWeight: "600",
  },
});
