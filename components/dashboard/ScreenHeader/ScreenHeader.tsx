import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./ScreenHeader.styles";

type LucideIconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightAction?: {
    icon: LucideIconComponent;
    onPress: () => void;
  };
}

export const ScreenHeader = ({ title, subtitle, showBackButton = true, rightAction }: ScreenHeaderProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const IconComponent = rightAction?.icon;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.row}>
        {showBackButton ? (
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {rightAction ? (
          <TouchableOpacity style={styles.actionButton} onPress={rightAction.onPress}>
            {IconComponent && <IconComponent size={22} color="#1E293B" strokeWidth={2} />}
          </TouchableOpacity>
        ) : (
          <View style={styles.actionButtonPlaceholder} />
        )}
      </View>
    </View>
  );
};