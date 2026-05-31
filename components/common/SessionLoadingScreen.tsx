import { Text } from "@/components/common/SText";
import { DetailHeader } from "@/components/appointments/DetailHeader";
import { LinearGradient } from "expo-linear-gradient";
import { Stethoscope } from "lucide-react-native";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/shared/theme/colors";

const { width } = Dimensions.get("window");
const LOGO_SIZE = 88;
const ORBIT_SIZE = 132;

export function SessionLoadingScreen() {
  const pulse = useSharedValue(1);
  const rotate = useSharedValue(0);
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    rotate.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false,
    );
    const stagger = (sv: typeof dot1, delay: number) => {
      sv.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 800 + delay }),
        ),
        -1,
        false,
      );
    };
    stagger(dot1, 0);
    stagger(dot2, 200);
    stagger(dot3, 400);
  }, [pulse, rotate, dot1, dot2, dot3]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const dot1Style = useAnimatedStyle(() => ({ opacity: 0.3 + dot1.value * 0.7 }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: 0.3 + dot2.value * 0.7 }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: 0.3 + dot3.value * 0.7 }));

  return (
    <View style={styles.root}>
      <DetailHeader height={width} />
      <LinearGradient
        colors={["transparent", "rgba(248, 250, 252, 0.6)", colors.background]}
        locations={[0, 0.4, 0.8]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
        <View style={styles.center}>
          <View style={styles.logoWrap}>
            <Animated.View style={[styles.orbit, orbitStyle]}>
              <View style={[styles.orbitDot, styles.orbitDotTop]} />
              <View style={[styles.orbitDot, styles.orbitDotBottomLeft]} />
              <View style={[styles.orbitDot, styles.orbitDotBottomRight]} />
            </Animated.View>
            <Animated.View style={[styles.logo, logoStyle]}>
              <LinearGradient
                colors={["#0F766E", "#14B8A6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Stethoscope size={40} color="#FFFFFF" strokeWidth={2.2} />
            </Animated.View>
          </View>

          <Text style={styles.brand}>SocioTech</Text>
          <Text style={styles.subtitle}>Cargando tu sesión</Text>

          <View style={styles.dots}>
            <Animated.View style={[styles.dot, dot1Style]} />
            <Animated.View style={[styles.dot, dot2Style]} />
            <Animated.View style={[styles.dot, dot3Style]} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

interface SessionLoadingErrorProps {
  message: string;
}

export function SessionLoadingError({ message }: SessionLoadingErrorProps) {
  return (
    <View style={styles.errorRoot}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
        <View style={styles.center}>
          <View style={styles.errorIconWrap}>
            <Text style={styles.errorIcon}>!</Text>
          </View>
          <Text style={styles.errorTitle}>No pudimos conectar</Text>
          <Text style={styles.errorMessage}>{message}</Text>
          <Text style={styles.errorHint}>
            Verifica tu conexión a internet e inténtalo de nuevo.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoWrap: {
    width: ORBIT_SIZE,
    height: ORBIT_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  orbit: {
    position: "absolute",
    width: ORBIT_SIZE,
    height: ORBIT_SIZE,
    borderRadius: ORBIT_SIZE / 2,
    borderWidth: 1,
    borderColor: "rgba(13, 148, 136, 0.25)",
    borderStyle: "dashed",
  },
  orbitDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#14B8A6",
  },
  orbitDotTop: {
    top: -4,
    left: ORBIT_SIZE / 2 - 4,
  },
  orbitDotBottomLeft: {
    bottom: ORBIT_SIZE * 0.25,
    left: ORBIT_SIZE * 0.1,
  },
  orbitDotBottomRight: {
    bottom: ORBIT_SIZE * 0.25,
    right: ORBIT_SIZE * 0.1,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  brand: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 24,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0D9488",
  },
  errorRoot: { flex: 1, backgroundColor: colors.background },
  errorIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 36,
    fontWeight: "700",
    color: "#B91C1C",
    lineHeight: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 12,
  },
  errorHint: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
});
