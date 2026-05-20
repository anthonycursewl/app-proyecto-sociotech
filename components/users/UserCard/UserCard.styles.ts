import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  containerSelf: {
    borderColor: "#99F6E4",
    backgroundColor: "#F0FDFA",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4F46E5",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  email: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  roleText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  selfBadge: {
    backgroundColor: "#CCFBF1",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  selfBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0D9488",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  roleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  roleButtonDisabled: {
    opacity: 0.5,
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
});
