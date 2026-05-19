import React from "react";
import { View, type ViewStyle } from "react-native";
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

const Section = ({ style, children }: { style?: ViewStyle; children?: React.ReactNode }) => (
  <View style={[{ marginBottom: 28 }, style]}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <Block width={14} height={14} borderRadius={4} />
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

/** Layout compuesto para formularios (reemplaza ShimmerSkeleton) */
export const SkeletonLayout = Object.assign(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  { Block, Line, Circle, Section, FieldRow },
);
