import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCgGqa2HPL1iLt7U5wsgrP5CYYS2LX844",
  authDomain: "smart-tread-ai.firebaseapp.com",
  projectId: "smart-tread-ai",
  storageBucket: "smart-tread-ai.firebasestorage.app",
  messagingSenderId: "584149203613",
  appId: "1:584149203613:web:fbc35191ce3e5e3e33b274"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
