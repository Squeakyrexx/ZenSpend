
'use server';

/**
 * @fileOverview An AI agent that suggests budget limits based on income and spending history.
 *
 * - suggestBudget - A function that suggests budget limits.
 * - SuggestBudgetInput - The input type for the suggestBudget function.
 * - SuggestBudgetOutput - The return type for the suggestBudget function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SuggestBudgetInputSchema = z.object({
  income: z.number().describe('The total monthly income of the user.'),
  transactions: z.array(
    z.object({
      amount: z.number(),
      category: z.string(),
      date: z.string(),
    })
  ).describe('An array of transaction objects from the past month.'),
  categories: z.array(z.string()).describe('An array of the users existing budget categories.'),
});
export type SuggestBudgetInput = z.infer<typeof SuggestBudgetInputSchema>;

export const SuggestBudgetOutputSchema = z.record(z.string(), z.number())
    .describe('An object where keys are category names and values are the suggested budget limits.');
export type SuggestBudgetOutput = z.infer<typeof SuggestBudgetOutputSchema>;

export async function suggestBudget(input: SuggestBudgetInput): Promise<SuggestBudgetOutput> {
  return suggestBudgetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBudgetPrompt',
  input: {schema: SuggestBudgetInputSchema},
  output: {schema: SuggestBudgetOutputSchema},
  prompt: `You are a helpful personal finance assistant. Your goal is to help a user create a reasonable monthly budget.

You will be given the user's total monthly income, their transaction history for the past month, and their existing list of budget categories.

Analyze their income and spending patterns. A good budget should be realistic. Use their past spending in each category as a baseline, but also consider standard budgeting principles (like the 50/30/20 rule for needs, wants, and savings, but don't mention it explicitly).

Based on your analysis, provide a suggested monthly budget limit for each of the user's categories. The sum of all suggested budget limits should not exceed their monthly income.

User's Monthly Income: {{{income}}}

User's Categories:
{{#each categories}}
- {{this}}
{{/each}}

Past Month's Transactions:
{{#each transactions}}
- Category: {{category}}, Amount: {{amount}}
{{/each}}

Return the suggestions as a JSON object where the keys are the category names and the values are the suggested numerical budget limits. IMPORTANT: If a category name contains a space or special character, it MUST be enclosed in double quotes to be a valid JSON key.
`,
});

const suggestBudgetFlow = ai.defineFlow(
  {
    name: 'suggestBudgetFlow',
    inputSchema: SuggestBudgetInputSchema,
    outputSchema: SuggestBudgetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
