"use server";

import { ocrVisitorInformation } from "@/ai/flows/ocr-visitor-information";
import type { OCRVisitorInformationOutput } from "@/ai/flows/ocr-visitor-information";
import { ocrLicensePlate } from "@/ai/flows/ocr-license-plate";
import type { OCRLicensePlateOutput } from "@/ai/flows/ocr-license-plate";
import { auth, db, storage } from "@/lib/firebase";
import { adminAuth, adminDb, admin } from "@/lib/firebase-admin";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit, doc, updateDoc, where, Timestamp, getCountFromServer, deleteDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { sendPasswordResetEmail } from "firebase/auth";
import * as z from "zod";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function createUserAccount(data: z.infer<typeof signupSchema>): Promise<{ success: boolean; error?: string }> {
  if (!adminAuth || !adminDb) {
    return { success: false, error: "The Admin SDK is not initialized. Please configure FIREBASE_SERVICE_ACCOUNT_KEY." };
  }
  try {
    const { name, email, password } = data;

    // Check if user already exists in Auth
    try {
        await adminAuth.getUserByEmail(email);
        return { success: false, error: "An account with this email already exists." };
    } catch (error: any) {
        if (error.code !== 'auth/user-not-found') {
            throw error; // Re-throw other errors
        }
    }

    // Create user in Firebase Auth (disabled by default)
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      disabled: true,
    });

    // Add user to 'pending_users' collection in Firestore
    await adminDb.collection("pending_users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      name,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error creating user:", error);
    let errorMessage = "Failed to create account.";
    if (error.code === 'auth/email-already-exists') {
        errorMessage = "An account with this email already exists.";
    }
    return { success: false, error: errorMessage };
  }
}

export async function getPendingUsers(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    if (!adminDb) {
      return { success: false, error: "The Admin SDK is not initialized." };
    }
    try {
        const snapshot = await adminDb.collection("pending_users").orderBy("createdAt", "asc").get();
        const users = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate().toLocaleString(),
            };
        });
        return { success: true, data: users };
    } catch (error) {
        console.error("Error fetching pending users:", error);
        return { success: false, error: "Failed to fetch pending users." };
    }
}

const approvalSchema = z.object({
    uid: z.string(),
    role: z.enum(["admin", "guard", "resident", "titular_condo"]),
});

export async function approveUser(data: z.infer<typeof approvalSchema>): Promise<{ success: boolean; error?: string }> {
    if (!adminAuth || !adminDb) {
      return { success: false, error: "The Admin SDK is not initialized." };
    }
    try {
        const { uid, role } = data;
        
        // 1. Set custom claim for the user
        await adminAuth.setCustomUserClaims(uid, { roles: [role] });

        // 2. Enable the user
        await adminAuth.updateUser(uid, { disabled: false });

        // 3. Delete the user from the pending_users collection
        await adminDb.collection("pending_users").doc(uid).delete();

        // Optional: Trigger a confirmation email here in the future
        // For now, the user can just log in.

        return { success: true };
    } catch (error) {
        console.error("Error approving user:", error);
        return { success: false, error: "Failed to approve user." };
    }
}

export async function denyUser(uid: string): Promise<{ success: boolean; error?: string }> {
    if (!adminAuth || !adminDb) {
      return { success: false, error: "The Admin SDK is not initialized." };
    }
    try {
        // 1. Delete user from Auth
        await adminAuth.deleteUser(uid);
        
        // 2. Delete from pending_users
        await adminDb.collection("pending_users").doc(uid).delete();

        return { success: true };
    } catch (error) {
        console.error("Error denying user:", error);
        return { success: false, error: "Failed to deny user." };
    }
}


export async function extractInfoFromId(photoDataUri: string): Promise<OCRVisitorInformationOutput | { error: string }> {
  try {
    if (!photoDataUri) {
      return { error: 'Image data is missing.' };
    }
    const result = await ocrVisitorInformation({ photoDataUri });
    return result;
  } catch (e) {
    console.error(e);
    return { error: 'Failed to extract information from the ID.' };
  }
}

export async function extractLicensePlate(photoDataUri: string): Promise<OCRLicensePlateOutput | { error: string }> {
    try {
        if (!photoDataUri) {
        return { error: 'Image data is missing.' };
        }
        const result = await ocrLicensePlate({ photoDataUri });
        return result;
    } catch (e) {
        console.error(e);
        return { error: 'Failed to extract license plate.' };
    }
}

export async function addLogbookEntry(entry: string): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "Firebase is not configured." };
    }
    if (!entry.trim()) {
        return { success: false, error: "Logbook entry cannot be empty." };
    }

    try {
        await addDoc(collection(db, "logbook"), {
            entry: entry,
            timestamp: serverTimestamp(),
        });
        return { success: true };
    } catch (e) {
        console.error("Error adding document: ", e);
        return { success: false, error: "Failed to save entry to the database." };
    }
}

