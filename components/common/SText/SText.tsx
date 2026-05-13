import React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";

const FONT_MAP: Record<string, string> = {
  light: "SpaceGrotesk-Light",
  regular: "SpaceGrotesk-Regular",
  medium: "SpaceGrotesk-Medium",
  semibold: "SpaceGrotesk-SemiBold",
  bold: "SpaceGrotesk-Bold",
};

export interface STextProps extends RNTextProps {
  weight?: keyof typeof FONT_MAP;
}

export const SText = ({ weight = "regular", style, ...props }: STextProps) => {
  const fontFamily = FONT_MAP[weight];

  return (
    <RNText
      style={[{ fontFamily }, style]}
      {...props}
    />
  );
};
