import { Text } from "@/components/common/SText";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  HeartPulse,
  Lock,
  Mail,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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

const TOTAL_STEPS = 3;

const STEPS = [
  { title: "Nombre y Apellido", subtitle: "Ingresa tus datos personales" },
  { title: "Correo Electrónico", subtitle: "Confirma tu dirección de correo" },
  { title: "Contraseña", subtitle: "Crea una contraseña segura" },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading, error, clearError } = useAuthStore();
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.15, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const clearErrors = () => {
    if (validationError) setValidationError(null);
    if (error) clearError();
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!firstName.trim() || !lastName.trim()) {
        setValidationError("Completa todos los campos");
        return false;
      }
      return true;
    }
    if (step === 1) {
      if (!email.trim() || !confirmEmail.trim()) {
        setValidationError("Completa todos los campos");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setValidationError("Ingresa un correo electrónico válido");
        return false;
      }
      if (email !== confirmEmail) {
        setValidationError("Los correos no coinciden");
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!password.trim() || !confirmPassword.trim()) {
        setValidationError("Completa todos los campos");
        return false;
      }
      if (password.length < 6) {
        setValidationError("La contraseña debe tener al menos 6 caracteres");
        return false;
      }
      if (password !== confirmPassword) {
        setValidationError("Las contraseñas no coinciden");
        return false;
      }
      return true;
    }
    return false;
  };

  const handleNext = () => {
    clearErrors();
    if (!validateStep()) return;
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    clearErrors();
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleRegister = async () => {
    clearErrors();
    if (!validateStep()) return;
    const success = await register(email, password, firstName.trim(), lastName.trim());
    if (success) {
      router.replace("/(main)/home");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient
        colors={["#F0FDF9", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.inner}>
              <Animated.View
                entering={FadeInUp.duration(600).springify()}
                style={styles.header}
              >
                <Animated.View style={[styles.logoGlow, glowStyle]}>
                  <LinearGradient
                    colors={["#3A9B9B", "#5DC9C9", "#FFF3D6", "#FFD6D6", "#FFFFFF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.logoCircle}
                  >
                    <HeartPulse size={28} color="#FFFFFF" strokeWidth={2.5} />
                  </LinearGradient>
                </Animated.View>
                <Text style={styles.appName}>Sociotech</Text>
                <Text style={styles.tagline}>
                  Gestión inteligente para tu salud
                </Text>
              </Animated.View>

              <Animated.View
                entering={FadeInUp.delay(200).duration(600).springify()}
                style={styles.form}
              >
                {/* Step indicator */}
                <View style={styles.stepsRow}>
                  {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                    <View key={i} style={styles.stepDotWrapper}>
                      <View
                        style={[
                          styles.stepDot,
                          i < step && styles.stepDotDone,
                          i === step && styles.stepDotActive,
                        ]}
                      >
                        {i < step ? (
                          <Check size={12} color="#FFFFFF" strokeWidth={3} />
                        ) : (
                          <Text
                            style={[
                              styles.stepDotText,
                              i === step && styles.stepDotTextActive,
                            ]}
                          >
                            {i + 1}
                          </Text>
                        )}
                      </View>
                      {i < TOTAL_STEPS - 1 && (
                        <View
                          style={[
                            styles.stepLine,
                            i < step && styles.stepLineDone,
                          ]}
                        />
                      )}
                    </View>
                  ))}
                </View>

                <Text style={styles.formTitle}>{STEPS[step].title}</Text>
                <Text style={styles.formSubtitle}>{STEPS[step].subtitle}</Text>

                {/* Step 0: Name & Last Name */}
                {step === 0 && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text
                        style={[
                          styles.inputLabel,
                          focused === "firstName" && styles.inputLabelActive,
                        ]}
                      >
                        Nombre
                      </Text>
                      <View
                        style={[
                          styles.inputRow,
                          focused === "firstName" && styles.inputRowActive,
                        ]}
                      >
                        <User
                          size={18}
                          color={focused === "firstName" ? "#4CB1B1" : "#94A3B8"}
                          strokeWidth={2}
                        />
                        <TextInput
                          style={styles.inputField}
                          value={firstName}
                          onChangeText={(v) => {
                            setFirstName(v);
                            clearErrors();
                          }}
                          placeholder="Tu nombre"
                          placeholderTextColor="#C5CDD8"
                          autoCapitalize="words"
                          autoComplete="name"
                          onFocus={() => setFocused("firstName")}
                          onBlur={() => setFocused(null)}
                          returnKeyType="next"
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text
                        style={[
                          styles.inputLabel,
                          focused === "lastName" && styles.inputLabelActive,
                        ]}
                      >
                        Apellido
                      </Text>
                      <View
                        style={[
                          styles.inputRow,
                          focused === "lastName" && styles.inputRowActive,
                        ]}
                      >
                        <User
                          size={18}
                          color={focused === "lastName" ? "#4CB1B1" : "#94A3B8"}
                          strokeWidth={2}
                        />
                        <TextInput
                          style={styles.inputField}
                          value={lastName}
                          onChangeText={(v) => {
                            setLastName(v);
                            clearErrors();
                          }}
                          placeholder="Tu apellido"
                          placeholderTextColor="#C5CDD8"
                          autoCapitalize="words"
                          autoComplete="family-name"
                          onFocus={() => setFocused("lastName")}
                          onBlur={() => setFocused(null)}
                          returnKeyType="done"
                        />
                      </View>
                    </View>

                    {(validationError || error) && (
                      <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{validationError || error}</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleNext}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.buttonText}>Continuar</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* Step 1: Email & Confirm Email */}
                {step === 1 && (
                  <>
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
                          onChangeText={(v) => {
                            setEmail(v);
                            clearErrors();
                          }}
                          placeholder="tu@correo.com"
                          placeholderTextColor="#C5CDD8"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          onFocus={() => setFocused("email")}
                          onBlur={() => setFocused(null)}
                          returnKeyType="next"
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text
                        style={[
                          styles.inputLabel,
                          focused === "confirmEmail" && styles.inputLabelActive,
                        ]}
                      >
                        Confirmar correo
                      </Text>
                      <View
                        style={[
                          styles.inputRow,
                          focused === "confirmEmail" && styles.inputRowActive,
                        ]}
                      >
                        <Mail
                          size={18}
                          color={
                            focused === "confirmEmail" ? "#4CB1B1" : "#94A3B8"
                          }
                          strokeWidth={2}
                        />
                        <TextInput
                          style={styles.inputField}
                          value={confirmEmail}
                          onChangeText={(v) => {
                            setConfirmEmail(v);
                            clearErrors();
                          }}
                          placeholder="Repite tu correo"
                          placeholderTextColor="#C5CDD8"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          onFocus={() => setFocused("confirmEmail")}
                          onBlur={() => setFocused(null)}
                          returnKeyType="done"
                        />
                      </View>
                    </View>

                    {(validationError || error) && (
                      <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{validationError || error}</Text>
                      </View>
                    )}

                    <View style={styles.buttonsRow}>
                      <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                        activeOpacity={0.7}
                      >
                        <ChevronLeft size={20} color="#4CB1B1" strokeWidth={2.5} />
                        <Text style={styles.backText}>Atrás</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, styles.buttonFlex]}
                        onPress={handleNext}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.buttonText}>Continuar</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {/* Step 2: Password & Confirm Password */}
                {step === 2 && (
                  <>
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
                          onChangeText={(v) => {
                            setPassword(v);
                            clearErrors();
                          }}
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
                        Confirmar Contraseña
                      </Text>
                      <View
                        style={[
                          styles.inputRow,
                          focused === "confirmPassword" && styles.inputRowActive,
                        ]}
                      >
                        <Lock
                          size={18}
                          color={
                            focused === "confirmPassword"
                              ? "#4CB1B1"
                              : "#94A3B8"
                          }
                          strokeWidth={2}
                        />
                        <TextInput
                          style={styles.inputField}
                          value={confirmPassword}
                          onChangeText={(v) => {
                            setConfirmPassword(v);
                            clearErrors();
                          }}
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
                          onPress={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
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

                    <View style={styles.buttonsRow}>
                      <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                        activeOpacity={0.7}
                      >
                        <ChevronLeft size={20} color="#4CB1B1" strokeWidth={2.5} />
                        <Text style={styles.backText}>Atrás</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, styles.buttonFlex, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.85}
                      >
                        {loading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.buttonText}>Crear cuenta</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    {step > 0 ? "Paso " + (step + 1) + " de " + TOTAL_STEPS : ""}
                  </Text>
                </View>
              </Animated.View>
            </View>
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
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoGlow: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 215, 215, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#4CB1B1",
    justifyContent: "center",
    alignItems: "center",
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
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  stepDotWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E8EDF2",
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: {
    backgroundColor: "#4CB1B1",
  },
  stepDotDone: {
    backgroundColor: "#4CB1B1",
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
  },
  stepDotTextActive: {
    color: "#FFFFFF",
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "#E8EDF2",
    marginHorizontal: 6,
  },
  stepLineDone: {
    backgroundColor: "#4CB1B1",
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
  buttonFlex: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E8EDF2",
    gap: 4,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4CB1B1",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#94A3B8",
  },
});
