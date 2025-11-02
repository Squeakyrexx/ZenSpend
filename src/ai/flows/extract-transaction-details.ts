
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
import { ICONS } from '@/lib/icons.tsx';

const ExtractTransactionDetailsInputSchema = z.object({
  transactionText: z
    .string()
    .describe('A natural language description of the transaction.'),
  categories: z.array(z.string()).describe('A list of available categories to choose from.'),
});
export type ExtractTransactionDetailsInput = z.infer<
  typeof ExtractTransactionDetailsInputSchema
>;

const ExtractTransactionDetailsOutputSchema = z.object({
  amount: z.number().describe('The transaction amount in dollars.'),
  description: z.string().describe('A concise, summarized title for the transaction (e.g., "Coffee with friends").'),
  category: z.string().describe('The category of the transaction.'),
  icon: z.enum(ICONS).describe('A relevant icon name from the provided list.'),
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
  prompt: `Extract the amount, create a concise title for the description, determine the category, and find an appropriate icon for the transaction from the following text.

Text: {{{transactionText}}}

The category must be one of the following: {{#each categories}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}}.

The icon must be one of the following from this list of lucide-react icon names: ${ICONS.join(", ")}.

Output the data as a JSON object. The amount should be a number.
The description should be a short, clean title for the transaction, not the full text.

Example for input "I bought a grande latte at Starbucks with my friend": { "amount": 7, "description": "Coffee at Starbucks", "category": "Food & Drink", "icon": "Coffee" }`,
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