const pedestrianSchema = z.object({
  visitorName: z.string(),
  visitorType: z.string(),
  destination: z.string(),
});

export async function addPedestrianEntry(entry: z.infer<typeof pedestrianSchema>): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "Firebase is not configured." };
    }
    try {
        await addDoc(collection(db, "pedestrian_registrations"), {
            ...entry,
            timestamp: serverTimestamp(),
        });
        return { success: true };
    } catch (e) {
        console.error("Error adding document: ", e);
        return { success: false, error: "Failed to save entry to the database." };
    }
}

const vehicleSchema = z.object({
  licensePlate: z.string(),
  driverName: z.string(),
  visitorType: z.string(),
  destination: z.string(),
  vehicleType: z.string(),
  vehicleBrand: z.string(),
  vehicleColor: z.string(),
  documentNumber: z.string().optional(),
});

export async function addVehicleEntry(entry: z.infer<typeof vehicleSchema>): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "Firebase is not configured." };
    }
    try {
        await addDoc(collection(db, "vehicle_registrations"), {
            ...entry,
            timestamp: serverTimestamp(),
        });
        return { success: true };
    } catch (e) {
        console.error("Error adding document: ", e);
        return { success: false, error: "Failed to save entry to the database." };
    }
}

const packageSchema = z.object({
    recipient: z.string(),
    courier: z.string(),
    trackingNumber: z.string().optional(),
    packagePhotoUrl: z.string().optional(),
});

export async function addPackageEntry(entry: z.infer<typeof packageSchema>): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "Firebase is not configured." };
    }
    try {
        await addDoc(collection(db, "packages"), {
            ...entry,
            receivedAt: serverTimestamp(),
            status: 'received',
        });
        return { success: true };
    } catch (e) {
        console.error("Error adding document: ", e);
        return { success: false, error: "Failed to save entry to the database." };
    }
}

export async function addFileAndGetURL(fileDataUrl: string, path: string): Promise<{ success: boolean; url?: string; error?: string }> {
    if (!storage) {
        return { success: false, error: "Firebase Storage is not configured." };
    }
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadString(storageRef, fileDataUrl, 'data_url');
        const downloadURL = await getDownloadURL(snapshot.ref);
        return { success: true, url: downloadURL };
    } catch (error) {
        console.error("Error uploading file:", error);
        return { success: false, error: "Failed to upload file." };
    }
}

const residentSchema = z.object({
  name: z.string(),
  apartment: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

export async function addResident(entry: z.infer<typeof residentSchema>): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "Firebase is not configured." };
    }
    try {
        await addDoc(collection(db, "residents"), {
            ...entry,
            createdAt: serverTimestamp(),
        });
        return { success: true };
    } catch (e) {
        console.error("Error adding document: ", e);
        return { success: false, error: "Failed to save resident to the database." };
    }
}

const guardSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export async function addGuard(entry: z.infer<typeof guardSchema>): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "Firebase is not configured." };
    }
    try {
        await addDoc(collection(db, "guards"), {
            ...entry,
            createdAt: serverTimestamp(),
        });
        return { success: true };
    } catch (e) {
        console.error("Error adding document: ", e);
        return { success: false, error: "Failed to save guard to the database." };
    }
}

const communicationSchema = z.object({
  title: z.string(),
  content: z.string(),
  audience: z.string(),
});

export async function addCommunication(entry: z.infer<typeof communicationSchema>): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "Firebase is not configured." };
    }
    try {
        await addDoc(collection(db, "communications"), {
            ...entry,
            sentAt: serverTimestamp(),
        });
        return { success: true };
    } catch (e) {
        console.error("Error adding document: ", e);
        return { success: false, error: "Failed to save communication." };
    }
}

const shiftSchema = z.object({
  guardId: z.string(),
  guardName: z.string().nullable(),
  condominium: z.string(),
  shiftType: z.string(),
  equipment: z.array(z.string()),
});

export async function startShift(data: z.infer<typeof shiftSchema>): Promise<{ success: boolean; shiftId?: string; error?: string }> {
    if (!db) {
        return { success: false, error: "Firebase is not configured." };
    }
    try {
        const docRef = await addDoc(collection(db, "shifts"), {
            ...data,
            startTime: serverTimestamp(),
            endTime: null,
            status: 'active',
        });
        return { success: true, shiftId: docRef.id };
    } catch (e) {
        console.error("Error starting shift: ", e);
        return { success: false, error: "Failed to start shift." };
    }
}

export async function endShift(shiftId: string): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "Firebase is not configured." };
    }
    try {
        const shiftDocRef = doc(db, "shifts", shiftId);
        await updateDoc(shiftDocRef, {
            endTime: serverTimestamp(),
            status: 'completed',
        });
        return { success: true };
    } catch (e) {
        console.error("Error ending shift: ", e);
        return { success: false, error: "Failed to end shift." };
    }
}

