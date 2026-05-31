import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  categorySection: {
    marginBottom: 8,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 12,
    gap: 8,
  },
  categoryIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  categoryDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
    marginLeft: 4,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
  },
});
