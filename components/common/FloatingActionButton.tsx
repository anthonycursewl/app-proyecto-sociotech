import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import * as LucideIcons from "lucide-react-native";

interface FloatingActionButtonProps {
  onPress: () => void;
}

export const FloatingActionButton = ({ onPress }: FloatingActionButtonProps) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
      <LucideIcons.Plus size={24} color="#FFFFFF" strokeWidth={3} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24,
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
