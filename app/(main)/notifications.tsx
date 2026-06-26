import { BottomSheetModal } from "@/components/common/BottomSheetModal";
import { ListErrorState } from "@/components/common/ListErrorState";
import { ServiceCardSkeleton } from "@/components/common/Skeleton";
import { Text } from "@/components/common/SText";
import { NotificationItem, notificationService } from "@/shared/services/notification.service";
import { colors } from "@/shared/theme/colors";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AlertCircle, Bell, Calendar, CalendarCheck, CheckCircle, ChevronLeft, FileText, Key, Lock, LogIn, Mail, MailCheck, MailOpen, RefreshCw, Sparkles, UserPlus, XCircle } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const PAGE_LIMIT = 20;

const formatDateTime = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
};

const EVENT_ICONS: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth: number }>> = {
  LOGIN_DETECTED: LogIn,
  EMAIL_VERIFICATION: MailCheck,
  PASSWORD_CHANGED: Lock,
  PASSWORD_RESET: Key,
  APPOINTMENT_REMINDER: Calendar,
  APPOINTMENT_CONFIRMED: CalendarCheck,
  APPOINTMENT_CANCELLED: XCircle,
  APPOINTMENT_SCHEDULED: Calendar,
  APPOINTMENT_COMPLETED: CheckCircle,
  PRESCRIPTION_CREATED: FileText,
  USER_REGISTERED: UserPlus,
  SYSTEM_ALERT: AlertCircle,
  WELCOME: Sparkles,
};

const getEventIcon = (eventType: string) => {
  const normalizedEventType = eventType?.toUpperCase?.() ?? "";
  return EVENT_ICONS[normalizedEventType] ?? Bell;
};

const getEventColor = (eventType: string): string => {
  const normalizedEventType = eventType?.toLowerCase?.() ?? "";
  if (normalizedEventType.includes("cancelled")) return "#EF4444";
  if (normalizedEventType.includes("confirmed")) return "#10B981";
  return "#4CB1B1";
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  LOGIN_DETECTED: "Inicio de sesión detectado",
  EMAIL_VERIFICATION: "Verificación de correo electrónico",
  PASSWORD_CHANGED: "Cambio de contraseña",
  PASSWORD_RESET: "Restablecimiento de contraseña",
  APPOINTMENT_REMINDER: "Recordatorio de cita",
  APPOINTMENT_CONFIRMED: "Cita confirmada",
  APPOINTMENT_CANCELLED: "Cita cancelada",
  APPOINTMENT_SCHEDULED: "Cita programada",
  APPOINTMENT_COMPLETED: "Cita completada",
  PRESCRIPTION_CREATED: "Receta creada",
  USER_REGISTERED: "Usuario registrado",
  SYSTEM_ALERT: "Alerta del sistema",
  WELCOME: "Bienvenido",
};