const proofOfLifeSchema = z.object({
    shiftId: z.string(),
    guardId: z.string(),
    selfie: z.string(),
    surroundings: z.string(),
});

export async function submitProofOfLife(data: z.infer<typeof proofOfLifeSchema>): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "Firebase is not configured." };
    }
    try {
        await addDoc(collection(db, "proof_of_life"), {
            ...data,
            timestamp: serverTimestamp(),
        });
        return { success: true };
    } catch (e) {
        console.error("Error submitting proof of life: ", e);
        return { success: false, error: "Failed to submit proof of life." };
    }
}

const visitorPassSchema = z.object({
    visitorName: z.string(),
    visitDate: z.date(),
    residentId: z.string(),
});

export async function generateVisitorPass(data: z.infer<typeof visitorPassSchema>): Promise<{ success: boolean; passData?: any; error?: string }> {
    if (!db) {
        return { success: false, error: "Firebase is not configured." };
    }
    try {
        const docRef = await addDoc(collection(db, "visitor_passes"), {
            ...data,
            status: 'active',
            createdAt: serverTimestamp(),
        });
        
        const passData = {
            passId: docRef.id,
            visitorName: data.visitorName,
            visitDate: data.visitDate.toISOString().split('T')[0], // aaaa-mm-dd
        };

        return { success: true, passData };
    } catch (e) {
        console.error("Error generating visitor pass: ", e);
        return { success: false, error: "Failed to generate visitor pass." };
    }
}


// Functions to fetch history
async function getCollectionData(collectionName: string, orderByField: string = 'timestamp') {
    if (!db) {
        return { success: false, error: "Firebase is not configured." };
    }
    try {
        const q = query(collection(db, collectionName), orderBy(orderByField, "desc"), limit(50));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => {
            const docData = doc.data();
            return {
                id: doc.id,
                ...docData,
                // Convert Firestore Timestamp to a serializable format
                timestamp: docData.timestamp?.toDate ? docData.timestamp.toDate().toLocaleString() : null,
                receivedAt: docData.receivedAt?.toDate ? docData.receivedAt.toDate().toLocaleString() : null,
                createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate().toLocaleString() : null,
                sentAt: docData.sentAt?.toDate ? docData.sentAt.toDate().toLocaleString() : null,
            };
        });
        return { success: true, data };
    } catch (error) {
        console.error(`Error fetching ${collectionName}: `, error);
        return { success: false, error: `Failed to fetch ${collectionName} data.` };
    }
}

export async function getVehicleEntries() {
    return getCollectionData("vehicle_registrations");
}

export async function getPedestrianEntries() {
    return getCollectionData("pedestrian_registrations");
}

export async function getLogbookEntries() {
    return getCollectionData("logbook");
}

export async function getPackageEntries() {
    return getCollectionData("packages", "receivedAt");
}

export async function getResidents() {
    return getCollectionData("residents", "createdAt");
}

export async function getGuards() {
    return getCollectionData("guards", "createdAt");
}

export async function getCommunications() {
    return getCollectionData("communications", "sentAt");
}

export async function getDashboardStats() {
    if (!db) {
        return { success: false, error: "Firebase is not configured." };
    }
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayTimestamp = Timestamp.fromDate(today);
        const tomorrowTimestamp = Timestamp.fromDate(tomorrow);

        const residentsSnap = await getCountFromServer(collection(db, "residents"));
        
        const vehicleQuery = query(collection(db, "vehicle_registrations"), where("timestamp", ">=", todayTimestamp), where("timestamp", "<", tomorrowTimestamp));
        const vehicleSnap = await getCountFromServer(vehicleQuery);

        const pedestrianQuery = query(collection(db, "pedestrian_registrations"), where("timestamp", ">=", todayTimestamp), where("timestamp", "<", tomorrowTimestamp));
        const pedestrianSnap = await getCountFromServer(pedestrianQuery);

        const packagesQuery = query(collection(db, "packages"), where("status", "==", "received"));
        const packagesSnap = await getCountFromServer(packagesQuery);

        return {
            success: true,
            data: {
                totalResidents: residentsSnap.data().count,
                vehicleEntriesToday: vehicleSnap.data().count,
                pedestrianEntriesToday: pedestrianSnap.data().count,
                pendingPackages: packagesSnap.data().count,
            }
        };
    } catch (error) {
        console.error("Error fetching dashboard stats: ", error);
        return { success: false, error: "Failed to fetch dashboard stats." };
    }
}

export async function handlePasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    if (!auth) {
      return { success: false, error: "Firebase is not configured. Please check your environment variables." };
    }
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error: any) {
        console.error("Password reset error:", error);
        if (error.code === 'auth/user-not-found') {
            return { success: false, error: "No user found with this email address." };
        }
        return { success: false, error: "Failed to send password reset email." };
    }
}
