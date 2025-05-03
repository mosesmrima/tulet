import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform, ViewStyle } from "react-native";
import { Image } from "expo-image";
import { MapPin } from "lucide-react-native";

interface MapPreviewProps {
  latitude: number;
  longitude: number;
  style?: ViewStyle;
}

export function MapPreview({ latitude, longitude, style }: MapPreviewProps) {
  // For a real app, you would use a proper map component
  // This is a simplified version using a static map image
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${latitude},${longitude}&key=YOUR_API_KEY`;
  
  // Placeholder image for the demo
  const placeholderMapUrl = "https://images.unsplash.com/photo-1569336415962-a4bd9f69c07a?q=80&w=2831&auto=format&fit=crop";

  const handleOpenMap = () => {
    const url = Platform.select({
      ios: `maps:?q=${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
      web: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handleOpenMap}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: placeholderMapUrl }}
        style={styles.mapImage}
        contentFit="cover"
      />
      <View style={styles.overlay}>
        <MapPin size={24} color="#4a6fa5" />
        <Text style={styles.text}>View on Maps</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2c3e50",
    marginLeft: 8,
  },
});