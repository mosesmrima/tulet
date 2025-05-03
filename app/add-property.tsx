import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { usePropertyStore } from "@/stores/propertyStore";
import { useAuthStore } from "@/stores/authStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Camera, MapPin, X } from "lucide-react-native";
import { Image } from "expo-image";
import { propertyTypes } from "@/constants/propertyTypes";
import { CLOUDINARY_CONFIG, uploadMultipleImages } from "@/utils/cloudinary";

export default function AddPropertyScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addProperty, isLoading } = usePropertyStore();
  
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [area, setArea] = useState("");
  const [type, setType] = useState(propertyTypes[0]);
  const [images, setImages] = useState<Array<{uri: string, uploading: boolean, cloudinaryUrl?: string}>>([]);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage = { uri: result.assets[0].uri, uploading: false };
        setImages(prevImages => [...prevImages, newImage]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
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

  const uploadAllImages = async (): Promise<string[]> => {
    if (images.length === 0) {
      throw new Error("Please add at least one image");
    }

    // Mark all images as uploading
    setImages(prevImages => 
      prevImages.map(img => ({ ...img, uploading: true }))
    );

    try {
      // Get just the URIs from the images array
      const imageUris = images.map(img => img.uri);
      
      // Use our utility function to upload all images
      const uploadedUrls = await uploadMultipleImages(imageUris, {
        folder: `property_images/${user?.uid || 'anonymous'}`,
        tags: ['property', 'real_estate'],
        onProgress: (progress) => {
          console.log(`Upload progress: ${progress}%`);
        }
      });
      
      // Update the images state with the uploaded URLs
      setImages(prevImages => 
        prevImages.map((img, idx) => ({
          ...img,
          uploading: false,
          cloudinaryUrl: uploadedUrls[idx] || img.cloudinaryUrl
        }))
      );
      
      return uploadedUrls;
    } catch (error) {
      // Reset uploading state if there's an error
      setImages(prevImages => 
        prevImages.map(img => ({ ...img, uploading: false }))
      );
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!title || !price || !description || !location || !bedrooms || !bathrooms || !area || !type) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (images.length === 0) {
      Alert.alert("Error", "Please add at least one image");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to add a property");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload all images to Cloudinary
      const imageUrls = await uploadAllImages();
      
      const newProperty = {
        title,
        price: parseFloat(price),
        description,
        location,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        area: parseFloat(area),
        type,
        imageUrls, // Array of image URLs
        mainImageUrl: imageUrls[0], // First image as the main image
        imageUrl: imageUrls[0], // For backward compatibility
        userId: user.uid,
        contactName: user.displayName || "Property Owner",
        contactEmail: user.email || null,
        contactPhone: "123-456-7890", // In a real app, this would come from the user profile
        createdAt: new Date().toISOString(), // Needed because of the Property type requiring it
        ...(coordinates && {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        }),
      };

      await addProperty(newProperty);
      Alert.alert("Success", "Property added successfully");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add property");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Add New Property</Text>
            <Text style={styles.subtitle}>Fill in the details below</Text>
          </View>

          {/* Image Gallery */}
          <View style={styles.imageGalleryContainer}>
            <Text style={styles.sectionTitle}>Property Images</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageGallery}
            >
              {/* Add Image Button */}
              <TouchableOpacity 
                style={styles.addImageButton}
                onPress={handlePickImage}
                disabled={isSubmitting}
              >
                <Camera size={32} color="#7f8c8d" />
                <Text style={styles.addImageText}>Add Image</Text>
              </TouchableOpacity>
              
              {/* Selected Images */}
              {images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.previewImage}
                    contentFit="cover"
                  />
                  {image.uploading && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="small" color="#ffffff" />
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                    disabled={isSubmitting || image.uploading}
                  >
                    <X size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

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
                disabled={isGettingLocation || isSubmitting}
              >
                {isGettingLocation ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MapPin size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Bedrooms"
                  placeholder="e.g. 2"
                  value={bedrooms}
                  onChangeText={setBedrooms}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Bathrooms"
                  placeholder="e.g. 1"
                  value={bathrooms}
                  onChangeText={setBathrooms}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Area (m²)"
                  placeholder="e.g. 85"
                  value={area}
                  onChangeText={setArea}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Select
                  label="Property Type"
                  value={type}
                  onValueChange={setType}
                  items={propertyTypes.map(type => ({ label: type, value: type }))}
                />
              </View>
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
              disabled={isLoading || isSubmitting}
              style={styles.submitButton}
            >
              {isLoading || isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                "Add Property"
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  imageGalleryContainer: {
    marginBottom: 24,
  },
  imageGallery: {
    paddingBottom: 8,
  },
  imageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: "#e0e6ed",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  addImageText: {
    marginTop: 8,
    fontSize: 12,
    color: "#7f8c8d",
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
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
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 40,
  },
});