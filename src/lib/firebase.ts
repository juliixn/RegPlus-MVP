// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBG0apWKqEaVobUdmPHDzPslBp4vBfWwpI",
  authDomain: "acceso-seguro-3cs42.firebaseapp.com",
  databaseURL: "https://acceso-seguro-3cs42-default-rtdb.firebaseio.com",
  projectId: "acceso-seguro-3cs42",
  storageBucket: "acceso-seguro-3cs42.appspot.com",
  messagingSenderId: "712343981243",
  appId: "1:712343981243:web:22ebe1c051159bf3ea2d9e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
