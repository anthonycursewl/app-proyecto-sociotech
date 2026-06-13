import { BottomSheetModal } from "@/components/common/BottomSheetModal";
import { Skeleton } from "@/components/common/Skeleton";
import { Text } from "@/components/common/SText";
import { ServiceData } from "@/components/services/ServiceCard";
import { ServiceDetailResponse, serviceService } from "@/shared/services/service.service";
import { getApiErrorMessage } from "@/shared/errors/apiError";
import { Calendar, Clock, Eye, FileText, Pencil, PowerOff, Power, RotateCcw, Stethoscope, Tag, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface ServiceDetailModalProps {
  visible: boolean;
  service: ServiceData | null;
  onClose: () => void;
  onEdit: (service: ServiceData) => void;
  onChanged: () => void;
  canUpdate: boolean;
  canDelete: boolean;
  readOnly?: boolean;
}

const formatDuration = (minutes: number): string => {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h}h ${m}min` : `${h}h`;
  }
  return `${minutes} min`;
};

const formatDate = (iso: string): string => {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
};

export const ServiceDetailModal = ({
  visible,
  service,
  onClose,
  onEdit,
  onChanged,
  canUpdate,
  canDelete,
  readOnly = false,
}: ServiceDetailModalProps) => {
  const [detail, setDetail] = useState<ServiceDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (visible && service) {
      setDetail(null);
      setLoading(true);
      serviceService
        .getById(service.id)
        .then(setDetail)
        .catch((err) => {
          Alert.alert("Error", getApiErrorMessage(err) || "No se pudo cargar el servicio");
          onClose();
        })
        .finally(() => setLoading(false));
    } else if (!visible) {
      setDetail(null);
    }
  }, [visible, service, onClose]);

  const handleDeactivate = () => {
    if (!detail || !canDelete) return;
    Alert.alert(
      "Desactivar servicio",
      `¿Desactivar "${detail.name}"? Los doctores dejarán de poder asociarse a este servicio, pero las citas existentes se mantendrán.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desactivar",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await serviceService.deactivate(detail.id);
              onChanged();
              onClose();
            } catch (err) {
              Alert.alert("Error", getApiErrorMessage(err) || "No se pudo desactivar el servicio");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleRestore = () => {
    if (!detail || !canUpdate) return;
    Alert.alert("Reactivar servicio", `¿Reactivar "${detail.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Reactivar",
        onPress: async () => {
          setActionLoading(true);
          try {
            await serviceService.restore(detail.id);
            onChanged();
            onClose();
          } catch (err) {
            Alert.alert("Error", getApiErrorMessage(err) || "No se pudo reactivar el servicio");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    if (!detail) return;
    onEdit({
      id: detail.id,
      name: detail.name,
      description: detail.description ?? "",
      durationMin: detail.durationMin,
      price: detail.price ?? 0,
      isActive: detail.isActive,
    });
  };

  const isActive = detail?.isActive ?? false;

  return (
    <BottomSheetModal visible={visible} onClose={onClose} height={0.78}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Eye size={18} color="#0D9488" strokeWidth={2.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Detalle del Servicio</Text>
            <Text style={styles.subtitle}>
              {service ? service.name : "Cargando..."}
            </Text>
          </View>
        </View>

        {loading || !detail ? (
          <View style={styles.skeletonContainer}>
            {/* Hero card: matches heroCard (padding 18, borderRadius 16) */}
            <View style={styles.skeletonHeroCard}>
              {/* heroTop row: heroIcon 44x44 (left) + statusPill (right) */}
              <View style={styles.skeletonHeroTop}>
                <Skeleton width={44} height={44} borderRadius={12} style={styles.skeletonHeroIcon} />
                <Skeleton width={72} height={18} borderRadius={999} />
              </View>
              {/* heroName: 20px font, weight 800, marginBottom 6, lineHeight ~22 */}
              <Skeleton width="78%" height={20} borderRadius={6} style={{ marginBottom: 6 }} />
              {/* heroDescription: 14px font, lineHeight 20, two lines for typical content */}
              <Skeleton width="100%" height={14} borderRadius={4} style={{ marginBottom: 4 }} />
              <Skeleton width="62%" height={14} borderRadius={4} />
            </View>

            {/* statsRow: matches statsRow (paddingV 14, paddingH 16, borderRadius 14) */}
            <View style={styles.skeletonStatsRow}>
              {/* First stat block: 30x30 icon + label + value */}
              <View style={styles.skeletonStatBlock}>
                <Skeleton width={30} height={30} borderRadius={9} />
                <View style={styles.skeletonStatText}>
                  <Skeleton width={48} height={11} borderRadius={4} />
                  <Skeleton width={36} height={15} borderRadius={4} style={{ marginTop: 1 }} />
                </View>
              </View>
              {/* statDivider: 1x28 with marginHorizontal 8 */}
              <View style={styles.skeletonStatDivider} />
              {/* Second stat block: same as first */}
              <View style={styles.skeletonStatBlock}>
                <Skeleton width={30} height={30} borderRadius={9} />
                <View style={styles.skeletonStatText}>
                  <Skeleton width={56} height={11} borderRadius={4} />
                  <Skeleton width={20} height={15} borderRadius={4} style={{ marginTop: 1 }} />
                </View>
              </View>
            </View>

            {/* Section: Identificador (padding 14, borderRadius 14) */}
            <View style={styles.skeletonSection}>
              {/* sectionHeader: 14px icon (gap 7) + sectionTitle (11px), marginBottom 10 */}
              <View style={styles.skeletonSectionHeader}>
                <Skeleton width={14} height={14} borderRadius={3} />
                <Skeleton width={92} height={11} borderRadius={4} />
              </View>
              {/* idText: 12px monospace, one line */}
              <Skeleton width="100%" height={12} borderRadius={4} />
            </View>

            {/* Section: Auditoría (padding 14, borderRadius 14) */}
            <View style={styles.skeletonSection}>
              <View style={styles.skeletonSectionHeader}>
                <Skeleton width={14} height={14} borderRadius={3} />
                <Skeleton width={68} height={11} borderRadius={4} />
              </View>
              {/* auditRow: 12 gap, two auditItems (24x24 icon gap 8 + label 10 + value 13) */}
              <View style={styles.skeletonAuditRow}>
                <View style={styles.skeletonAuditItem}>
                  <Skeleton width={24} height={24} borderRadius={7} />
                  <View style={{ flex: 1 }}>
                    <Skeleton width={44} height={10} borderRadius={3} />
                    <Skeleton width={64} height={13} borderRadius={4} style={{ marginTop: 3 }} />
                  </View>
                </View>
                <View style={styles.skeletonAuditItem}>
                  <Skeleton width={24} height={24} borderRadius={7} />
                  <View style={{ flex: 1 }}>
                    <Skeleton width={56} height={10} borderRadius={3} />
                    <Skeleton width={64} height={13} borderRadius={4} style={{ marginTop: 3 }} />
                  </View>
                </View>
              </View>
            </View>

            {/* Actions: matches the loaded action buttons (paddingV 14, borderRadius 14) */}
            {/* Primary action: Editar Servicio (always shown when canUpdate) */}
            <Skeleton width="100%" height={48} borderRadius={14} style={{ marginTop: 8 }} />
            {/* Secondary action: Desactivar or Reactivar (only when canDelete or for inactive) */}
            <Skeleton width="100%" height={48} borderRadius={14} style={{ marginTop: 10 }} />
          </View>
        ) : (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.heroIcon}>
                  <Stethoscope size={22} color="#0D9488" strokeWidth={2} />
                </View>
                <View style={[styles.statusPill, isActive ? styles.statusPillActive : styles.statusPillInactive]}>
                  <View style={[styles.statusDot, isActive ? styles.statusDotActive : styles.statusDotInactive]} />
                  <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                    {isActive ? "Activo" : "Inactivo"}
                  </Text>
                </View>
              </View>
              <Text style={styles.heroName}>{detail.name}</Text>
              {detail.description ? (
                <Text style={styles.heroDescription}>{detail.description}</Text>
              ) : (
                <Text style={styles.heroDescriptionMuted}>Sin descripción</Text>
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBlock}>
                <View style={styles.statIcon}>
                  <Clock size={14} color="#0D9488" strokeWidth={2.5} />
                </View>
                <View>
                  <Text style={styles.statLabel}>Duración</Text>
                  <Text style={styles.statValue}>{formatDuration(detail.durationMin)}</Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBlock}>
                <View style={styles.statIcon}>
                  <Users size={14} color="#0D9488" strokeWidth={2.5} />
                </View>
                <View>
                  <Text style={styles.statLabel}>Doctores</Text>
                  <Text style={styles.statValue}>
                    {detail.doctorIds?.length ?? 0}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Tag size={14} color="#64748B" strokeWidth={2} />
                <Text style={styles.sectionTitle}>Identificador</Text>
              </View>
              <Text style={styles.idText} numberOfLines={1} ellipsizeMode="middle">
                {detail.id}
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FileText size={14} color="#64748B" strokeWidth={2} />
                <Text style={styles.sectionTitle}>Auditoría</Text>
              </View>
              <View style={styles.auditRow}>
                <View style={styles.auditItem}>
                  <View style={styles.auditIcon}>
                    <Calendar size={12} color="#64748B" strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.auditLabel}>Creado</Text>
                    <Text style={styles.auditValue}>{formatDate(detail.createdAt)}</Text>
                  </View>
                </View>
                <View style={styles.auditItem}>
                  <View style={styles.auditIcon}>
                    <RotateCcw size={12} color="#64748B" strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.auditLabel}>Actualizado</Text>
                    <Text style={styles.auditValue}>{formatDate(detail.updatedAt)}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              {!readOnly && canUpdate && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonPrimary, actionLoading && styles.actionButtonDisabled]}
                  onPress={handleEdit}
                  disabled={actionLoading}
                  activeOpacity={0.85}
                >
                  <Pencil size={16} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.actionButtonPrimaryText}>Editar Servicio</Text>
                </TouchableOpacity>
              )}

              {!readOnly && isActive && canDelete && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonDanger, actionLoading && styles.actionButtonDisabled]}
                  onPress={handleDeactivate}
                  disabled={actionLoading}
                  activeOpacity={0.85}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <PowerOff size={16} color="#EF4444" strokeWidth={2.5} />
                  )}
                  <Text style={styles.actionButtonDangerText}>Desactivar</Text>
                </TouchableOpacity>
              )}

              {!readOnly && !isActive && canUpdate && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSuccess, actionLoading && styles.actionButtonDisabled]}
                  onPress={handleRestore}
                  disabled={actionLoading}
                  activeOpacity={0.85}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#047857" />
                  ) : (
                    <Power size={16} color="#047857" strokeWidth={2.5} />
                  )}
                  <Text style={styles.actionButtonSuccessText}>Reactivar Servicio</Text>
                </TouchableOpacity>
              )}

              {readOnly && (
                <View style={styles.readOnlyNote}>
                  <Eye size={14} color="#94A3B8" strokeWidth={2} />
                  <Text style={styles.readOnlyText}>
                    Solo tienes permisos de visualización para este servicio.
                  </Text>
                </View>
              )}

              {!readOnly && !canUpdate && !canDelete && (
                <View style={styles.readOnlyNote}>
                  <Eye size={14} color="#94A3B8" strokeWidth={2} />
                  <Text style={styles.readOnlyText}>
                    Solo tienes permisos de lectura para este servicio.
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F0FDFA",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  subtitle: { fontSize: 13, color: "#64748B", marginTop: 2, fontWeight: "500" },

  skeletonContainer: { gap: 12 },
  skeletonHeroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  skeletonHeroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  skeletonHeroIcon: {
    // 44x44 heroIcon shape; the Skeleton component takes width/height directly.
  },
  skeletonStatsRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  skeletonStatBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  skeletonStatText: {
    flexDirection: "column",
  },
  skeletonStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 8,
  },
  skeletonSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  skeletonSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },
  skeletonAuditRow: {
    flexDirection: "row",
    gap: 12,
  },
  skeletonAuditItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0FDFA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCFBEF",
  },
  heroName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  heroDescription: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    fontWeight: "500",
  },
  heroDescriptionMuted: {
    fontSize: 14,
    color: "#94A3B8",
    lineHeight: 20,
    fontStyle: "italic",
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillActive: { backgroundColor: "#ECFDF5" },
  statusPillInactive: { backgroundColor: "#F1F5F9" },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusDotActive: { backgroundColor: "#10B981" },
  statusDotInactive: { backgroundColor: "#94A3B8" },
  statusText: { fontSize: 10.5, fontWeight: "700", letterSpacing: 0.3 },
  statusTextActive: { color: "#047857" },
  statusTextInactive: { color: "#64748B" },

  statsRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  statBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#F0FDFA",
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: { fontSize: 11, color: "#94A3B8", fontWeight: "600", letterSpacing: 0.2 },
  statValue: { fontSize: 15, color: "#0F172A", fontWeight: "700", marginTop: 1 },
  statDivider: { width: 1, height: 28, backgroundColor: "#E2E8F0", marginHorizontal: 8 },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  idText: {
    fontSize: 12,
    color: "#475569",
    fontFamily: "monospace",
    fontWeight: "500",
  },
  auditRow: {
    flexDirection: "row",
    gap: 12,
  },
  auditItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  auditIcon: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  auditLabel: { fontSize: 10, color: "#94A3B8", fontWeight: "600", letterSpacing: 0.2 },
  auditValue: { fontSize: 13, color: "#0F172A", fontWeight: "600", marginTop: 1 },

  actions: { gap: 10, marginTop: 8, marginBottom: 8 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionButtonDisabled: { opacity: 0.6 },
  actionButtonPrimary: {
    backgroundColor: "#4CB1B1",
    shadowColor: "#4CB1B1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  actionButtonPrimaryText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.2 },
  actionButtonDanger: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  actionButtonDangerText: { fontSize: 14, fontWeight: "700", color: "#EF4444" },
  actionButtonSuccess: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  actionButtonSuccessText: { fontSize: 14, fontWeight: "700", color: "#047857" },

  readOnlyNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  readOnlyText: { flex: 1, fontSize: 12, color: "#94A3B8", fontWeight: "500" },
});
