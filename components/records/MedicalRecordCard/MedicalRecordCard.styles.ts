import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
  },
  typeText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  content: {
    marginBottom: 12,
  },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  patientName: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "600",
  },
  patientId: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
  description: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  doctorText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  specialtyText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "400",
  },
});