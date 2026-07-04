import { ChevronRight, Mail, Phone } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { styles } from "./DoctorCard.styles";

export interface DoctorData {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
}

interface DoctorCardProps {
  doctor: DoctorData;
  onPress?: () => void;
}

export const DoctorCard = ({ doctor, onPress }: DoctorCardProps) => {
  const initials = doctor.name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("");

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.nameSection}>
            <Text style={styles.name} numberOfLines={1}>{doctor.name}</Text>
            <Text style={styles.specialty}>{doctor.specialty}</Text>
          </View>
          <View style={[styles.statusBadge, doctor.status === "active" ? styles.activeStatus : styles.inactiveStatus]}>
            <Text style={[styles.statusText, doctor.status === "active" ? styles.activeText : styles.inactiveText]}>
              {doctor.status === "active" ? "Activo" : "Inactivo"}
            </Text>
          </View>
        </View>

        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <Mail size={12} color="#94A3B8" strokeWidth={2} />
            <Text style={styles.contactText} numberOfLines={1}>{doctor.email}</Text>
          </View>
          <View style={styles.contactItem}>
            <Phone size={12} color="#94A3B8" strokeWidth={2} />
            <Text style={styles.contactText} numberOfLines={1}>{doctor.phone}</Text>
          </View>
        </View>
      </View>

      <View style={styles.chevron}>
        <ChevronRight size={18} color="#CBD5E1" strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
};