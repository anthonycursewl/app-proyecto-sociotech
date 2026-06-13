import { AuditFilterModal } from "@/components/audit/AuditFilterModal";
import { AuditHeader } from "@/components/audit/AuditHeader";
import { ListErrorState } from "@/components/common/ListErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { Text } from "@/components/common/SText";
import type { AuditActionFilter, AuditLog, AuditResourceFilter, AuditResultFilter } from "@/shared/entities/AuditLog";
import { useAuditLogs } from "@/shared/hooks/useAuditLogs";
import { colors } from "@/shared/theme/colors";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ban, CalendarX, CheckCircle2, ChevronRight, Clock, Edit, FileSignature, FileText, PlusCircle, Printer, Shield, ShieldOff, Stethoscope, Trash2, UserPen, UserPlus, UserX } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ACTION_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  "users:create": { icon: UserPlus, color: "#22C55E", label: "Creó usuario" },
  "users:update": { icon: UserPen, color: "#3B82F6", label: "Actualizó usuario" },
  "users:delete": { icon: UserX, color: "#EF4444", label: "Eliminó usuario" },
  "users:assign-role": { icon: Shield, color: "#8B5CF6", label: "Cambió rol" },
  "patients:create": { icon: UserPlus, color: "#22C55E", label: "Creó paciente" },
  "patients:create:own": { icon: UserPlus, color: "#22C55E", label: "Se registró" },
  "patients:update": { icon: UserPen, color: "#3B82F6", label: "Actualizó paciente" },
  "patients:update:own": { icon: UserPen, color: "#3B82F6", label: "Actualizó perfil" },
  "patients:delete": { icon: UserX, color: "#EF4444", label: "Eliminó paciente" },
  "roles:create": { icon: Shield, color: "#22C55E", label: "Creó rol" },
  "roles:update": { icon: Shield, color: "#3B82F6", label: "Actualizó rol" },
  "roles:delete": { icon: ShieldOff, color: "#EF4444", label: " eliminó rol" },
  "roles:restore": { icon: Shield, color: "#22C55E", label: "Restauró rol" },
  "roles:permanent-delete": { icon: Trash2, color: "#EF4444", label: "Eliminó rol permanentemente" },
  "services:create": { icon: PlusCircle, color: "#22C55E", label: "Creó servicio" },
  "services:update": { icon: Edit, color: "#3B82F6", label: "Actualizó servicio" },
  "services:delete": { icon: Trash2, color: "#EF4444", label: "Desactivó servicio" },
  "doctors:create": { icon: UserPlus, color: "#22C55E", label: "Creó doctor" },
  "doctors:create:own": { icon: UserPlus, color: "#22C55E", label: "Se registró como doctor" },
  "doctors:update": { icon: UserPen, color: "#3B82F6", label: "Actualizó doctor" },
  "doctors:update:own": { icon: UserPen, color: "#3B82F6", label: "Actualizó perfil doctor" },
  "doctors:delete": { icon: UserX, color: "#EF4444", label: "Eliminó doctor" },
  "appointments:create": { icon: PlusCircle, color: "#22C55E", label: "Creó cita" },
  "appointments:create:own": { icon: PlusCircle, color: "#22C55E", label: "Agendó cita" },
  "appointments:confirm": { icon: CheckCircle2, color: "#3B82F6", label: "Confirmó cita" },
  "appointments:complete": { icon: CheckCircle2, color: "#22C55E", label: "Completó cita" },
  "appointments:no-show": { icon: CalendarX, color: "#F97316", label: "No-show" },
  "appointments:reschedule": { icon: Edit, color: "#F97316", label: "Reprogramó cita" },
  "appointments:cancel": { icon: Ban, color: "#EF4444", label: "Canceló cita" },
  "appointments:delete": { icon: Trash2, color: "#EF4444", label: "Eliminó cita" },
  "medical-records:create": { icon: FileText, color: "#22C55E", label: "Creó historia" },
  "medical-records:update": { icon: Edit, color: "#3B82F6", label: "Actualizó historia" },
  "medical-records:sign": { icon: FileSignature, color: "#8B5CF6", label: "Firmó historia" },
  "medical-records:delete": { icon: Trash2, color: "#EF4444", label: "Eliminó historia" },
  "pdf:prescription": { icon: Printer, color: "#06B6D4", label: "PDF receta" },
  "pdf:clinical-history": { icon: Printer, color: "#06B6D4", label: "PDF historia" },
  "pdf:appointment": { icon: Printer, color: "#06B6D4", label: "PDF cita" },
};

