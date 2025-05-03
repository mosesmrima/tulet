import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Property } from "@/types";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";

interface FavoriteState {
  favorites: Property[];
  isLoading: boolean;
  error: string | null;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (property: Property) => Promise<void>;
  isFavorite: (propertyId: string) => boolean;
  checkFavorite: (propertyId: string) => boolean;
}

// Helper to convert Firestore data to our Property type
const convertPropertyDoc = (doc: any): Property => {
  const data = doc.data();
  
  // Convert Firestore Timestamp to ISO string if needed
  const createdAt = data.createdAt instanceof Timestamp 
    ? data.createdAt.toDate().toISOString() 
    : data.createdAt;
    
  const updatedAt = data.updatedAt instanceof Timestamp 
    ? data.updatedAt.toDate().toISOString() 
    : data.updatedAt;

  return {
    id: doc.id,
    ...data.property,
    favoriteId: doc.id,
    createdAt,
    updatedAt,
  };
};

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isLoading: false,
      error: null,

      fetchFavorites: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const user = auth.currentUser;
          if (!user) {
            set({ isLoading: false });
            return;
          }
          
          const favoritesQuery = query(
            collection(db, "favorites"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
          
          const querySnapshot = await getDocs(favoritesQuery);
          const favorites: Property[] = [];
          
          // For each favorite, fetch the associated property
          for (const doc of querySnapshot.docs) {
            const data = doc.data();
            
            // If the property data is embedded in the favorite
            if (data.property) {
              favorites.push({
                ...data.property,
                favoriteId: doc.id, // Store the favorite document ID for easy deletion
              } as Property);
            } else if (data.propertyId) {
              // If only the property ID is stored, fetch the property
              const propertyDoc = await getDoc(doc(db, "properties", data.propertyId));
              if (propertyDoc.exists()) {
                const property = propertyDoc.data() as Property;
                favorites.push({
                  ...property,
                  id: propertyDoc.id,
                  favoriteId: doc.id,
                });
              }
            }
          }
          
          set({ favorites, isLoading: false });
        } catch (error: any) {
          console.error("Error fetching favorites:", error);
          set({ error: error.message, isLoading: false });
        }
      },

      toggleFavorite: async (property: Property) => {
        set({ isLoading: true, error: null });
        
        try {
          const user = auth.currentUser;
          if (!user) {
            throw new Error("You must be logged in to manage favorites");
          }
          
          const { favorites } = get();
          const existingFavorite = favorites.find(fav => fav.id === property.id);
          
          if (existingFavorite) {
            // If favorite exists, delete it
            if (existingFavorite.favoriteId) {
              await deleteDoc(doc(db, "favorites", existingFavorite.favoriteId));
            }
            
            // Update local state
            set(state => ({
              favorites: state.favorites.filter(fav => fav.id !== property.id),
              isLoading: false,
            }));
          } else {
            // Prepare property data, ensuring all fields have values to avoid Firestore errors
            const propertyToSave = {
              ...property,
              // Add default values for potentially undefined fields
              updatedAt: property.updatedAt || new Date().toISOString(),
              imageUrl: property.imageUrl || property.mainImageUrl || "",
              mainImageUrl: property.mainImageUrl || property.imageUrl || "",
              contactEmail: property.contactEmail || null,
              latitude: property.latitude || null,
              longitude: property.longitude || null,
              status: property.status || "Available",
            };
            
            // Add new favorite
            const favoriteData = {
              userId: user.uid,
              propertyId: property.id,
              property: propertyToSave, // Store the prepared property for easier retrieval
              createdAt: serverTimestamp(),
            };
            
            const docRef = await addDoc(collection(db, "favorites"), favoriteData);
            
            // Update local state
            set(state => ({
              favorites: [
                ...state.favorites, 
                { ...propertyToSave, favoriteId: docRef.id }
              ],
              isLoading: false,
            }));
          }
        } catch (error: any) {
          console.error("Error toggling favorite:", error);
          set({ error: error.message, isLoading: false });
        }
      },

      isFavorite: (propertyId: string) => {
        return get().favorites.some(fav => fav.id === propertyId);
      },

      checkFavorite: (propertyId: string) => {
        return get().favorites.some(fav => fav.id === propertyId);
      },
    }),
    {
      name: "favorite-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);