import { ListErrorState } from "@/components/common/ListErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { Text } from "@/components/common/SText";
import type { AuditLog } from "@/shared/entities/AuditLog";
import { auditService } from "@/shared/services/audit.service";
import { colors } from "@/shared/theme/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight, CheckCircle2, Clock, FileText, Globe, User, XCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

function formatDate(ts: string): string {
  return new Date(ts).toLocaleString("es-EC", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, mono && styles.mono]}>{value}</Text>
    </View>
  );
}

function ChangesSection({ changes }: { changes: { old: Record<string, unknown> | null; new: Record<string, unknown> | null } }) {
  const oldKeys = changes.old ? Object.keys(changes.old) : [];
  const newKeys = changes.new ? Object.keys(changes.new) : [];
  const allKeys = [...new Set([...oldKeys, ...newKeys])];

  if (allKeys.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ArrowRight size={16} color={colors.accent} strokeWidth={2.5} />
        <Text style={styles.sectionTitle}>Cambios</Text>
      </View>
      {allKeys.map((key) => (
        <View key={key} style={styles.changeItem}>
          <Text style={styles.changeKey}>{key}</Text>
          <View style={styles.changeValues}>
            <View style={[styles.changeBox, styles.changeOld]}>
              <Text style={styles.changeBoxLabel}>Antes</Text>
              <Text style={styles.changeBoxValue}>
                {changes.old?.[key] !== undefined ? String(changes.old[key]) : "—"}
              </Text>
            </View>
            <ArrowRight size={14} color={colors.textMuted} strokeWidth={2} />
            <View style={[styles.changeBox, styles.changeNew]}>
              <Text style={styles.changeBoxLabel}>Después</Text>
              <Text style={styles.changeBoxValue}>
                {changes.new?.[key] !== undefined ? String(changes.new[key]) : "—"}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export default function AuditDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [log, setLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    auditService.getById(id)
      .then(setLog)
      .catch((err) => setError(err.message || "Error al cargar detalle"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.topRow}>
            <View style={styles.backButton} />
            <Skeleton width={120} height={22} borderRadius={6} />
            <View style={{ width: 38 }} />
          </View>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={styles.skeletonBlock}>
              <Skeleton width="40%" height={12} borderRadius={6} />
              <Skeleton width="80%" height={16} borderRadius={6} style={{ marginTop: 6 }} />
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error || !log) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.topRow}>
            <View style={styles.backButton} />
            <Text style={styles.titleText}>Detalle</Text>
            <View style={{ width: 38 }} />
          </View>
        </View>
        <ListErrorState message={error || "No se encontró el registro"} onRetry={() => router.back()} />
      </SafeAreaView>
    );
  }

  const isFailure = log.result === "failure";

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topRow}>
          <View style={styles.backButton} />
          <Text style={styles.titleText}>Detalle de Auditoría</Text>
          <View style={{ width: 38 }} />
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusCard}>
          {isFailure ? (
            <XCircle size={24} color="#EF4444" strokeWidth={2.5} />
          ) : (
            <CheckCircle2 size={24} color="#22C55E" strokeWidth={2.5} />
          )}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.statusText}>{isFailure ? "Fallido" : "Exitoso"}</Text>
            <Text style={styles.actionText}>{log.action}</Text>
          </View>
          <View style={styles.timestampBadge}>
            <Clock size={12} color={colors.textMuted} strokeWidth={2} />
            <Text style={styles.timestampText}>{formatDate(log.timestamp)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={16} color={colors.accent} strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Actor</Text>
          </View>
          {log.actor ? (
            <>
              <DetailRow label="Email" value={log.actor.email} />
              <DetailRow label="Rol" value={log.actor.roleName} />
              <DetailRow label="User ID" value={log.actor.userId} mono />
            </>
          ) : (
            <Text style={styles.nullText}>Acción del sistema</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={16} color={colors.accent} strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Recurso</Text>
          </View>
          <DetailRow label="Tipo" value={log.resource.type} />
          <DetailRow label="ID" value={log.resource.id} mono />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe size={16} color={colors.accent} strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Contexto</Text>
          </View>
          <DetailRow label="Método" value={log.context.method} mono />
          <DetailRow label="Ruta" value={log.context.path} mono />
          <DetailRow label="IP" value={log.context.ip} mono />
          <DetailRow label="User Agent" value={log.context.userAgent} />
        </View>

        {log.changes && <ChangesSection changes={log.changes} />}

        {log.errorMessage && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <XCircle size={16} color="#EF4444" strokeWidth={2.5} />
              <Text style={[styles.sectionTitle, { color: "#EF4444" }]}>Error</Text>
            </View>
            <Text style={styles.errorText}>{log.errorMessage}</Text>
          </View>
        )}

        <View style={styles.section}>
          <DetailRow label="Event ID" value={log.eventId} mono />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backButton: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: colors.surface,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  titleText: { fontSize: 18, fontWeight: "800", color: colors.textPrimary, letterSpacing: -0.3 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 0, paddingBottom: 32 },
  skeletonBlock: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 12,
  },
  statusCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    borderWidth: 1, borderColor: colors.border,
  },
  statusText: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  actionText: { fontSize: 13, color: colors.textSecondary, fontWeight: "500", marginTop: 2 },
  timestampBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  timestampText: { fontSize: 11, color: colors.textMuted, fontWeight: "500" },
  section: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    borderWidth: 1, borderColor: colors.border,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  detailRow: { marginBottom: 10 },
  detailLabel: { fontSize: 11, color: colors.textMuted, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  detailValue: { fontSize: 14, color: colors.textPrimary, fontWeight: "500" },
  mono: { fontFamily: "monospace", fontSize: 13 },
  nullText: { fontSize: 13, color: colors.textMuted, fontStyle: "italic" },
  changeItem: { marginBottom: 12 },
  changeKey: { fontSize: 12, fontWeight: "700", color: colors.textPrimary, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.3 },
  changeValues: { flexDirection: "row", alignItems: "center", gap: 8 },
  changeBox: { flex: 1, backgroundColor: colors.background, borderRadius: 8, padding: 10 },
  changeOld: { borderWidth: 1, borderColor: "#FECACA" },
  changeNew: { borderWidth: 1, borderColor: "#BBF7D0" },
  changeBoxLabel: { fontSize: 10, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", marginBottom: 4 },
  changeBoxValue: { fontSize: 13, color: colors.textPrimary, fontWeight: "500" },
  errorText: { fontSize: 13, color: "#EF4444", fontWeight: "500", lineHeight: 20 },
});
