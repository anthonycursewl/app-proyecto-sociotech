import * as LucideIcons from "lucide-react-native";
import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/common/SText"
import { ModuleCard } from "../ModuleCard/ModuleCard";
import { styles } from './ModuleGrid.styles';
import { useModuleGrid } from './useModuleGrid';

export const ModuleGrid = () => {
  const { modules, handleModulePress } = useModuleGrid();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Servicios</Text>
        <View style={styles.searchActions}>
          <TouchableOpacity style={styles.actionCircle}>
            <LucideIcons.Search size={20} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCircle}>
            <LucideIcons.SlidersHorizontal size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.grid}>
        {modules.map((module) => (
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
    </ScrollView>
  );
};
