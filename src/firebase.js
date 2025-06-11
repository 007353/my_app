// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBBIZWaSYejDCzjwRiZZkFfFhDk0Oe3dns",
  authDomain: "oko-homes-52823.firebaseapp.com",
  projectId: "oko-homes-52823",
  storageBucket: "oko-homes-52823.firebasestorage.app",
  messagingSenderId: "954439213592",
  appId: "1:954439213592:web:8ad2cd3100cf172e48196d",
  measurementId: "G-SZV1G3CMLJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth }; 