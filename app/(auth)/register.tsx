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

interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  password: string
}

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm & { confirmPassword: string }>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleRegister = () => {
    console.log("Register with:", form);
    router.replace("/(main)/home");
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
                <Text style={styles.title}>Crea tu cuenta</Text>
                <Text style={styles.subtitle}>Únete a Sociotech hoy mismo</Text>
              </Animated.View>

              <Animated.View
                entering={FadeInUp.delay(200).duration(1000).springify()}
                style={styles.form}
              >
                <CustomInput
                  label="Nombre"
                  value={form.firstName}
                  onChangeText={(text) => setForm({ ...form, firstName: text })}
                />

                <CustomInput
                  label="Apellido"
                  value={form.lastName}
                  onChangeText={(text) => setForm({ ...form, lastName: text })}
                />

                <CustomInput
                  label="Correo Electrónico"
                  value={form.email}
                  onChangeText={(text) => setForm({ ...form, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <CustomInput
                  label="Contraseña"
                  value={form.password}
                  onChangeText={(text) => setForm({ ...form, password: text })}
                  isPassword
                />

                <CustomInput
                  label="Confirmar Contraseña"
                  value={form.confirmPassword}
                  onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
                  isPassword
                />

                <CustomButton
                  title="Registrarse"
                  onPress={handleRegister}
                  style={{ marginTop: 10 }}
                />

                <View style={styles.footer}>
                  <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
                  <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.signInText}>Inicia sesión</Text>
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
    fontSize: 32,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 8,
  },
  form: {
    width: "100%",
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
  signInText: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
  },
});
