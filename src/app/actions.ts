"use server";

import { ocrVisitorInformation } from "@/ai/flows/ocr-visitor-information";
import type { OCRVisitorInformationOutput } from "@/ai/flows/ocr-visitor-information";
import { ocrLicensePlate } from "@/ai/flows/ocr-license-plate";
import type { OCRLicensePlateOutput } from "@/ai/flows/ocr-license-plate";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit } from "firebase/firestore";
import * as z from "zod";

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
    packagePhoto: z.string().optional(),
});

export async function addPackageEntry(entry: z.infer<typeof packageSchema>): Promise<{ success: boolean; error?: string }> {
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

// Functions to fetch history
async function getCollectionData(collectionName: string) {
    try {
        const q = query(collection(db, collectionName), orderBy("timestamp", "desc"), limit(50));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => {
            const docData = doc.data();
            return {
                id: doc.id,
                ...docData,
                // Convert Firestore Timestamp to a serializable format (ISO string)
                timestamp: docData.timestamp?.toDate ? docData.timestamp.toDate().toLocaleString() : null,
                receivedAt: docData.receivedAt?.toDate ? docData.receivedAt.toDate().toLocaleString() : null,
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
