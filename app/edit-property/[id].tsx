import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { usePropertyStore } from "@/stores/propertyStore";
import { useAuthStore } from "@/stores/authStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Camera, MapPin } from "lucide-react-native";
import { Image } from "expo-image";
import { propertyTypes } from "@/constants/propertyTypes";

export default function EditPropertyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { getPropertyById, updateProperty, isLoading } = usePropertyStore();
  
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [area, setArea] = useState("");
  const [type, setType] = useState(propertyTypes[0]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const property = getPropertyById(id);
      if (property) {
        setTitle(property.title);
        setPrice(property.price.toString());
        setDescription(property.description);
        setLocation(property.location);
        setBedrooms(property.bedrooms.toString());
        setBathrooms(property.bathrooms.toString());
        setArea(property.area.toString());
        setType(property.type);
        setImageUri(property.imageUrl);
        
        if (property.latitude && property.longitude) {
          setCoordinates({
            latitude: property.latitude,
            longitude: property.longitude,
          });
        }
      }
      setInitialLoading(false);
    }
  }, [id]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required to use this feature");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCoordinates({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Get address from coordinates
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const formattedAddress = [
          address.street,
          address.city,
          address.region,
          address.country,
        ]
          .filter(Boolean)
          .join(", ");
        
        setLocation(formattedAddress);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to get location");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !price || !description || !location || !bedrooms || !bathrooms || !area || !type || !imageUri) {
      Alert.alert("Error", "Please fill in all fields and add an image");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to update a property");
      return;
    }

    try {
      const updatedProperty = {
        id,
        title,
        price: parseFloat(price),
        description,
        location,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        area: parseFloat(area),
        type,
        imageUrl: imageUri,
        userId: user.uid,
        contactName: user.displayName || "Property Owner",
        contactPhone: "123-456-7890", // In a real app, this would come from the user profile
        updatedAt: new Date().toISOString(),
        ...(coordinates && {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        }),
      };

      await updateProperty(id, updatedProperty);
      Alert.alert("Success", "Property updated successfully");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update property");
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6fa5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Property</Text>
            <Text style={styles.subtitle}>Update your property details</Text>
          </View>

          <TouchableOpacity 
            style={styles.imagePickerContainer}
            onPress={handlePickImage}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.previewImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Camera size={32} color="#7f8c8d" />
                <Text style={styles.imagePlaceholderText}>Change Property Image</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.form}>
            <Input
              label="Title"
              placeholder="e.g. Modern Apartment in Downtown"
              value={title}
              onChangeText={setTitle}
            />
            
            <Input
              label="Price"
              placeholder="e.g. 250000"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              leftElement={<Text style={styles.currencySymbol}>$</Text>}
            />
            
            <View style={styles.locationContainer}>
              <Input
                label="Location"
                placeholder="e.g. 123 Main St, City, State"
                value={location}
                onChangeText={setLocation}
                containerStyle={styles.locationInput}
              />
              <TouchableOpacity 
                style={styles.locationButton}
                onPress={handleGetLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MapPin size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.row}>
              <Input
                label="Bedrooms"
                placeholder="e.g. 2"
                value={bedrooms}
                onChangeText={setBedrooms}
                keyboardType="numeric"
                containerStyle={styles.halfInput}
              />
              <Input
                label="Bathrooms"
                placeholder="e.g. 1"
                value={bathrooms}
                onChangeText={setBathrooms}
                keyboardType="numeric"
                containerStyle={[styles.halfInput, styles.rightInput]}
              />
            </View>
            
            <View style={styles.row}>
              <Input
                label="Area (m²)"
                placeholder="e.g. 85"
                value={area}
                onChangeText={setArea}
                keyboardType="numeric"
                containerStyle={styles.halfInput}
              />
              <Select
                label="Property Type"
                value={type}
                onValueChange={setType}
                items={propertyTypes.map(type => ({ label: type, value: type }))}
                containerStyle={[styles.halfInput, styles.rightInput]}
              />
            </View>
            
            <Input
              label="Description"
              placeholder="Describe your property..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={styles.textArea}
            />

            <Button 
              onPress={handleSubmit}
              disabled={isLoading}
              style={styles.submitButton}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                "Update Property"
              )}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 4,
  },
  imagePickerContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
    overflow: "hidden",
    backgroundColor: "#e0e6ed",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#7f8c8d",
  },
  form: {
    width: "100%",
  },
  currencySymbol: {
    fontSize: 16,
    color: "#2c3e50",
    marginRight: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  locationInput: {
    flex: 1,
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#4a6fa5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  rightInput: {
    marginLeft: "auto",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 40,
  },
});