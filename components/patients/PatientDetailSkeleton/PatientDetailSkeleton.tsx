import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SkeletonLayout } from "@/components/common/Skeleton/SkeletonLayout";
import { colors } from "@/shared/theme/colors";

interface PatientDetailSkeletonProps {
  loading: boolean;
}

export const PatientDetailSkeleton = ({ loading }: PatientDetailSkeletonProps) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (loading) {
      opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
    } else {
      opacity.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
    }
  }, [loading, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.root, animatedStyle]} pointerEvents="none">
      <SkeletonLayout>
        <View style={styles.headerRow}>
          <SkeletonLayout.Block width={38} height={38} borderRadius={10} />
          <SkeletonLayout.Block width={100} height={17} borderRadius={8} />
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.profileCard}>
          <SkeletonLayout.Circle size={72} />
          <View style={{ alignItems: "center", marginTop: 12 }}>
            <SkeletonLayout.Block width={160} height={18} borderRadius={8} />
          </View>
          <View style={{ alignItems: "center", marginTop: 4 }}>
            <SkeletonLayout.Block width={90} height={12} borderRadius={6} />
          </View>

          <View style={styles.actionRow}>
            <SkeletonLayout.Block width="48%" height={34} borderRadius={10} />
            <SkeletonLayout.Block width="48%" height={34} borderRadius={10} />
          </View>

          <View style={styles.metaRow}>
            <SkeletonLayout.Block width={100} height={11} borderRadius={6} />
            <SkeletonLayout.Block width={120} height={11} borderRadius={6} />
            <SkeletonLayout.Block width={80} height={11} borderRadius={6} />
          </View>
        </View>

        <View style={styles.tabsRow}>
          <SkeletonLayout.Block width={90} height={32} borderRadius={999} />
          <SkeletonLayout.Block width={130} height={32} borderRadius={999} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SkeletonLayout.Block width={36} height={36} borderRadius={10} />
            <SkeletonLayout.Block width={160} height={16} borderRadius={8} />
          </View>
          {[...Array(5)].map((_, i) => (
            <View key={i} style={styles.infoRow}>
              <SkeletonLayout.Block width="35%" height={13} borderRadius={6} />
              <SkeletonLayout.Block width="50%" height={13} borderRadius={6} />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SkeletonLayout.Block width={36} height={36} borderRadius={10} />
            <SkeletonLayout.Block width={160} height={16} borderRadius={8} />
          </View>
          <View style={styles.infoRow}>
            <SkeletonLayout.Block width="35%" height={13} borderRadius={6} />
            <SkeletonLayout.Block width="50%" height={13} borderRadius={6} />
          </View>
        </View>
      </SkeletonLayout>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    zIndex: 100,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEF0F3",
    alignItems: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    marginBottom: 16,
    width: "100%",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEF0F3",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
});
