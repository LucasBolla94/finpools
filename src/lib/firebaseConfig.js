import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCv65ogN-ZCLtYthM4wcY43n1kOhExqijo",
  authDomain: "finpools.firebaseapp.com",
  projectId: "finpools",
  storageBucket: "finpools.firebasestorage.app",
  messagingSenderId: "730319480122",
  appId: "1:730319480122:web:f3f06b090e5b0e91b65c03",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
