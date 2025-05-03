import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Property } from "@/types";
import { Bed, Bath, Ruler, MapPin, Image as ImageIcon } from "lucide-react-native";
import { formatCurrency } from "@/utils/formatters";

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
}

const screenWidth = Dimensions.get('window').width;

export function PropertyCard({ property, onPress }: PropertyCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Simple approach: just use the original URL without transformations
  const imageUrl = property.mainImageUrl || property.imageUrl || '';
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        {imageUrl && !imageError ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            onError={() => {
              console.log(`Image load error for property ${property.id}`);
              setImageError(true);
            }}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <ImageIcon size={32} color="#d1d1d1" />
            <Text style={styles.placeholderText}>Image Unavailable</Text>
          </View>
        )}
        <View style={styles.priceTag}>
          <Text style={styles.price}>{formatCurrency(property.price)}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{property.title}</Text>
        
        <View style={styles.locationContainer}>
          <MapPin size={14} color="#7f8c8d" />
          <Text style={styles.location} numberOfLines={1}>{property.location}</Text>
        </View>
        
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Bed size={16} color="#4a6fa5" />
            <Text style={styles.featureText}>{property.bedrooms}</Text>
          </View>
          
          <View style={styles.feature}>
            <Bath size={16} color="#4a6fa5" />
            <Text style={styles.featureText}>{property.bathrooms}</Text>
          </View>
          
          <View style={styles.feature}>
            <Ruler size={16} color="#4a6fa5" />
            <Text style={styles.featureText}>{property.area} m²</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  imageContainer: {
    position: "relative",
    height: 160,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  priceTag: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(74, 111, 165, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  price: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 4,
    flex: 1,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  featureText: {
    fontSize: 14,
    color: "#34495e",
    marginLeft: 4,
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    marginTop: 8,
    color: "#999",
    fontSize: 14,
  },
});