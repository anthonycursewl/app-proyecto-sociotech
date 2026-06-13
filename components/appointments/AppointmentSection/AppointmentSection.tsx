import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/common/SText";

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

interface AppointmentSectionProps {
  title: string;
  icon: IconComponent;
  children: React.ReactNode;
}

export function AppointmentSection({ title, icon: Icon, children }: AppointmentSectionProps) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrap}>
          <Icon size={17} color="#0D9488" strokeWidth={2.5} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
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
    gap: 10,
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
    letterSpacing: -0.1,
  },
});
