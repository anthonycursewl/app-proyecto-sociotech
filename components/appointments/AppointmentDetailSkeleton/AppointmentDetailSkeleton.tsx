import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SkeletonLayout } from "@/components/common/Skeleton/SkeletonLayout";
import { ShimmerProvider } from "@/components/common/Skeleton/ShimmerContext";

export const AppointmentDetailSkeleton = () => (
  <ShimmerProvider>
    <View style={styles.headerRowLight}>
      <SkeletonLayout.Block width={38} height={38} borderRadius={10} />
      <SkeletonLayout.Block width={160} height={17} borderRadius={8} />
      <SkeletonLayout.Block width={38} height={38} borderRadius={10} />
    </View>

    <ScrollView
      style={styles.body}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View>
                <SkeletonLayout.Block width={70} height={11} borderRadius={6} />
                <SkeletonLayout.Block width={56} height={34} borderRadius={8} style={{ marginTop: 6 }} />
                <SkeletonLayout.Block width={48} height={11} borderRadius={6} style={{ marginTop: 4 }} />
              </View>
              <View style={styles.heroTimeBlock}>
                <SkeletonLayout.Block width={84} height={28} borderRadius={8} />
                <SkeletonLayout.Block width={56} height={11} borderRadius={6} style={{ marginTop: 6, alignSelf: "flex-end" }} />
              </View>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroStatusRow}>
              <SkeletonLayout.Circle size={8} />
              <SkeletonLayout.Block width={70} height={12} borderRadius={6} style={{ marginLeft: 8 }} />
            </View>

            <SkeletonLayout.Block width="85%" height={18} borderRadius={6} style={{ marginTop: 12 }} />
            <SkeletonLayout.Block width="55%" height={16} borderRadius={6} style={{ marginTop: 6 }} />
          </View>

          <SkeletonLayout.Section>
            <SkeletonLayout.Block width={120} height={16} borderRadius={8} />
            <SkeletonLayout.Block width={80} height={12} borderRadius={6} style={{ marginTop: 8 }} />
          </SkeletonLayout.Section>

          <SkeletonLayout.Section>
            <View style={styles.doctorContent}>
              <SkeletonLayout.Block width="65%" height={16} borderRadius={8} />
              <SkeletonLayout.Block width="45%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
              <View style={styles.contactRow}>
                <SkeletonLayout.Block width={12} height={12} borderRadius={6} />
                <SkeletonLayout.Block width={140} height={12} borderRadius={6} />
              </View>
            </View>
          </SkeletonLayout.Section>

          <SkeletonLayout.Section>
            <SkeletonLayout.Block width="60%" height={16} borderRadius={8} />
            <SkeletonLayout.Block width="90%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
          </SkeletonLayout.Section>

          <SkeletonLayout.Section>
            <SkeletonLayout.Line width="100%" style={{ marginTop: 2 }} />
            <SkeletonLayout.Line width="95%" style={{ marginTop: 8 }} />
            <SkeletonLayout.Line width="70%" style={{ marginTop: 8 }} />
            <View style={styles.notesDivider} />
            <SkeletonLayout.Block width={100} height={10} borderRadius={5} />
            <SkeletonLayout.Line width="85%" style={{ marginTop: 6 }} />
          </SkeletonLayout.Section>

          <View style={styles.footer}>
            <SkeletonLayout.Block width={180} height={10} borderRadius={5} />
            <SkeletonLayout.Block width={140} height={10} borderRadius={5} style={{ marginTop: 4 }} />
          </View>
    </ScrollView>
  </ShimmerProvider>
);

const styles = StyleSheet.create({
  body: { flex: 1, backgroundColor: "transparent" },
  headerRowLight: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
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
  doctorContent: {
    paddingTop: 2,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  notesDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginTop: 14,
    marginBottom: 12,
  },
  footer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    alignItems: "center",
    gap: 4,
    marginBottom: 32,
  },
});
