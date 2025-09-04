
import 'dotenv/config';
import * as admin from 'firebase-admin';

let serviceAccount: admin.ServiceAccount | undefined;

// Check if the service account key is available and is a valid JSON
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } catch (error) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid JSON string.', error);
  }
} else {
  console.warn(
    'FIREBASE_SERVICE_ACCOUNT_KEY is not set. Admin SDK features will be disabled. Please check your .env file.'
  );
}

// Initialize only if not already initialized and if the service account was parsed correctly
if (!admin.apps.length && serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

// Export auth and db, but they will be null if initialization failed
export const adminAuth = admin.apps.length > 0 ? admin.auth() : null;
export const adminDb = admin.apps.length > 0 ? admin.firestore() : null;
export { admin };
