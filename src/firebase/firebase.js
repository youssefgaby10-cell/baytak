import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvO2b_elpWibINBvk8So8QbWpurKHe5II",
  authDomain: "baytak-6bf35.firebaseapp.com",
  projectId: "baytak-6bf35",
  storageBucket: "baytak-6bf35.firebasestorage.app",
  messagingSenderId: "1093185507535",
  appId: "1:1093185507535:web:545f44a47f84d963b527ba",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);

// Google Provider
export const googleProvider = new GoogleAuthProvider();

// Firestore Database
export const db = getFirestore(app);
