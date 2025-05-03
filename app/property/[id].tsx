import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Linking, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePropertyStore } from "@/stores/propertyStore";
import { useFavoriteStore } from "@/stores/favoriteStore";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { Button } from "@/components/ui/Button";
import { PropertyFeature } from "@/components/PropertyFeature";
import { MapPreview } from "@/components/MapPreview";
import { Heart, Phone, MessageCircle, Trash2, Edit, Bed, Bath, Ruler, Home, MapPin, Calendar, DollarSign } from "lucide-react-native";
import { formatCurrency, formatDate } from "@/utils/formatters";
import Carousel from "react-native-reanimated-carousel";
import { getOptimizedUrl, getResponsiveImageUrl } from "@/utils/cloudinary";

const windowWidth = Dimensions.get("window").width;

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getPropertyById, deleteProperty, isLoading } = usePropertyStore();
  const { user } = useAuthStore();
  const { toggleFavorite, isFavorite } = useFavoriteStore();
  const { startConversation } = useChatStore();
  const [property, setProperty] = useState<any>(null);
  const [isFav, setIsFav] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fetch favorites when component mounts
  useEffect(() => {
    if (user) {
      const { fetchFavorites } = useFavoriteStore.getState();
      fetchFavorites();
    }
  }, [user]);

  useEffect(() => {
    if (id) {
      const fetchedProperty = getPropertyById(id);
      
      // Ensure property has mainImageUrl and imageUrls for compatibility
      if (fetchedProperty) {
        // If mainImageUrl is missing but imageUrl exists, use that
        if (!fetchedProperty.mainImageUrl && fetchedProperty.imageUrl) {
          fetchedProperty.mainImageUrl = fetchedProperty.imageUrl;
        }
        
        // If imageUrls is missing but we have a mainImageUrl or imageUrl, create an array
        if (!fetchedProperty.imageUrls || !fetchedProperty.imageUrls.length) {
          const imageUrl = fetchedProperty.mainImageUrl || fetchedProperty.imageUrl;
          if (imageUrl) {
            fetchedProperty.imageUrls = [imageUrl];
          } else {
            fetchedProperty.imageUrls = [];
          }
        }
      }
      
      setProperty(fetchedProperty);
      
      if (fetchedProperty && user) {
        const favStatus = isFavorite(fetchedProperty.id);
        setIsFav(favStatus);
      }
    }
  }, [id, user]);

  const handleToggleFavorite = () => {
    if (property) {
      toggleFavorite(property);
      setIsFav(!isFav);
    }
  };

  const handleContact = () => {
    if (property?.contactPhone) {
      Linking.openURL(`tel:${property.contactPhone}`);
    }
  };

  const handleMessage = async () => {
    if (!property?.userId) {
      Alert.alert("Error", "Cannot message this property owner");
      return;
    }
    
    if (!user) {
      Alert.alert("Login Required", "Please login to message property owners", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push('/login') }
      ]);
      return;
    }
    
    try {
      // Start/get a conversation and get its ID
      const conversationId = await startConversation(
        property.id,
        property.userId,
        property.title || "Property",
        property.mainImageUrl || property.imageUrl || property.imageUrls?.[0]
      );
      
      // Navigate to the chat screen with the conversation ID
      router.push(`/chat/${conversationId}`);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Could not start conversation");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteProperty(id);
              router.back();
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/edit-property/${id}`);
  };

  // Optimize images using Cloudinary
  const optimizedImages = useMemo(() => {
    if (!property?.imageUrls) return [];
    // Simply return the original URLs without transformation to avoid errors
    return property.imageUrls;
  }, [property?.imageUrls]);

  const optimizedMainImage = useMemo(() => {
    if (!property) return '';
    return property.mainImageUrl || property.imageUrl || '';
  }, [property]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6fa5" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Property not found</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  const isOwner = user && property.userId === user.uid;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {property.imageUrls && property.imageUrls.length > 0 ? (
            <>
              <Carousel
                width={windowWidth}
                height={300}
                data={optimizedImages}
                scrollAnimationDuration={500}
                onSnapToItem={(index) => setActiveImageIndex(index)}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={styles.carouselImage}
                    contentFit="cover"
                    transition={200}
                  />
                )}
              />
              {/* Image Pagination Indicator */}
              {property.imageUrls.length > 1 && (
                <View style={styles.pagination}>
                  {property.imageUrls.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        index === activeImageIndex && styles.paginationDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <Image
              source={{ uri: optimizedMainImage }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          )}
          <TouchableOpacity 
            style={[
              styles.favoriteButton,
              isFav && styles.favoriteButtonActive
            ]}
            onPress={handleToggleFavorite}
          >
            <Heart 
              size={20} 
              color={isFav ? "#fff" : "#4a6fa5"} 
              fill={isFav ? "#4a6fa5" : "transparent"} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.price}>{formatCurrency(property.price)}</Text>
            <Text style={styles.title}>{property.title}</Text>
            <View style={styles.locationContainer}>
              <MapPin size={16} color="#7f8c8d" />
              <Text style={styles.location}>{property.location}</Text>
            </View>
          </View>

          <View style={styles.featuresContainer}>
            <PropertyFeature 
              icon={<Bed size={20} color="#4a6fa5" />}
              value={property.bedrooms}
              label="Bedrooms"
            />
            <PropertyFeature 
              icon={<Bath size={20} color="#4a6fa5" />}
              value={property.bathrooms}
              label="Bathrooms"
            />
            <PropertyFeature 
              icon={<Ruler size={20} color="#4a6fa5" />}
              value={`${property.area} m²`}
              label="Area"
            />
            <PropertyFeature 
              icon={<Home size={20} color="#4a6fa5" />}
              value={property.type}
              label="Type"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Listed on</Text>
                <Text style={styles.detailValue}>
                  {formatDate(property.createdAt)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Property ID</Text>
                <Text style={styles.detailValue}>{property.id.slice(0, 8)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Property Type</Text>
                <Text style={styles.detailValue}>{property.type}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={styles.detailValue}>{property.status || "Available"}</Text>
              </View>
            </View>
          </View>

          {property.latitude && property.longitude && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <MapPreview 
                latitude={property.latitude} 
                longitude={property.longitude}
                style={styles.map}
              />
            </View>
          )}

          {isOwner ? (
            <View style={styles.ownerActions}>
              <Button 
                onPress={handleEdit}
                style={styles.editButton}
                leftIcon={<Edit size={18} color="#fff" />}
              >
                Edit Property
              </Button>
              <Button 
                onPress={handleDelete}
                variant="outline"
                style={styles.deleteButton}
                leftIcon={<Trash2 size={18} color="#e74c3c" />}
              >
                Delete
              </Button>
            </View>
          ) : (
            <View style={styles.contactContainer}>
              <Text style={styles.contactTitle}>Contact Owner</Text>
              <Text style={styles.contactName}>{property.contactName}</Text>
              
              <View style={styles.contactButtons}>
                <Button 
                  onPress={handleContact}
                  style={styles.contactButton}
                  leftIcon={<Phone size={18} color="#fff" />}
                >
                  Call
                </Button>
                <Button 
                  onPress={handleMessage}
                  variant="outline"
                  style={styles.messageButton}
                  leftIcon={<MessageCircle size={18} color="#4a6fa5" />}
                >
                  Message
                </Button>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: "#e74c3c",
    marginBottom: 16,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 300,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
  },
  pagination: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#FFFFFF",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#fff",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  favoriteButtonActive: {
    backgroundColor: "#4a6fa5",
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4a6fa5",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  location: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 4,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#34495e",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  detailItem: {
    width: "50%",
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#2c3e50",
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  contactContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  contactName: {
    fontSize: 16,
    color: "#34495e",
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: "row",
  },
  contactButton: {
    flex: 1,
    marginRight: 8,
  },
  messageButton: {
    flex: 1,
    marginLeft: 8,
  },
  ownerActions: {
    marginBottom: 24,
  },
  editButton: {
    marginBottom: 12,
  },
  deleteButton: {
    borderColor: "#e74c3c",
  },
});