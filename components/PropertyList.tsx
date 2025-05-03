import React from "react";
import { FlatList, StyleSheet, View, Text, TouchableOpacity, ViewStyle } from "react-native";
import { PropertyCard } from "./PropertyCard";
import { Property } from "@/types";
import { Edit } from "lucide-react-native";

interface PropertyListProps {
  properties: Property[];
  onPropertyPress: (property: Property) => void;
  onEditProperty?: (property: Property) => void;
  showEditButton?: boolean;
  contentContainerStyle?: ViewStyle;
}

export function PropertyList({ 
  properties, 
  onPropertyPress, 
  onEditProperty,
  showEditButton = false,
  contentContainerStyle 
}: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No properties found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={properties}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.itemContainer}>
          <PropertyCard 
            property={item} 
            onPress={() => onPropertyPress(item)} 
          />
          {showEditButton && onEditProperty && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => onEditProperty(item)}
            >
              <Edit size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}
      contentContainerStyle={[styles.listContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  itemContainer: {
    position: "relative",
  },
  editButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#4a6fa5",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
  },
});