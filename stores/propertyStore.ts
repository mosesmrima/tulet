import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Property } from "@/types";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  DocumentReference 
} from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";

interface PropertyState {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  fetchProperties: () => Promise<void>;
  fetchUserProperties: (userId: string) => Promise<void>;
  getPropertyById: (id: string) => Property | undefined;
  addProperty: (property: Omit<Property, "id">) => Promise<void>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
}

// Helper to convert Firestore data to our Property type
const convertPropertyDoc = (doc: any): Property => {
  const data = doc.data();
  
  // Convert Firestore Timestamp to ISO string
  const createdAt = data.createdAt instanceof Timestamp 
    ? data.createdAt.toDate().toISOString() 
    : data.createdAt;
    
  const updatedAt = data.updatedAt instanceof Timestamp 
    ? data.updatedAt.toDate().toISOString() 
    : data.updatedAt;

  // Ensure image URLs are properly set
  const imageUrl = data.imageUrl || '';
  const mainImageUrl = data.mainImageUrl || imageUrl || '';
  const imageUrls = data.imageUrls || (imageUrl ? [imageUrl] : []);

  return {
    id: doc.id,
    ...data,
    createdAt,
    updatedAt,
    imageUrl,
    mainImageUrl,
    imageUrls,
  };
};

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set, get) => ({
      properties: [],
      isLoading: false,
      error: null,

      fetchProperties: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const propertiesQuery = query(
            collection(db, "properties"),
            orderBy("createdAt", "desc")
          );
          
          const querySnapshot = await getDocs(propertiesQuery);
          const properties: Property[] = [];
          
          querySnapshot.forEach((doc) => {
            const property = convertPropertyDoc(doc);
            
            // Ensure mainImageUrl is set for backwards compatibility
            if (!property.mainImageUrl && property.imageUrl) {
              property.mainImageUrl = property.imageUrl;
            }
            
            // Ensure imageUrls array exists
            if (!property.imageUrls || !property.imageUrls.length) {
              property.imageUrls = property.imageUrl ? [property.imageUrl] : [];
            }
            
            properties.push(property);
          });
          
          console.log(`Fetched ${properties.length} properties`);
          set({ properties, isLoading: false });
        } catch (error: any) {
          console.error("Error fetching properties:", error);
          set({ error: error.message, isLoading: false });
        }
      },

      fetchUserProperties: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const userPropertiesQuery = query(
            collection(db, "properties"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
          );
          
          const querySnapshot = await getDocs(userPropertiesQuery);
          const properties: Property[] = [];
          
          querySnapshot.forEach((doc) => {
            const property = convertPropertyDoc(doc);
            
            // Ensure mainImageUrl is set for backwards compatibility
            if (!property.mainImageUrl && property.imageUrl) {
              property.mainImageUrl = property.imageUrl;
            }
            
            // Ensure imageUrls array exists
            if (!property.imageUrls || !property.imageUrls.length) {
              property.imageUrls = property.imageUrl ? [property.imageUrl] : [];
            }
            
            properties.push(property);
          });
          
          console.log(`Fetched ${properties.length} user properties for user ${userId}`);
          set({ properties, isLoading: false });
        } catch (error: any) {
          console.error("Error fetching user properties:", error);
          set({ error: error.message, isLoading: false });
        }
      },

      getPropertyById: (id: string) => {
        // First check in local state
        const property = get().properties.find(property => property.id === id);
        
        if (property) {
          // Ensure the property has mainImageUrl set
          if (!property.mainImageUrl && property.imageUrl) {
            return { ...property, mainImageUrl: property.imageUrl };
          }
          return property;
        }
        
        // If not found, try to fetch it directly - this is a synchronous function
        // so we can't use async/await, but we'll log a warning
        console.warn(`Property ${id} not found in local state. Consider pre-fetching properties.`);
        return undefined;
      },

      addProperty: async (property: Omit<Property, "id">) => {
        set({ isLoading: true, error: null });
        
        try {
          const user = auth.currentUser;
          if (!user) {
            throw new Error("You must be logged in to add a property");
          }
          
          // Add timestamps and user info
          const propertyData = {
            ...property,
            createdAt: serverTimestamp(),
            userId: user.uid,
            contactName: user.displayName || "Property Owner",
            contactEmail: user.email || "",
          };
          
          const docRef = await addDoc(collection(db, "properties"), propertyData);
          
          // Get the newly created property with its ID
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const newProperty = convertPropertyDoc(docSnap);
            
            // Update local state
            set(state => ({
              properties: [newProperty, ...state.properties],
              isLoading: false,
            }));
          }
        } catch (error: any) {
          console.error("Error adding property:", error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateProperty: async (id: string, updatedData: Partial<Property>) => {
        set({ isLoading: true, error: null });
        
        try {
          const user = auth.currentUser;
          if (!user) {
            throw new Error("You must be logged in to update a property");
          }
          
          // Reference to the property document
          const propertyRef = doc(db, "properties", id);
          
          // Add updatedAt timestamp
          const updateData = {
            ...updatedData,
            updatedAt: serverTimestamp(),
          };
          
          // Update the document in Firestore
          await updateDoc(propertyRef, updateData);
          
          // Update the local state
          set(state => ({
            properties: state.properties.map(property =>
              property.id === id
                ? { ...property, ...updatedData, updatedAt: new Date().toISOString() }
                : property
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error("Error updating property:", error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteProperty: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const user = auth.currentUser;
          if (!user) {
            throw new Error("You must be logged in to delete a property");
          }
          
          // Reference to the property document
          const propertyRef = doc(db, "properties", id);
          
          // Delete the document from Firestore
          await deleteDoc(propertyRef);
          
          // Update the local state
          set(state => ({
            properties: state.properties.filter(property => property.id !== id),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error("Error deleting property:", error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "property-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);