const DEFAULT_CONFIG = { icon: Stethoscope, color: "#64748B", label: "Acción" };

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffH < 24) return `${diffH}h`;
  if (diffD < 7) return `${diffD}d`;
  return d.toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
}

function LogSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <Skeleton width={42} height={42} borderRadius={12} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Skeleton width="55%" height={14} borderRadius={6} />
        <Skeleton width="70%" height={11} borderRadius={6} style={{ marginTop: 4 }} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
          <Skeleton width={16} height={16} borderRadius={4} />
          <Skeleton width="30%" height={10} borderRadius={6} />
        </View>
      </View>
      <Skeleton width={40} height={10} borderRadius={6} />
    </View>
  );
}

export default function AuditScreen() {
  const router = useRouter();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [actionFilter, setActionFilter] = useState<AuditActionFilter>("all");
  const [resourceFilter, setResourceFilter] = useState<AuditResourceFilter>("all");
  const [resultFilter, setResultFilter] = useState<AuditResultFilter>("all");
  const [userId, setUserId] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const {
    logs,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
    reload,
  } = useAuditLogs({
    action: actionFilter,
    resource: resourceFilter,
    result: resultFilter,
    userId: userId || undefined,
    resourceId: resourceId || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const hasActiveFilter = actionFilter !== "all" || resourceFilter !== "all" || resultFilter !== "all"
    || !!userId || !!resourceId || !!from || !!to;

  const clearFilters = () => {
    setActionFilter("all");
    setResourceFilter("all");
    setResultFilter("all");
    setUserId("");
    setResourceId("");
    setFrom("");
    setTo("");
  };

  const renderItem = useCallback(({ item }: { item: AuditLog }) => {
    const config = ACTION_CONFIG[item.action] ?? DEFAULT_CONFIG;
    const IconComponent = config.icon;
    const actorEmail = item.actor?.email ?? "Sistema";
    const resourceLabel = item.resource.type;
    const isFailure = item.result === "failure";

    return (
      <TouchableOpacity
        style={styles.logItem}
        onPress={() => router.push({ pathname: "/audit/[id]", params: { id: item._id } })}
        activeOpacity={0.7}
      >
        <View style={[styles.logIcon, { backgroundColor: (isFailure ? "#EF4444" : config.color) + "12" }]}>
          <IconComponent size={18} color={isFailure ? "#EF4444" : config.color} strokeWidth={2.5} />
        </View>
        <View style={styles.logContent}>
          <Text style={styles.logAction}>{config.label}</Text>
          <Text style={styles.logActor}>{actorEmail}</Text>
          <View style={styles.logMeta}>
            <View style={[styles.resourceBadge, { backgroundColor: config.color + "12" }]}>
              <Text style={[styles.resourceText, { color: config.color }]}>{resourceLabel}</Text>
            </View>
            {isFailure && (
              <View style={styles.failureBadge}>
                <Text style={styles.failureText}>Fallido</Text>
              </View>
            )}
            {item.context.method && (
              <Text style={styles.methodText}>{item.context.method}</Text>
            )}
          </View>
        </View>
        <View style={styles.logRight}>
          <Text style={styles.logTime}>{formatTimestamp(item.timestamp)}</Text>
          <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
        </View>
      </TouchableOpacity>
    );
  }, [router]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <AuditHeader
          totalCount={0}
          hasActiveFilter={false}
          onOpenFilters={() => setFilterModalVisible(true)}
          onClearFilters={clearFilters}
        />
        <View style={styles.list}>
          {Array.from({ length: 8 }).map((_, i) => (
            <LogSkeleton key={i} />
          ))}
        </View>
        <AuditFilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          actionFilter={actionFilter}
          resourceFilter={resourceFilter}
          resultFilter={resultFilter}
          userId={userId}
          resourceId={resourceId}
          from={from}
          to={to}
          onActionFilterChange={setActionFilter}
          onResourceFilterChange={setResourceFilter}
          onResultFilterChange={setResultFilter}
          onUserIdChange={setUserId}
          onResourceIdChange={setResourceId}
          onFromChange={setFrom}
          onToChange={setTo}
          onClearFilters={clearFilters}
        />
      </SafeAreaView>
    );
  }

  if (error && logs.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <AuditHeader
          totalCount={0}
          hasActiveFilter={false}
          onOpenFilters={() => setFilterModalVisible(true)}
          onClearFilters={clearFilters}
        />
        <ListErrorState message={error} onRetry={reload} />
        <AuditFilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          actionFilter={actionFilter}
          resourceFilter={resourceFilter}
          resultFilter={resultFilter}
          userId={userId}
          resourceId={resourceId}
          from={from}
          to={to}
          onActionFilterChange={setActionFilter}
          onResourceFilterChange={setResourceFilter}
          onResultFilterChange={setResultFilter}
          onUserIdChange={setUserId}
          onResourceIdChange={setResourceId}
          onFromChange={setFrom}
          onToChange={setTo}
          onClearFilters={clearFilters}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <AuditHeader
        totalCount={logs.length}
        hasActiveFilter={hasActiveFilter}
        onOpenFilters={() => setFilterModalVisible(true)}
        onClearFilters={clearFilters}
      />
      <FlashList
        data={logs}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ paddingVertical: 16 }} color={colors.accent} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Clock size={48} color={colors.textMuted} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Sin registros</Text>
            <Text style={styles.emptyText}>No hay registros de auditoría con estos filtros</Text>
          </View>
        }
      />
      <AuditFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        actionFilter={actionFilter}
        resourceFilter={resourceFilter}
        resultFilter={resultFilter}
        userId={userId}
        resourceId={resourceId}
        from={from}
        to={to}
        onActionFilterChange={setActionFilter}
        onResourceFilterChange={setResourceFilter}
        onResultFilterChange={setResultFilter}
        onUserIdChange={setUserId}
        onResourceIdChange={setResourceId}
        onFromChange={setFrom}
        onToChange={setTo}
        onClearFilters={clearFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, paddingTop: 0 },
  skeletonCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 8,
  },
  logItem: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 8,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    borderWidth: 1, borderColor: colors.border,
  },
  logIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12 },
  logContent: { flex: 1 },
  logAction: { fontSize: 14, fontWeight: "700", color: colors.textPrimary, marginBottom: 2 },
  logActor: { fontSize: 12, color: colors.textSecondary, fontWeight: "500", marginBottom: 6 },
  logMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  resourceBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  resourceText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 },
  failureBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: "#FEE2E2" },
  failureText: { fontSize: 10, fontWeight: "700", color: "#EF4444" },
  methodText: { fontSize: 10, color: colors.textMuted, fontWeight: "600", fontFamily: "monospace" },
  logRight: { alignItems: "flex-end", gap: 4 },
  logTime: { fontSize: 11, color: colors.textMuted, fontWeight: "500" },
  emptyContainer: { paddingVertical: 48, alignItems: "center", gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  emptyText: { fontSize: 13, color: colors.textMuted, fontWeight: "500", textAlign: "center" },
});
