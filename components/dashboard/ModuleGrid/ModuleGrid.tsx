import * as LucideIcons from "lucide-react-native";
import React from "react";
import { ScrollView, View } from "react-native";
import { Text } from "@/components/common/SText"
import { ModuleCard } from "../ModuleCard/ModuleCard";
import { styles } from './ModuleGrid.styles';
import { useModuleGrid, CategorySection } from './useModuleGrid';

const CategoryHeader = ({ section }: { section: CategorySection }) => {
  const IconComponent = (LucideIcons as any)[section.icon];
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
};

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
