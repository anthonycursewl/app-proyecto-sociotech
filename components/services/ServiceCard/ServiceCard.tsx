import { ChevronRight, Clock, Stethoscope, Trash2 } from "lucide-react-native";
import React from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { styles } from "./ServiceCard.styles";

export interface ServiceData {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  price: number;
  category?: string;
  isActive?: boolean;
}

interface ServiceCardProps {
  service: ServiceData;
  onPress?: () => void;
  onDelete?: (service: ServiceData) => void;
  canDelete?: boolean;
}

export const ServiceCard = ({ service, onPress, onDelete, canDelete }: ServiceCardProps) => {
  const isActive = service.isActive !== false;
  const showDelete = !!canDelete && isActive && !!onDelete;

  const durationText =
    service.durationMin >= 60
      ? `${Math.floor(service.durationMin / 60)}h${service.durationMin % 60 ? ` ${service.durationMin % 60}m` : ""}`
      : `${service.durationMin} min`;

  const handleDelete = () => {
    if (!onDelete) return;
    Alert.alert(
      "Desactivar servicio",
      `¿Desactivar "${service.name}"? Los doctores dejarán de poder asociarse a este servicio, pero las citas existentes se mantendrán. Podrás reactivarlo después desde el detalle.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desactivar",
          style: "destructive",
          onPress: () => onDelete(service),
        },
      ],
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.iconBlock}>
        <Stethoscope size={16} color="#0D9488" strokeWidth={2} />
      </View>

      <View style={styles.content}>
        {service.category ? (
          <View style={styles.topRow}>
            <Text style={styles.eyebrow} numberOfLines={1}>
              {service.category.toUpperCase()}
            </Text>
          </View>
        ) : null}

        <Text style={styles.name} numberOfLines={2}>
          {service.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {service.description}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.bottomLeft}>
            <View style={styles.durationPill}>
              <Clock size={12} color="#0D9488" strokeWidth={2.5} />
              <Text style={styles.durationText}>{durationText}</Text>
            </View>
            <View style={[styles.statusPill, isActive ? styles.statusPillActive : styles.statusPillInactive]}>
              <View style={[styles.statusDot, isActive ? styles.statusDotActive : styles.statusDotInactive]} />
              <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                {isActive ? "Activo" : "Inactivo"}
              </Text>
            </View>
          </View>

          <View style={styles.actionHint}>
            <Text style={styles.actionHintText}>Ver detalle</Text>
            <ChevronRight size={14} color="#94A3B8" strokeWidth={2.5} />
          </View>
        </View>
      </View>

      {showDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.6}
        >
          <Trash2 size={15} color="#EF4444" strokeWidth={2} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};
