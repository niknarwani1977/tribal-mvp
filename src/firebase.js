// src/firebase.js

// Import necessary Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPddSf_e7XVn8k1gp3oZLHElS1wbzYSaE",
  authDomain: "tribalapp-22f5a.firebaseapp.com",
  projectId: "tribalapp-22f5a",
  storageBucket: "tribalapp-22f5a.firebasestorage.app",
  messagingSenderId: "602057086930",
  appId: "1:602057086930:web:64bd71e470c7124869da0b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export services
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

// Initialize and export Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
