import { Tag } from "@/components/common/Tag";
import { AdminUserListItem } from "@/shared/services/user.service";
import * as LucideIcons from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Switch, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { styles } from "./UserCard.styles";

export interface UserCardProps {
  user: AdminUserListItem;
  isSelf: boolean;
  canToggle: boolean;
  canAssignRole: boolean;
  toggling?: boolean;
  assigningRole?: boolean;
  onToggleActive: () => void;
  onChangeRole: () => void;
}

const formatRoleLabel = (roleName: string) =>
  roleName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const UserCard = ({
  user,
  isSelf,
  canToggle,
  canAssignRole,
  toggling,
  assigningRole,
  onToggleActive,
  onChangeRole,
}: UserCardProps) => {
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <View style={[styles.container, isSelf && styles.containerSelf]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.nameSection}>
            <Text style={styles.name} numberOfLines={1}>
              {fullName}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {user.email}
            </Text>
          </View>
          <Tag
            label={user.isActive ? "Activo" : "Inactivo"}
            variant={user.isActive ? "success" : "default"}
          />
        </View>

        <View style={styles.metaRow}>
          <LucideIcons.Shield size={12} color="#64748B" strokeWidth={2} />
          <Text style={styles.roleText}>{formatRoleLabel(user.roleName)}</Text>
          {isSelf ? (
            <View style={styles.selfBadge}>
              <Text style={styles.selfBadgeText}>Tú</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actionsRow}>
          {canToggle ? (
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Cuenta activa</Text>
              {toggling ? (
                <ActivityIndicator size="small" color="#64748B" />
              ) : (
                <Switch
                  value={user.isActive}
                  onValueChange={onToggleActive}
                  disabled={isSelf || toggling}
                  trackColor={{ false: "#E2E8F0", true: "#99F6E4" }}
                  thumbColor={user.isActive ? "#0D9488" : "#F8FAFC"}
                />
              )}
            </View>
          ) : null}

          {canAssignRole ? (
            <TouchableOpacity
              style={[styles.roleButton, (isSelf || assigningRole) && styles.roleButtonDisabled]}
              onPress={onChangeRole}
              disabled={isSelf || assigningRole}
              activeOpacity={0.85}
            >
              {assigningRole ? (
                <ActivityIndicator size="small" color="#64748B" />
              ) : (
                <>
                  <LucideIcons.UserCog size={14} color="#64748B" strokeWidth={2.5} />
                  <Text style={styles.roleButtonText}>Cambiar rol</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};
