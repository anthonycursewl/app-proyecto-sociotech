import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSharedShimmerProgress } from "./ShimmerContext";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = ({
  width = "100%" as any,
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) => {
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const localProgress = useSharedValue(0);
  const sharedProgress = useSharedShimmerProgress();

  useEffect(() => {
    if (sharedProgress || measuredWidth <= 0) return;
    localProgress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
      true,
    );
  }, [measuredWidth, sharedProgress, localProgress]);

  const highlightStyle = useAnimatedStyle(() => {
    const progress = sharedProgress ?? localProgress;
    const travel = measuredWidth * 2;
    const translateX = interpolate(progress.value, [0, 1], [-measuredWidth, travel - measuredWidth]);
    return { transform: [{ translateX }] };
  }, [measuredWidth]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - measuredWidth) > 0.5) setMeasuredWidth(w);
  };

  return (
    <View
      onLayout={onLayout}
      style={[
        { width: width as any, height, borderRadius, backgroundColor: "#E2E8F0", overflow: "hidden" },
        style,
      ]}
    >
      {measuredWidth > 0 && (
        <Animated.View style={[{ width: measuredWidth, height: "100%" }, highlightStyle]}>
          <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.45)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      )}
    </View>
  );
};

export const ServiceCardSkeleton = () => (
  <View
    style={{
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
      <Skeleton width={44} height={44} borderRadius={12} />
      <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
        <Skeleton width="60%" height={15} borderRadius={6} />
        <Skeleton width="40%" height={12} borderRadius={6} />
      </View>
    </View>

    <View style={{ gap: 6, marginBottom: 12 }}>
      <Skeleton width="100%" height={12} borderRadius={6} />
      <Skeleton width="75%" height={12} borderRadius={6} />
    </View>

    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={80} height={24} borderRadius={12} />
      </View>
      <Skeleton width={70} height={18} borderRadius={6} />
    </View>
  </View>
);
