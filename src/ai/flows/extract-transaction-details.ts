'use server';

/**
 * @fileOverview Extracts transaction details from natural language input.
 *
 * - extractTransactionDetails - A function that extracts amount, description, category, and icon from a transaction description.
 * - ExtractTransactionDetailsInput - The input type for the extractTransactionDetails function.
 * - ExtractTransactionDetailsOutput - The return type for the extractTransactionDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTransactionDetailsInputSchema = z.object({
  transactionText: z
    .string()
    .describe('A natural language description of the transaction.'),
});
export type ExtractTransactionDetailsInput = z.infer<
  typeof ExtractTransactionDetailsInputSchema
>;

const ExtractTransactionDetailsOutputSchema = z.object({
  amount: z.number().describe('The transaction amount in dollars.'),
  description: z.string().describe('A short description of the transaction.'),
  category: z.string().describe('The category of the transaction.'),
  icon: z.string().describe('An emoji or icon representing the category.'),
});
export type ExtractTransactionDetailsOutput = z.infer<
  typeof ExtractTransactionDetailsOutputSchema
>;

export async function extractTransactionDetails(
  input: ExtractTransactionDetailsInput
): Promise<ExtractTransactionDetailsOutput> {
  return extractTransactionDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTransactionDetailsPrompt',
  input: {schema: ExtractTransactionDetailsInputSchema},
  output: {schema: ExtractTransactionDetailsOutputSchema},
  prompt: `Extract the amount, description, category, and an appropriate icon for the transaction from the following text.\n\nText: {{{transactionText}}}\n\nOutput the data as a JSON object. The amount should be a number, and the icon should be an emoji.\nEnsure that the amount is in dollars, and the description clearly explains the expense.\nThe category must be from the following list: Food & Drink, Transportation, Entertainment, Essentials, Shopping, Misc.\nExample: { \"amount\": 7, \"description\": \"Coffee from Tim Hortons\", \"category\": \"Food & Drink\", \"icon\": \"☕\" }`,
});

const extractTransactionDetailsFlow = ai.defineFlow(
  {
    name: 'extractTransactionDetailsFlow',
    inputSchema: ExtractTransactionDetailsInputSchema,
    outputSchema: ExtractTransactionDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
