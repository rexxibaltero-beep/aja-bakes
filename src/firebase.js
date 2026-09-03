import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC5rFt-UAYoZ3UUq3gSqfrDRcNgnL5lxoM",
  authDomain: "aja-bakes.firebaseapp.com",
  projectId: "aja-bakes",
  storageBucket: "aja-bakes.firebasestorage.app",
  messagingSenderId: "604558768003",
  appId: "1:604558768003:web:7ba76cea55a9049bb728b6",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);