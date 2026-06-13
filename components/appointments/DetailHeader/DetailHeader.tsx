import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

interface DetailHeaderProps {
  height?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const DetailHeader = ({ height = 260, style, children }: DetailHeaderProps) => (
  <View style={[styles.wrapper, { height }, style]} pointerEvents="box-none">
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
    backgroundColor: "#F8FAFC",
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderTopWidth: 0,
  },
});
