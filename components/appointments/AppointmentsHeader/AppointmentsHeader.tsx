import { ChevronLeft } from "lucide-react-native";
import React, { useEffect } from "react";
import { InteractionManager, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AppointmentsHeaderProps {
  title?: string;
  count?: string;
  children?: React.ReactNode;
}

export const AppointmentsHeader = ({ title = "Citas", count, children }: AppointmentsHeaderProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      router.prefetch("/(main)/appointments/create");
    });
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.title}>{title}</Text>
        {count && <Text style={styles.count}>{count}</Text>}
      </View>

      {children && <View style={styles.childrenContainer}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingBottom: 8,
    backgroundColor: "transparent",
  },
  topRow: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  childrenContainer: {
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  count: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
});
