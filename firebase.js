// firebase.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Replace the below config with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuxkc7U5X3B0BwCAOkUuj1gxFiLyg8AZA",
  authDomain: "zero-waste-test-e8bb7.firebaseapp.com",
  projectId: "zero-waste-test-e8bb7",
  storageBucket: "zero-waste-test-e8bb7.appspot.com",
  messagingSenderId: "546147348318",
  appId: "1:546147348318:web:050381da33750c349fa9cf",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
