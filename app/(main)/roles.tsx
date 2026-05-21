import { ListErrorState } from "@/components/common/ListErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { CreateRoleModal } from "@/components/roles/CreateRoleModal";
import { RoleCard } from "@/components/roles/RoleCard";
import { RoleDetailModal } from "@/components/roles/RoleDetailModal";
import { RoleFilterType, RolesHeader } from "@/components/roles/RolesHeader";
import { TrashModal } from "@/components/roles/TrashModal";
import { useRolesList } from "@/shared/hooks/useRolesList";
import { usePermissions } from "@/shared/permissions/usePermissions";
import { RoleDetail, RoleListItem, roleService } from "@/shared/services/role.service";
import { colors } from "@/shared/theme/colors";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from "react-native";
import { Text } from "@/components/common/SText";
import { SafeAreaView } from "react-native-safe-area-context";

function RoleRowSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={{ flex: 1, marginLeft: 12, gap: 8 }}>
        <Skeleton width="55%" height={15} borderRadius={6} />
        <Skeleton width="70%" height={12} borderRadius={6} />
        <Skeleton width="40%" height={12} borderRadius={6} />
      </View>
    </View>
  );
}

export default function RolesScreen() {
  const { canAccess } = usePermissions();
  const canCreate = canAccess("roles:create");
  const canUpdate = canAccess("roles:update");
  const canDelete = canAccess("roles:delete");

  const [filter, setFilter] = useState<RoleFilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [trashModalVisible, setTrashModalVisible] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const {
    roles,
    loading,
    refreshing,
    loadingMore,
    hasNext,
    error,
    refresh,
    loadMore,
    reload,
    updateRoleInList,
    removeRoleFromList,
    addRoleToList,
  } = useRolesList();

  const filteredRoles = useMemo(() => {
    let result = roles;

    if (filter === "system") {
      result = result.filter((r) => r.isSystem);
    } else if (filter === "custom") {
      result = result.filter((r) => !r.isSystem);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [roles, filter, searchQuery]);

  const systemCount = roles.filter((r) => r.isSystem).length;
  const customCount = roles.filter((r) => !r.isSystem).length;
  const totalCount =
    filter === "system" ? systemCount : filter === "custom" ? customCount : roles.length;

  const handleCreate = async (name: string, description: string) => {
    setCreating(true);
    try {
      const newRole = await roleService.create({ name, description });
      addRoleToList(newRole);
      Alert.alert("Rol creado", `El rol "${name}" ha sido creado exitosamente`);
    } catch (err: any) {
      const message = err?.data?.message || err?.message || "No se pudo crear el rol";
      Alert.alert("Error", message);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  const handleViewDetail = (roleId: string) => {
    setSelectedRoleId(roleId);
    setDetailModalVisible(true);
  };

  const handleDeleteFromDetail = (deletedRole: RoleDetail) => {
    removeRoleFromList(deletedRole.id);
    setDetailModalVisible(false);
    setSelectedRoleId(null);
    Alert.alert("Rol eliminado", `El rol "${deletedRole.name}" ha sido movido a la papelera`);
  };

  const handleRestoreFromTrash = (role: RoleListItem) => {
    addRoleToList(role);
  };

  const renderItem = ({ item }: { item: RoleListItem }) => (
    <RoleCard
      role={item}
      onViewDetail={() => handleViewDetail(item.id)}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <RolesHeader
          totalCount={0}
          systemCount={0}
          customCount={0}
          filter={filter}
          onSearch={setSearchQuery}
          onFilterChange={setFilter}
          onCreateRole={() => setCreateModalVisible(true)}
          onOpenTrash={() => setTrashModalVisible(true)}
          canCreate={canCreate}
        />
        <View style={styles.list}>
          {Array.from({ length: 6 }).map((_, i) => (
            <RoleRowSkeleton key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error && roles.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <RolesHeader
          totalCount={0}
          systemCount={0}
          customCount={0}
          filter={filter}
          onSearch={setSearchQuery}
          onFilterChange={setFilter}
          onCreateRole={() => setCreateModalVisible(true)}
          onOpenTrash={() => setTrashModalVisible(true)}
          canCreate={canCreate}
        />
        <ListErrorState message={error} onRetry={reload} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <RolesHeader
        totalCount={totalCount}
        systemCount={systemCount}
        customCount={customCount}
        filter={filter}
        onSearch={setSearchQuery}
        onFilterChange={setFilter}
        onCreateRole={() => setCreateModalVisible(true)}
        onOpenTrash={() => setTrashModalVisible(true)}
        canCreate={canCreate}
      />
      <FlatList
        data={filteredRoles}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <Text style={styles.countText}>
            {filteredRoles.length} rol{filteredRoles.length !== 1 ? "es" : ""} mostrado
            {hasNext ? " · desliza para cargar más" : ""}
          </Text>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ paddingVertical: 16 }} color={colors.accent} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "No se encontraron roles con ese criterio"
                : "No hay roles disponibles"}
            </Text>
          </View>
        }
      />

      <CreateRoleModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreate={handleCreate}
        creating={creating}
      />

      <RoleDetailModal
        visible={detailModalVisible}
        roleId={selectedRoleId}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedRoleId(null);
        }}
        onUpdate={updateRoleInList}
        onDelete={handleDeleteFromDetail}
        canEdit={canUpdate}
        canDelete={canDelete}
      />

      <TrashModal
        visible={trashModalVisible}
        onClose={() => setTrashModalVisible(false)}
        onRestore={handleRestoreFromTrash}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, paddingTop: 0 },
  countText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    fontWeight: "500",
  },
  skeletonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  emptyContainer: { paddingVertical: 48, alignItems: "center" },
  emptyText: { fontSize: 15, color: colors.textMuted, fontWeight: "500" },
});
