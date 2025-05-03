import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFavoriteStore } from "@/stores/favoriteStore";
import { PropertyList } from "@/components/PropertyList";
import { Property } from "@/types";
import { Heart } from "lucide-react-native";

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, fetchFavorites, isLoading } = useFavoriteStore();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handlePropertyPress = (property: Property) => {
    router.push(`/property/${property.id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a6fa5" />
        </View>
      ) : favorites.length > 0 ? (
        <PropertyList 
          properties={favorites} 
          onPropertyPress={handlePropertyPress}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Heart size={64} color="#e0e6ed" />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyText}>
            Properties you save will appear here
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 8,
    textAlign: "center",
  },
});