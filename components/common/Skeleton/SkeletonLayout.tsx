import React from "react";
import { View, type ViewStyle } from "react-native";
import { ShimmerProvider } from "./ShimmerContext";
import { Skeleton } from "./Skeleton";

type BlockProps = {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

const Block = ({ width = "100%", height = 16, borderRadius = 8, style }: BlockProps) => (
  <Skeleton width={width} height={height} borderRadius={borderRadius} style={style} />
);

const Line = ({ width = "100%", style }: { width?: number | `${number}%`; style?: ViewStyle }) => (
  <Block width={width} height={14} borderRadius={7} style={style} />
);

const Circle = ({ size = 40, style }: { size?: number; style?: ViewStyle }) => (
  <Block width={size} height={size} borderRadius={size / 2} style={style} />
);

const sectionCardStyle: ViewStyle = {
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  padding: 16,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: "#E2E8F0",
};

const Section = ({ style, children }: { style?: ViewStyle; children?: React.ReactNode }) => (
  <View style={[sectionCardStyle, style]}>
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
      }}
    >
      <Block width={36} height={36} borderRadius={10} />
      <Block width={160} height={16} borderRadius={8} />
    </View>
    {children}
  </View>
);

const FieldRow = ({
  columns = 1,
  style,
  children,
}: {
  columns?: 1 | 2;
  style?: ViewStyle;
  children?: React.ReactNode;
}) => (
  <View style={[{ flexDirection: "row", gap: 12 }, style]}>
    {children ??
      (columns === 2 ? (
        <>
          <View style={{ flex: 1 }}>
            <Block height={44} borderRadius={10} />
          </View>
          <View style={{ flex: 1 }}>
            <Block height={44} borderRadius={10} />
          </View>
        </>
      ) : (
        <View style={{ flex: 1 }}>
          <Block height={44} borderRadius={10} />
        </View>
      ))}
  </View>
);

const LayoutRoot = ({ children }: { children: React.ReactNode }) => (
  <ShimmerProvider>{children}</ShimmerProvider>
);

/** Layout compuesto para formularios; shimmer sincronizado en todos los bloques */
export const SkeletonLayout = Object.assign(LayoutRoot, {
  Block,
  Line,
  Circle,
  Section,
  FieldRow,
});
