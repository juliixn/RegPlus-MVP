"use server";

import { ocrVisitorInformation } from "@/ai/flows/ocr-visitor-information";
import type { OCRVisitorInformationOutput } from "@/ai/flows/ocr-visitor-information";
import { ocrLicensePlate } from "@/ai/flows/ocr-license-plate";
import type { OCRLicensePlateOutput } from "@/ai/flows/ocr-license-plate";

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
