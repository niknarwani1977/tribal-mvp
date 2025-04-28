// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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

// Initialize Authentication
export const auth = getAuth(app);
