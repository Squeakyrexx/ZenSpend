'use server';

/**
 * @fileOverview AI agent to categorize transactions based on user input.
 *
 * - categorizeTransaction - A function that categorizes a transaction.
 * - CategorizeTransactionInput - The input type for categorizeTransaction.
 * - CategorizeTransactionOutput - The return type for categorizeTransaction.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorySchema = z.enum([
  'Food & Drink',
  'Transportation',
  'Entertainment',
  'Essentials',
  'Shopping',
  'Misc',
]);

const CategorizeTransactionInputSchema = z.object({
  transactionText: z
    .string()
    .describe('The raw text of the transaction, e.g., "$7 coffee from Starbucks".'),
});
export type CategorizeTransactionInput = z.infer<typeof CategorizeTransactionInputSchema>;

const CategorizeTransactionOutputSchema = z.object({
  amount: z.number().describe('The amount of the transaction.'),
  description: z.string().describe('A short description of the transaction.'),
  category: CategorySchema.describe('The category of the transaction.'),
  icon: z.string().describe('An emoji or icon representing the category.'),
});
export type CategorizeTransactionOutput = z.infer<typeof CategorizeTransactionOutputSchema>;

export async function categorizeTransaction(
  input: CategorizeTransactionInput
): Promise<CategorizeTransactionOutput> {
  return categorizeTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: {schema: CategorizeTransactionInputSchema},
  output: {schema: CategorizeTransactionOutputSchema},
  prompt: `You are a personal finance expert. Given the following transaction text, extract the amount, create a short description, determine the most appropriate category, and assign a relevant icon.

Transaction Text: {{{transactionText}}}

Respond in JSON format.
`,
});

const categoryIcons: {[key in CategorySchema]: string} = {
  'Food & Drink': '🍔',
  Transportation: '🚗',
  Entertainment: '🎬',
  Essentials: '🏠',
  Shopping: '🛍️',
  Misc: '💡',
};

const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    // Assign icon based on the predicted category
    const category = output!.category as keyof typeof categoryIcons;
    output!.icon = categoryIcons[category];

    return output!;
  }
);
