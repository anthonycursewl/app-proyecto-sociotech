import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  chipActive: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipText: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  countText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  countTextActive: {
    color: "#FFFFFF",
  },
});
