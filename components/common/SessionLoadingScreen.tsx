import { Text } from "@/components/common/SText";
import { colors } from "@/shared/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const SHIMMER_WIDTH = 80;

export function SessionLoadingScreen() {
  const shimmer = useSharedValue(-SHIMMER_WIDTH);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(200, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(-SHIMMER_WIDTH, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, [shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value }],
  }));

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
        <View style={styles.center}>
          <View style={styles.logoWrap}>
            <Image
              source={require("@/assets/logo/LOGO_DOC_2_no_bg.png")}
              style={styles.logo}
              resizeMode="contain"
              tintColor="#000000"
            />
            <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
              <LinearGradient
                colors={["transparent", "rgba(255,255,255,0.4)", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
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
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 8,
  },
  logo: {
    width: 300,
    height: 87,
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SHIMMER_WIDTH,
    height: "100%",
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
