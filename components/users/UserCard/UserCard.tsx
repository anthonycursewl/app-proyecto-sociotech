import { Shield, UserCog } from "lucide-react-native";
import { Tag } from "@/components/common/Tag";
import { AdminUserListItem } from "@/shared/services/user.service";
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
  onPress: () => void;
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
  onPress,
  onToggleActive,
  onChangeRole,
}: UserCardProps) => {
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <TouchableOpacity
      style={[styles.container, isSelf && styles.containerSelf]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.avatar, isSelf && styles.avatarSelf]}>
        <Text style={[styles.avatarText, isSelf && styles.avatarTextSelf]}>{initials}</Text>
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

        <View style={styles.bottomRow}>
          <View style={styles.rolePill}>
            <Shield size={10} color="#64748B" strokeWidth={2} />
            <Text style={styles.rolePillText}>{formatRoleLabel(user.roleName)}</Text>
          </View>
          {isSelf ? (
            <View style={styles.selfBadge}>
              <Text style={styles.selfBadgeText}>Tú</Text>
            </View>
          ) : null}

          {canToggle || canAssignRole ? (
            <View style={styles.tray}>
              {canToggle ? (
                toggling ? (
                  <ActivityIndicator size="small" color="#64748B" />
                ) : (
                  <Switch
                    value={user.isActive}
                    onValueChange={onToggleActive}
                    disabled={isSelf || toggling}
                    trackColor={{ false: "#E2E8F0", true: "#99F6E4" }}
                    thumbColor={user.isActive ? "#0D9488" : "#F8FAFC"}
                  />
                )
              ) : null}

              {canAssignRole ? (
                <TouchableOpacity
                  style={[styles.roleButton, (isSelf || assigningRole) && styles.roleButtonDisabled]}
                  onPress={onChangeRole}
                  disabled={isSelf || assigningRole}
                  activeOpacity={0.85}
                >
                  {assigningRole ? (
                    <ActivityIndicator size="small" color="#475569" />
                  ) : (
                    <>
                      <UserCog size={12} color="#475569" strokeWidth={2.5} />
                      <Text style={styles.roleButtonText}>Rol</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};
