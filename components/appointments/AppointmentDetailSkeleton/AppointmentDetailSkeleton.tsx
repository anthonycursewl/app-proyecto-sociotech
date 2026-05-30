import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SkeletonLayout } from "@/components/common/Skeleton/SkeletonLayout";
import { colors } from "@/shared/theme/colors";

export const AppointmentDetailSkeleton = () => (
  <SafeAreaView style={styles.outer} edges={["bottom", "left", "right"]}>
    <SkeletonLayout>
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View>
            <SkeletonLayout.Block width={70} height={11} borderRadius={6} />
            <SkeletonLayout.Block width={56} height={32} borderRadius={8} style={{ marginTop: 6 }} />
            <SkeletonLayout.Block width={48} height={11} borderRadius={6} style={{ marginTop: 4 }} />
          </View>
          <View style={styles.heroTimeBlock}>
            <SkeletonLayout.Block width={84} height={28} borderRadius={8} />
            <SkeletonLayout.Block width={56} height={11} borderRadius={6} style={{ marginTop: 6, alignSelf: "flex-end" }} />
          </View>
        </View>
        <View style={styles.heroDivider} />
        <View style={styles.heroStatusRow}>
          <SkeletonLayout.Block width={8} height={8} borderRadius={4} />
          <SkeletonLayout.Block width={70} height={12} borderRadius={6} style={{ marginLeft: 8 }} />
        </View>
        <SkeletonLayout.Block width="85%" height={18} borderRadius={6} style={{ marginTop: 12 }} />
        <SkeletonLayout.Block width="55%" height={16} borderRadius={6} style={{ marginTop: 6 }} />
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <SkeletonLayout.Block width={20} height={20} borderRadius={6} />
          <SkeletonLayout.Block width={110} height={14} borderRadius={6} style={{ marginLeft: 10 }} />
        </View>
        <View style={styles.peopleRow}>
          <View style={styles.peopleColumn}>
            <SkeletonLayout.Circle size={32} style={{ marginBottom: 10 }} />
            <SkeletonLayout.Block width="80%" height={14} borderRadius={6} />
            <SkeletonLayout.Block width="55%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
          </View>
          <View style={styles.peopleColumn}>
            <SkeletonLayout.Circle size={32} style={{ marginBottom: 10 }} />
            <SkeletonLayout.Block width="85%" height={14} borderRadius={6} />
            <SkeletonLayout.Block width="60%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <SkeletonLayout.Block width={20} height={20} borderRadius={6} />
          <SkeletonLayout.Block width={90} height={14} borderRadius={6} style={{ marginLeft: 10 }} />
        </View>
        <SkeletonLayout.Block width="75%" height={15} borderRadius={6} style={{ marginTop: 4 }} />
        <SkeletonLayout.Line width="100%" style={{ marginTop: 10 }} />
        <SkeletonLayout.Line width="90%" style={{ marginTop: 8 }} />
        <View style={styles.priceRow}>
          <SkeletonLayout.Block width={60} height={11} borderRadius={6} />
          <SkeletonLayout.Block width={70} height={16} borderRadius={6} />
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <SkeletonLayout.Block width={20} height={20} borderRadius={6} />
          <SkeletonLayout.Block width={140} height={14} borderRadius={6} style={{ marginLeft: 10 }} />
        </View>
        <View style={styles.reasonBlock}>
          <SkeletonLayout.Line width="100%" />
          <SkeletonLayout.Line width="95%" style={{ marginTop: 8 }} />
          <SkeletonLayout.Line width="70%" style={{ marginTop: 8 }} />
        </View>
      </View>
    </ScrollView>
    </SkeletonLayout>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "transparent" },
  body: { flex: 1, backgroundColor: "transparent" },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 130,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEF0F3",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  heroTimeBlock: {
    alignItems: "flex-end",
  },
  heroDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 16,
  },
  heroStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEF0F3",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  peopleRow: {
    flexDirection: "row",
    gap: 24,
  },
  peopleColumn: {
    flex: 1,
  },
  reasonBlock: {
    paddingTop: 2,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
});
