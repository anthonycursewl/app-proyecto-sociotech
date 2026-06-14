import { ListErrorState } from "@/components/common/ListErrorState";
import { Skeleton } from "@/components/common/Skeleton";
import { RolePickerModal } from "@/components/users/RolePickerModal";
import { UserCard } from "@/components/users/UserCard";
import { UserStatusFilter, UsersHeader } from "@/components/users/UsersHeader";
import { useUsersList } from "@/shared/hooks/useUsersList";
import { usePermissions } from "@/shared/permissions/usePermissions";
import { AdminUserListItem, userService } from "@/shared/services/user.service";
import { colors } from "@/shared/theme/colors";
import { useAuthStore } from "@/shared/zustand/auth/useAuthStore";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Text } from "@/components/common/SText";
import { SafeAreaView } from "react-native-safe-area-context";

function UserRowSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <Skeleton width={44} height={44} borderRadius={12} />
      <View style={{ flex: 1, marginLeft: 12, gap: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Skeleton width="50%" height={14} borderRadius={6} />
            <Skeleton width="60%" height={11} borderRadius={6} />
          </View>
          <Skeleton width={50} height={20} borderRadius={8} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Skeleton width={70} height={22} borderRadius={7} />
          <View style={{ flex: 1 }} />
          <Skeleton width={40} height={24} borderRadius={12} />
          <Skeleton width={50} height={26} borderRadius={8} style={{ marginLeft: 6 }} />
        </View>
      </View>
    </View>
  );
}

function toListItem(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
  createdAt: string;
}): AdminUserListItem {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roleId: user.roleId,
    roleName: user.roleName,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export default function UsersScreen() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const { canAccess } = usePermissions();
  const canToggle = canAccess("users:update");
  const canAssignRole = canAccess("users:assign-role");

  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [roleModalUser, setRoleModalUser] = useState<AdminUserListItem | null>(null);
  const [assigningRole, setAssigningRole] = useState(false);

  const {
    users,
    loading,
    refreshing,
    loadingMore,
    hasNext,
    error,
    refresh,
    loadMore,
    reload,
    updateUserInList,
  } = useUsersList(statusFilter);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.roleName.toLowerCase().includes(q),
    );
  }, [users, searchQuery]);

  const activeCount = users.filter((u) => u.isActive).length;
  const inactiveCount = users.length - activeCount;
  const totalCount = statusFilter === "active" ? activeCount : statusFilter === "inactive" ? inactiveCount : users.length;

  const handleToggleActive = useCallback(async (target: AdminUserListItem) => {
    if (!canToggle || target.id === currentUser?.id) return;

    setTogglingId(target.id);
    try {
      const { user } = await userService.toggleActive(target.id);
      updateUserInList(toListItem(user));
    } catch (err: any) {
      const message = err?.data?.message || err?.message || "No se pudo actualizar el estado";
      Alert.alert("Error", message);
    } finally {
      setTogglingId(null);
    }
  }, [canToggle, currentUser, updateUserInList]);

  const handleAssignRole = async (roleId: string, roleName: string) => {
    if (!roleModalUser || !canAssignRole) return;

    setAssigningRole(true);
    try {
      const { user } = await userService.assignRole(roleModalUser.id, roleId);
      updateUserInList(toListItem(user));
      setRoleModalUser(null);
      Alert.alert("Rol actualizado", `El rol de ${user.firstName} ${user.lastName} ahora es "${roleName}"`);
    } catch (err: any) {
      const message = err?.data?.message || err?.message || "No se pudo actualizar el rol";
      Alert.alert("Error", message);
    } finally {
      setAssigningRole(false);
    }
  };

  const renderItem = useCallback(({ item }: { item: AdminUserListItem }) => (
    <UserCard
      user={item}
      isSelf={item.id === currentUser?.id}
      canToggle={canToggle}
      canAssignRole={canAssignRole}
      toggling={togglingId === item.id}
      assigningRole={assigningRole && roleModalUser?.id === item.id}
      onPress={() => router.push({ pathname: "/admin/users/[id]", params: { id: item.id } })}
      onToggleActive={() => handleToggleActive(item)}
      onChangeRole={() => setRoleModalUser(item)}
    />
  ), [router, handleToggleActive, roleModalUser, assigningRole, togglingId, canToggle, canAssignRole, currentUser]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <UsersHeader
          totalCount={0}
          activeCount={0}
          inactiveCount={0}
          statusFilter={statusFilter}
          onSearch={setSearchQuery}
          onFilterChange={setStatusFilter}
        />
        <View style={styles.list}>
          {Array.from({ length: 6 }).map((_, i) => (
            <UserRowSkeleton key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error && users.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
        <StatusBar style="dark" />
        <UsersHeader
          totalCount={0}
          activeCount={0}
          inactiveCount={0}
          statusFilter={statusFilter}
          onSearch={setSearchQuery}
          onFilterChange={setStatusFilter}
        />
        <ListErrorState message={error} onRetry={reload} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <UsersHeader
        totalCount={totalCount}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        statusFilter={statusFilter}
        onSearch={setSearchQuery}
        onFilterChange={setStatusFilter}
      />
      <FlashList
        data={filteredUsers}
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
            {filteredUsers.length} usuario{filteredUsers.length !== 1 ? "s" : ""} mostrado
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
            <Text style={styles.emptyText}>No se encontraron usuarios</Text>
          </View>
        }
      />

      <RolePickerModal
        visible={!!roleModalUser}
        user={roleModalUser}
        onClose={() => !assigningRole && setRoleModalUser(null)}
        onSelectRole={handleAssignRole}
        selecting={assigningRole}
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
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  emptyContainer: { paddingVertical: 48, alignItems: "center" },
  emptyText: { fontSize: 15, color: colors.textMuted, fontWeight: "500" },
});