const translateEventType = (eventType: string): string => {
  return EVENT_TYPE_LABELS[eventType] ?? eventType.replace(/_/g, " ");
};

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const cursorRef = useRef(nextCursor);
  cursorRef.current = nextCursor;

  const fetchNotifications = useCallback(async (cursor?: string) => {
    try {
      const params: { cursor?: string; limit: number } = { limit: PAGE_LIMIT };
      if (cursor) params.cursor = cursor;
      const response = await notificationService.getAll(params);
      const mapped = response.data;
      if (cursor) {
        setNotifications((prev) => [...prev, ...mapped]);
      } else {
        setNotifications(mapped);
      }
      setNextCursor(response.nextCursor);
      setError(null);
    } catch (err: any) {
      setError(err.message || "No se pudieron cargar las notificaciones");
    }
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    await fetchNotifications();
    setLoading(false);
  }, [fetchNotifications]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const loadMore = useCallback(async () => {
    if (!cursorRef.current || loadingMore) return;
    setLoadingMore(true);
    await fetchNotifications(cursorRef.current);
    setLoadingMore(false);
  }, [loadingMore, fetchNotifications]);

  const openDetail = useCallback((item: NotificationItem) => {
    setSelectedNotification(item);
    setDetailModalOpen(true);
  }, []);

  const renderItem = useCallback(({ item }: { item: NotificationItem }) => {
    const Icon = getEventIcon(item.eventType);
    const iconColor = getEventColor(item.eventType);
    const isRead = item.status === "sent";

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => openDetail(item)}>
        <View style={[styles.iconWrap, { backgroundColor: iconColor + "15" }]}>
          <Icon size={18} color={iconColor} strokeWidth={2} />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>
            {isRead ? (
              <MailOpen size={14} color="#94A3B8" strokeWidth={1.8} />
            ) : (
              <Mail size={14} color="#4CB1B1" strokeWidth={1.8} />
            )}
          </View>
          {item.body && (
            <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
          )}
          <View style={styles.cardFooter}>
            <Text style={styles.timestamp}>{formatDateTime(item.createdAt)}</Text>
            <View style={[styles.eventTypeBadge, { backgroundColor: getEventColor(item.eventType) + "20" }]}>
              <Text style={[styles.eventTypeText, { color: getEventColor(item.eventType) }]}>
                {translateEventType(item.eventType)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [openDetail]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={20} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notificaciones</Text>
        </View>
        <View style={styles.list}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={20} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notificaciones</Text>
        </View>
        <ListErrorState message={error} onRetry={loadInitial} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={20} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={refresh} disabled={refreshing}>
          <RefreshCw size={18} color="#64748B" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <FlashList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          notifications.length > 0 ? (
            <Text style={styles.countText}>
              {notifications.length} notificación{notifications.length !== 1 ? "es" : ""}
            </Text>
          ) : null
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={48} color="#bebebeff" strokeWidth={2} />
            <Text style={styles.emptyTitle}>Sin notificaciones</Text>
            <Text style={styles.emptySubtitle}>
              No tienes notificaciones por ahora. Te avisaremos cuando haya novedades.
            </Text>
          </View>
        }
      />

      <BottomSheetModal visible={detailModalOpen} onClose={() => setDetailModalOpen(false)} height={0.7}>
        {selectedNotification && (
          <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.detailHeader}>
              <View style={[styles.detailIconWrap, { backgroundColor: getEventColor(selectedNotification.eventType) + "15" }]}>
                {React.createElement(getEventIcon(selectedNotification.eventType), {
                  size: 24,
                  color: getEventColor(selectedNotification.eventType),
                  strokeWidth: 2,
                })}
              </View>
              <View style={styles.detailHeaderInfo}>
                <Text style={styles.detailTitle}>{selectedNotification.subject}</Text>
                <View style={[styles.detailBadge, { backgroundColor: getEventColor(selectedNotification.eventType) + "20" }]}>
                  <Text style={[styles.detailBadgeText, { color: getEventColor(selectedNotification.eventType) }]}>
                    {translateEventType(selectedNotification.eventType)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Cuerpo</Text>
              <Text style={styles.detailBodyText}>
                {selectedNotification.body
                  ? selectedNotification.body.slice(0, 200) + (selectedNotification.body.length > 200 ? "..." : "")
                  : "Sin contenido adicional."}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Destinatario</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Nombre</Text>
                <Text style={styles.detailValue}>{selectedNotification.recipientName ?? "—"}</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{selectedNotification.recipientEmail}</Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Estado</Text>
              <View style={styles.statusRow}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: "#10B981" },
                ]} />
                <Text style={styles.detailValue}>
                  Procesada
                </Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Fechas</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Creada</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedNotification.createdAt).toLocaleString("es-ES")}
                </Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Enviada</Text>
                <Text style={styles.detailValue}>
                  {selectedNotification.sentAt
                    ? new Date(selectedNotification.sentAt).toLocaleString("es-ES")
                    : "—"}
                </Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Identificador</Text>
              <Text style={styles.detailIdText} numberOfLines={1} ellipsizeMode="middle">
                {selectedNotification.id}
              </Text>
            </View>

            {selectedNotification.errorMessage && (
              <View style={styles.detailErrorSection}>
                <Text style={styles.detailErrorTitle}>Error</Text>
                <Text style={styles.detailErrorText}>{selectedNotification.errorMessage}</Text>
              </View>
            )}
          </ScrollView>
        )}
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  list: { padding: 16 },
  countText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    fontWeight: "500",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8EDF2",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardContent: { flex: 1 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  subject: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginRight: 8,
  },
  body: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timestamp: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
  eventTypeBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  eventTypeText: {
    fontSize: 9,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "none",
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 240,
  },

  detailScroll: { flex: 1, padding: 0  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 10,
  },
  detailIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  detailHeaderInfo: { flex: 1 },
  detailTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
    lineHeight: 22,
  },
  detailBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  detailBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "capitalize",
  },
  detailSection: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },
  detailSectionTitle: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  detailBodyText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 12,
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#E8EDF2",
    marginVertical: 6,
  },
  detailIdText: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "monospace",
    fontWeight: "500",
  },
  detailErrorSection: {
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#EF4444",
  },
  detailErrorTitle: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  detailErrorText: {
    fontSize: 12,
    color: "#B91C1C",
    lineHeight: 18,
    fontWeight: "500",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
