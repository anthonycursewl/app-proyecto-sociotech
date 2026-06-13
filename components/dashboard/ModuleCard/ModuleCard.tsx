import { Calendar, CalendarClock, ClipboardList, FileBarChart, FileText, MoveUpRight, Shield, ShieldCheck, Stethoscope, User, UserCog, UserPen, Users } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText";
import { styles } from "./ModuleCard.styles";

// Mapeo estático de los iconos requeridos por las tarjetas
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Calendar: Calendar,
  CalendarClock: CalendarClock,
  Users: Users,
  UserPen: UserPen,
  FileText: FileText,
  ClipboardList: ClipboardList,
  Stethoscope: Stethoscope,
  User: User,
  UserCog: UserCog,
  Shield: Shield,
  FileBarChart: FileBarChart,
  ShieldCheck: ShieldCheck,
  MoveUpRight: MoveUpRight,
};

interface ModuleCardProps {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
  description?: string;
}

export const ModuleCard = React.memo(function ModuleCard({
  title,
  icon,
  color,
  onPress,
  description,
}: ModuleCardProps) {
  const IconComponent = ICON_MAP[icon];
  const ArrowIcon = ICON_MAP["MoveUpRight"];

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      style={styles.container} 
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.arrowContainer}>
          {ArrowIcon && <ArrowIcon size={14} color="#1E293B" />}
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.description}>{description}</Text>
        <View style={[styles.iconWrapper, { backgroundColor: `${color}1A` }]}>
          {IconComponent && <IconComponent size={20} color={color} strokeWidth={2.5} />}
        </View>
      </View>
    </TouchableOpacity>
  );
});
