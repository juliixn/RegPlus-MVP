'use server';

/**
 * @fileOverview A flow that uses OCR to extract license plate information from an image.
 *
 * - ocrLicensePlate - A function that handles the OCR process for license plates.
 * - OCRLicensePlateInput - The input type for the ocrLicensePlate function.
 * - OCRLicensePlateOutput - The return type for the ocrLicensePlate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OCRLicensePlateInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a vehicle's license plate, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type OCRLicensePlateInput = z.infer<typeof OCRLicensePlateInputSchema>;

const OCRLicensePlateOutputSchema = z.object({
  licensePlate: z.string().describe('The license plate number extracted from the image.'),
  confidence: z.number().describe('The confidence level of the OCR extraction (0-1).'),
});
export type OCRLicensePlateOutput = z.infer<typeof OCRLicensePlateOutputSchema>;

export async function ocrLicensePlate(input: OCRLicensePlateInput): Promise<OCRLicensePlateOutput> {
  return ocrLicensePlateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ocrLicensePlatePrompt',
  input: {schema: OCRLicensePlateInputSchema},
  output: {schema: OCRLicensePlateOutputSchema},
  prompt: `You are an expert OCR reader that extracts data from images of vehicle license plates.

  Extract the license plate number from the following image. Return the confidence level of the extraction as a number between 0 and 1.

  Image: {{media url=photoDataUri}}
  `,
});

const ocrLicensePlateFlow = ai.defineFlow(
  {
    name: 'ocrLicensePlateFlow',
    inputSchema: OCRLicensePlateInputSchema,
    outputSchema: OCRLicensePlateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
