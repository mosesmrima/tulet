import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "../firebaseConfig";

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: User | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Convert Firebase user to our User type
const formatUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isInitialized: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          set({ 
            user: formatUser(userCredential.user), 
            isLoading: false 
          });
        } catch (error: any) {
          const errorMessage = error.code ? 
            error.code.replace('auth/', '').replace(/-/g, ' ') : 
            error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          // Create user with email and password
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          // Update profile with display name
          await firebaseUpdateProfile(userCredential.user, {
            displayName: name
          });
          
          set({ 
            user: formatUser(userCredential.user), 
            isLoading: false 
          });
        } catch (error: any) {
          const errorMessage = error.code ? 
            error.code.replace('auth/', '').replace(/-/g, ' ') : 
            error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await signOut(auth);
          set({ user: null, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        
        try {
          await sendPasswordResetEmail(auth, email);
          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = error.code ? 
            error.code.replace('auth/', '').replace(/-/g, ' ') : 
            error.message;
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) {
            throw new Error("User not authenticated");
          }
          
          // Only update Firebase profile if displayName or photoURL is changing
          if (data.displayName || data.photoURL) {
            await firebaseUpdateProfile(currentUser, {
              displayName: data.displayName || currentUser.displayName,
              photoURL: data.photoURL || currentUser.photoURL
            });
          }
          
          const { user } = get();
          const updatedUser = user ? { ...user, ...data } : null;
          set({ user: updatedUser, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // When rehydration is complete, set isInitialized
        if (state) {
          // After store has rehydrated, set isInitialized
          setTimeout(() => {
            useAuthStore.setState({ isInitialized: true });
          }, 0);

          // Setup auth state listener - this will update the store when Firebase auth state changes
          const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
              useAuthStore.setState({ user: formatUser(firebaseUser) });
            } else {
              useAuthStore.setState({ user: null });
            }
          });
          
          // Return cleanup function
          return () => unsubscribe();
        }
      },
    }
  )
);