'use server';

/**
 * @fileOverview A flow that uses OCR to extract visitor information from an image.
 *
 * - ocrVisitorInformation - A function that handles the OCR process.
 * - OCRVisitorInformationInput - The input type for the ocrVisitorInformation function.
 * - OCRVisitorInformationOutput - The return type for the ocrVisitorInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OCRVisitorInformationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a visitor's identification, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type OCRVisitorInformationInput = z.infer<typeof OCRVisitorInformationInputSchema>;

const OCRVisitorInformationOutputSchema = z.object({
  visitorName: z.string().describe('The name of the visitor extracted from the image.'),
  visitorDocumentNumber: z.string().describe('The document number of the visitor extracted from the image.'),
  confidence: z.number().describe('The confidence level of the OCR extraction (0-1).'),
});
export type OCRVisitorInformationOutput = z.infer<typeof OCRVisitorInformationOutputSchema>;

export async function ocrVisitorInformation(input: OCRVisitorInformationInput): Promise<OCRVisitorInformationOutput> {
  return ocrVisitorInformationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ocrVisitorInformationPrompt',
  input: {schema: OCRVisitorInformationInputSchema},
  output: {schema: OCRVisitorInformationOutputSchema},
  prompt: `You are an expert OCR reader that extracts data from images of identification documents.

  Extract the name and document number from the following image. Return the confidence level of the extraction as a number between 0 and 1.

  Image: {{media url=photoDataUri}}
  `,
});

const ocrVisitorInformationFlow = ai.defineFlow(
  {
    name: 'ocrVisitorInformationFlow',
    inputSchema: OCRVisitorInformationInputSchema,
    outputSchema: OCRVisitorInformationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
