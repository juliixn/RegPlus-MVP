"use server";

import { ocrVisitorInformation } from "@/ai/flows/ocr-visitor-information";
import type { OCRVisitorInformationOutput } from "@/ai/flows/ocr-visitor-information";
import { ocrLicensePlate } from "@/ai/flows/ocr-license-plate";
import type { OCRLicensePlateOutput } from "@/ai/flows/ocr-license-plate";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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
