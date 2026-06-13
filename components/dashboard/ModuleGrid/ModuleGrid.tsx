import { BriefcaseMedical, CalendarCheck, HeartPulse, Shield } from "lucide-react-native";
import React from "react";
import { ScrollView, View } from "react-native";
import { Text } from "@/components/common/SText";
import { ModuleCard } from "../ModuleCard/ModuleCard";
import { styles } from "./ModuleGrid.styles";
import { useModuleGrid, CategorySection } from "./useModuleGrid";

// Mapeo estático de los iconos requeridos para los encabezados de categoría
const HEADER_ICON_MAP: Record<string, React.ComponentType<any>> = {
  CalendarCheck: CalendarCheck,
  HeartPulse: HeartPulse,
  BriefcaseMedical: BriefcaseMedical,
  Shield: Shield,
};

const CategoryHeader = React.memo(function CategoryHeader({ section }: { section: CategorySection }) {
  const IconComponent = HEADER_ICON_MAP[section.icon];
  return (
    <View style={styles.categoryHeader}>
      <View style={styles.categoryIconWrap}>
        {IconComponent && (
          <IconComponent size={15} color="#0D9488" strokeWidth={2.5} />
        )}
      </View>
      <Text style={styles.categoryTitle}>{section.title}</Text>
      <View style={styles.categoryDivider} />
    </View>
  );
});

export const ModuleGrid = () => {
  const { sections, handleModulePress } = useModuleGrid();

  if (sections.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No tienes módulos disponibles</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
    >
      {sections.map((section) => (
        <View key={section.id} style={styles.categorySection}>
          <CategoryHeader section={section} />
          <View style={styles.grid}>
            {section.modules.map((module) => (
              <ModuleCard
                key={module.id}
                title={module.title}
                icon={module.icon}
                color={module.color}
                description={module.description}
                onPress={() => handleModulePress(module.id)}
              />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};
