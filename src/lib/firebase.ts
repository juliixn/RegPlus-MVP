"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp | null {
  // Return null if config is not provided to prevent initialization with placeholder values
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your-api-key') {
    console.warn("Firebase config not provided. Firebase services will be unavailable.");
    return null;
  }

  return !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

const app = getFirebaseApp();
const auth: Auth = app ? getAuth(app) : ({} as Auth);
const db: Firestore = app ? getFirestore(app) : ({} as Firestore);

export { app, auth, db };