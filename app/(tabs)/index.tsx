import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { usePropertyStore } from "@/stores/propertyStore";
import { PropertyCard } from "@/components/PropertyCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Property } from "@/types";

export default function HomeScreen() {
  const router = useRouter();
  const { properties, fetchProperties, isLoading } = usePropertyStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchProperties();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProperties();
    setRefreshing(false);
  };

  const filteredProperties = selectedCategory === "All" 
    ? properties 
    : properties.filter(property => property.type === selectedCategory);

  const handlePropertyPress = (property: Property) => {
    router.push(`/property/${property.id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Find Your Dream Home</Text>
        <Text style={styles.subtitleText}>Explore properties that match your lifestyle</Text>
      </View>

      <CategoryFilter 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a6fa5" />
        </View>
      ) : (
        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard property={item} onPress={() => handlePropertyPress(item)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No properties found</Text>
              <Text style={styles.emptySubtext}>Try changing your filters or check back later</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  subtitleText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    height: 300,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 8,
    textAlign: "center",
  },
});