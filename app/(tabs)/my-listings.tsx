import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { usePropertyStore } from "@/stores/propertyStore";
import { useAuthStore } from "@/stores/authStore";
import { PropertyList } from "@/components/PropertyList";
import { Property } from "@/types";
import { Plus, Home } from "lucide-react-native";
import { Button } from "@/components/ui/Button";

export default function MyListingsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { properties, fetchUserProperties, isLoading } = usePropertyStore();

  useEffect(() => {
    if (user) {
      fetchUserProperties(user.uid);
    }
  }, [user]);

  const handlePropertyPress = (property: Property) => {
    router.push(`/property/${property.id}`);
  };

  const handleAddProperty = () => {
    router.push("/add-property");
  };

  const handleEditProperty = (property: Property) => {
    router.push(`/edit-property/${property.id}`);
  };

  const userProperties = properties.filter(
    (property) => property.userId === user?.uid
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Properties</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddProperty}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a6fa5" />
        </View>
      ) : userProperties.length > 0 ? (
        <PropertyList 
          properties={userProperties} 
          onPropertyPress={handlePropertyPress}
          onEditProperty={handleEditProperty}
          showEditButton
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Home size={64} color="#e0e6ed" />
          <Text style={styles.emptyTitle}>No properties listed</Text>
          <Text style={styles.emptyText}>
            Start listing your properties for others to discover
          </Text>
          <Button 
            onPress={handleAddProperty}
            style={styles.addPropertyButton}
          >
            Add Property
          </Button>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4a6fa5",
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 24,
    textAlign: "center",
  },
  addPropertyButton: {
    paddingHorizontal: 24,
  },
});