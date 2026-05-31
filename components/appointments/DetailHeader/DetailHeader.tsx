import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

interface DetailHeaderProps {
  height?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const DetailHeader = ({ height = 260, style, children }: DetailHeaderProps) => (
  <View style={[styles.wrapper, { height }, style]} pointerEvents="box-none">
    <View style={styles.gradientLayer} pointerEvents="none">
      <LinearGradient
        colors={["#0F766E", "#0D9488", "#14B8A6", "#2DD4BF", "rgba(45, 212, 191, 0.35)", "transparent"]}
        locations={[0, 0.18, 0.45, 0.7, 0.88, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.18)", "rgba(255, 255, 255, 0)"]}
        locations={[0, 0.5]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.highlight]}
      />
      <LinearGradient
        colors={["transparent", "rgba(255, 255, 255, 0.06)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.sheen, { height: height * 0.4 }]}
      />
    </View>
    <View style={[styles.innerBorder, { borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }]} />
    {children}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    zIndex: 1,
  },
  gradientLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  highlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 110,
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderTopWidth: 0,
  },
  sheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    opacity: 0.6,
    transform: [{ skewY: "-8deg" }, { translateY: -10 }],
  },
});
