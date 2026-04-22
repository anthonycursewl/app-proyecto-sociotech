import * as LucideIcons from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "./ModuleCard.styles";

interface ModuleCardProps {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
  description?: string;
}

export const ModuleCard = ({ title, icon, color, onPress, description }: ModuleCardProps) => {
  const IconComponent = (LucideIcons as any)[icon];

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      style={styles.container} 
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.arrowContainer}>
          <LucideIcons.MoveUpRight size={14} color="#1E293B" />
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.description}>{description}</Text>
        <View style={[styles.iconWrapper, { backgroundColor: color + "10" }]}>
          {IconComponent && <IconComponent size={20} color={color} strokeWidth={2.5} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};
