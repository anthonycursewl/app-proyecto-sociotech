import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 16,
    paddingRight: 16,
    paddingLeft: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },

  iconBlock: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    alignSelf: "flex-start",
    marginTop: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  content: {
    flex: 1,
    minHeight: 32,
    justifyContent: "space-between",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0D9488",
    letterSpacing: 1.2,
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusPillActive: {
    backgroundColor: "#ECFDF5",
  },
  statusPillInactive: {
    backgroundColor: "#F1F5F9",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotActive: {
    backgroundColor: "#10B981",
  },
  statusDotInactive: {
    backgroundColor: "#94A3B8",
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  statusTextActive: {
    color: "#047857",
  },
  statusTextInactive: {
    color: "#64748B",
  },

  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  description: {
    fontSize: 13.5,
    color: "#64748B",
    lineHeight: 19,
    fontWeight: "500",
    marginTop: 2,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  bottomLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  durationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBEF",
  },
  durationText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#0F766E",
    letterSpacing: 0.1,
  },

  actionHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
  actionHintText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#94A3B8",
    letterSpacing: 0.2,
  },

  deleteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    justifyContent: "center",
    alignItems: "center",
  },
});
