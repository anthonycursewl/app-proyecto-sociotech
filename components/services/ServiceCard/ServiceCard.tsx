import * as LucideIcons from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Tag } from "../../common/Tag";
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
}

export const ServiceCard = ({ service, onPress }: ServiceCardProps) => {
  const IconComponent = LucideIcons.Stethoscope;
  const formattedPrice = service.price.toLocaleString("es-VE", {
    style: "currency",
    currency: "USD",
  });

  const durationText = service.durationMin >= 60
    ? `${Math.floor(service.durationMin / 60)}h${service.durationMin % 60 ? ` ${service.durationMin % 60}min` : ""}`
    : `${service.durationMin}min`;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <IconComponent size={22} color="#4CB1B1" strokeWidth={2.5} />
        </View>
        <View style={styles.statusDot} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{service.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{service.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.tags}>
          <Tag label={durationText} variant="primary" />
          {service.category && (
            <Tag label={service.category} variant="default" />
          )}
        </View>
        <Text style={styles.price}>{formattedPrice}</Text>
      </View>

      <View style={styles.chevronContainer}>
        <LucideIcons.ChevronRight size={18} color="#5187d3ff" strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
};