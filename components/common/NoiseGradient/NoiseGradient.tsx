import { LinearGradient, LinearGradientProps } from "expo-linear-gradient";
import React from "react";
import { Image, ImageSourcePropType, StyleSheet, View, ViewStyle } from "react-native";

interface NoiseGradientProps {
  colors: LinearGradientProps["colors"];
  locations?: LinearGradientProps["locations"];
  start?: LinearGradientProps["start"];
  end?: LinearGradientProps["end"];
  noiseSource: ImageSourcePropType;
  noiseOpacity?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const NoiseGradient = ({
  colors,
  locations,
  start = { x: 0, y: 0 },
  end = { x: 0, y: 1 },
  noiseSource,
  noiseOpacity = 0.12,
  style,
  children,
}: NoiseGradientProps) => {
  return (
    <View style={style}>
      <LinearGradient
        colors={colors}
        locations={locations}
        start={start}
        end={end}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Image
          source={noiseSource}
          style={[StyleSheet.absoluteFill, { opacity: noiseOpacity }]}
          resizeMode="repeat"
        />
      </View>
      {children}
    </View>
  );
};
