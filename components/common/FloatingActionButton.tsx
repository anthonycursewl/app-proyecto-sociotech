import { Plus } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FloatingActionButtonProps {
  onPress: () => void;
}

export const FloatingActionButton = ({ onPress }: FloatingActionButtonProps) => {
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity style={[styles.fab, { bottom: 24 + insets.bottom }]} onPress={onPress} activeOpacity={0.85}>
      <Plus size={24} color="#FFFFFF" strokeWidth={3} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4CB1B1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4CB1B1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
});
