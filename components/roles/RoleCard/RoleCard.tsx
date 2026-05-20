import { Tag } from "@/components/common/Tag";
import { RoleListItem } from "@/shared/services/role.service";
import * as LucideIcons from "lucide-react-native";
import React from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { styles } from "./RoleCard.styles";

export interface RoleCardProps {
  role: RoleListItem;
  canEdit: boolean;
  canDelete: boolean;
  deleting?: boolean;
  onViewDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const formatRoleName = (name: string) =>
  name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const RoleCard = ({
  role,
  canEdit,
  canDelete,
  deleting,
  onViewDetail,
  onEdit,
  onDelete,
}: RoleCardProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onViewDetail} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <LucideIcons.Shield size={24} color={role.isSystem ? "#64748B" : "#4F46E5"} strokeWidth={2} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.nameSection}>
            <Text style={styles.name} numberOfLines={1}>
              {formatRoleName(role.name)}
            </Text>
            {role.description ? (
              <Text style={styles.description} numberOfLines={2}>
                {role.description}
              </Text>
            ) : null}
          </View>
          <Tag
            label={role.isSystem ? "Sistema" : "Personalizado"}
            variant={role.isSystem ? "default" : "primary"}
          />
        </View>

        <View style={styles.actionsRow}>
          {canEdit && !role.isSystem ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onEdit}
              activeOpacity={0.85}
            >
              <LucideIcons.Pencil size={14} color="#64748B" strokeWidth={2.5} />
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
          ) : null}

          {canDelete && !role.isSystem ? (
            deleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={onDelete}
                activeOpacity={0.85}
              >
                <LucideIcons.Trash2 size={14} color="#EF4444" strokeWidth={2.5} />
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            )
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};
