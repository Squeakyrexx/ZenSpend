'use server';

/**
 * @fileOverview A flow that generates spending insights based on transaction data.
 *
 * - generateSpendingInsights - A function that generates spending insights.
 * - GenerateSpendingInsightsInput - The input type for the generateSpendingInsights function.
 * - GenerateSpendingInsightsOutput - The return type for the generateSpendingInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSpendingInsightsInputSchema = z.object({
  transactions: z.array(
    z.object({
      amount: z.number(),
      description: z.string(),
      category: z.string(),
      date: z.string(),
    })
  ).describe('An array of transaction objects.'),
});
export type GenerateSpendingInsightsInput = z.infer<typeof GenerateSpendingInsightsInputSchema>;

const GenerateSpendingInsightsOutputSchema = z.object({
  insights: z.array(z.string()).describe('An array of AI-generated spending insights.'),
  progress: z.string().describe('A short summary of the generated insights.'),
});
export type GenerateSpendingInsightsOutput = z.infer<typeof GenerateSpendingInsightsOutputSchema>;

export async function generateSpendingInsights(input: GenerateSpendingInsightsInput): Promise<GenerateSpendingInsightsOutput> {
  return generateSpendingInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSpendingInsightsPrompt',
  input: {schema: GenerateSpendingInsightsInputSchema},
  output: {schema: GenerateSpendingInsightsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the following transaction data and provide a few concise, helpful insights to the user.

Transaction Data:
{{#each transactions}}
- Amount: {{amount}}, Description: {{description}}, Category: {{category}}, Date: {{date}}
{{/each}}

Insights:`, // Added Handlebars each block
});

const generateSpendingInsightsFlow = ai.defineFlow(
  {
    name: 'generateSpendingInsightsFlow',
    inputSchema: GenerateSpendingInsightsInputSchema,
    outputSchema: GenerateSpendingInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Add a summary of what was generated
    const progress = 'Generated AI-powered spending insights based on transaction history.';
    return {
      insights: output?.insights || [],
      progress,
    };
  }
);
