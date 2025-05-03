import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth, 
  getReactNativePersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  Auth
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPtDhBKWnYypolZtCJ-WexlYC8VzwOyyc",
  authDomain: "kenas-house-hunting.firebaseapp.com",
  projectId: "kenas-house-hunting",
  storageBucket: "kenas-house-hunting.firebasestorage.app",
  messagingSenderId: "864680459772",
  appId: "1:864680459772:web:57fd0d5351ed7ee8dec679",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with platform-specific persistence
let auth: Auth;
if (Platform.OS === 'web') {
  // For web, use the default auth with browser persistence
  auth = getAuth(app);
} else {
  // For React Native, use AsyncStorage persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// Initialize Firestore
const db: Firestore = getFirestore(app);

export { app, auth, db }; 