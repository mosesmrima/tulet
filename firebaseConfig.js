import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
    apiKey: "AIzaSyBN8p2fIqo1vMI24Iik_yFhyzNfS6fuvVk",
    authDomain: "tulet-bf5ee.firebaseapp.com",
    projectId: "tulet-bf5ee",
    storageBucket: "tulet-bf5ee.appspot.com",
    messagingSenderId: "478195519062",
    appId: "1:478195519062:web:64ff52ef097fb1f01875f7",
    measurementId: "G-D4F6QECN1Y"
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

