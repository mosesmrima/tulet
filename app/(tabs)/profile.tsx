import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LogOut, User, Camera, Mail, Lock } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen() {
  const { user, logout, updateProfile, isLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.displayName || "");
  const [profileImage, setProfileImage] = useState(user?.photoURL || "");
  const [updatingPhoto, setUpdatingPhoto] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await logout();
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    try {
      await updateProfile({ displayName: name });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] ,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUpdatingPhoto(true);
        try {
          // In a real app, you would upload this to Firebase Storage
          // For now, we'll just update the state
          setProfileImage(result.assets[0].uri);
          await updateProfile({ photoURL: result.assets[0].uri });
          Alert.alert("Success", "Profile photo updated");
        } catch (error: any) {
          Alert.alert("Error", error.message);
        } finally {
          setUpdatingPhoto(false);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <User size={40} color="#7f8c8d" />
              </View>
            )}
            {updatingPhoto ? (
              <ActivityIndicator 
                size="small" 
                color="#fff" 
                style={styles.cameraButton} 
              />
            ) : (
              <TouchableOpacity 
                style={styles.cameraButton}
                onPress={handlePickImage}
              >
                <Camera size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.profileName}>
            {user?.displayName || "User"}
          </Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          {isEditing ? (
            <View style={styles.editForm}>
              <Input
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
              />
              
              <View style={styles.buttonRow}>
                <Button 
                  onPress={() => setIsEditing(false)} 
                  variant="outline"
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button 
                  onPress={handleUpdateProfile}
                  disabled={isLoading}
                  style={styles.saveButton}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <User size={20} color="#4a6fa5" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>
                    {user?.displayName || "Not set"}
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Mail size={20} color="#4a6fa5" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user?.email}</Text>
                </View>
              </View>
              
              <Button 
                onPress={() => setIsEditing(true)}
                style={styles.editButton}
              >
                Edit Profile
              </Button>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Lock size={20} color="#4a6fa5" />
            <Text style={styles.menuItemText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        <Button 
          onPress={handleLogout} 
          variant="outline"
          style={styles.logoutButton}
        >
          <LogOut size={18} color="#e74c3c" style={styles.logoutIcon} />
           <Text>Logout</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
  },
  scrollContent: {
    padding: 16,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e6ed",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4a6fa5",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  profileEmail: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 4,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e6edf5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  infoValue: {
    fontSize: 16,
    color: "#2c3e50",
    marginTop: 2,
  },
  editButton: {
    marginTop: 8,
  },
  editForm: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: "#2c3e50",
    marginLeft: 12,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 24,
    borderColor: "#e74c3c",
  },
  logoutIcon: {
    marginRight: 8,
  },
});