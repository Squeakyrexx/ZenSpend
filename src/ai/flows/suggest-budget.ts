
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

const SuggestBudgetInputSchema = z.object({
  income: z.number().describe('The total monthly income of the user.'),
  transactions: z.array(
    z.object({
      amount: z.number(),
      category: z.string(),
      date: z.string(),
    })
  ).describe('An array of transaction objects from the past month.'),
  recurringPayments: z.array(
    z.object({
      amount: z.number(),
      category: z.string(),
    })
  ).describe('An array of recurring monthly payments.'),
  categories: z.array(z.string()).describe('An array of the users existing budget categories.'),
});
export type SuggestBudgetInput = z.infer<typeof SuggestBudgetInputSchema>;

export type SuggestBudgetOutput = Record<string, number>;


export async function suggestBudget(input: SuggestBudgetInput): Promise<SuggestBudgetOutput> {
  // Dynamically create the output schema based on the provided categories
  const categoryBudgets = input.categories.reduce((acc, category) => {
    acc[category] = z.number().describe(`The suggested budget for ${category}.`);
    return acc;
  }, {} as Record<string, z.ZodNumber>);
  
  const SuggestBudgetOutputSchema = z.object(categoryBudgets);

  const prompt = ai.definePrompt({
    name: 'suggestBudgetPrompt',
    input: {schema: SuggestBudgetInputSchema},
    output: {schema: SuggestBudgetOutputSchema},
    prompt: `You are a helpful and experienced personal finance assistant. Your goal is to help a user create a realistic and effective monthly budget.

You will be given the user's total monthly income, their transaction history for the past month (discretionary spending), their list of fixed recurring monthly payments (like rent and subscriptions), and their existing list of budget categories.

Your task is to analyze their income and spending patterns to suggest a reasonable budget limit for each category.

Here's your process:
1.  First, account for the fixed costs from the recurring payments. These are non-negotiable monthly expenses.
2.  Next, analyze the discretionary spending from the past month's transactions. Identify trends and areas where spending is high.
3.  For each category, propose a budget limit. For categories with recurring payments, the budget should be at least the sum of those payments. For discretionary categories, use their past spending as a baseline, but suggest a realistic limit. Don't just copy the past spending; suggest a rounded, sensible number that encourages mindful spending without being overly restrictive.
4.  The SUM of all suggested budget limits should NOT exceed the user's monthly income. Leave a small buffer if possible.

User's Monthly Income: {{{income}}}

User's Categories:
{{#each categories}}
- {{this}}
{{/each}}

Fixed Recurring Payments (this month):
{{#each recurringPayments}}
- Category: {{category}}, Amount: {{amount}}
{{/each}}

Discretionary Spending (past month):
{{#each transactions}}
- Category: {{category}}, Amount: {{amount}}
{{/each}}

Return the suggestions as a JSON object where the keys are the category names and the values are the suggested numerical budget limits (use whole numbers). IMPORTANT: The JSON keys must be the exact category names provided. Make sure to enclose any category names that contain spaces or special characters in double quotes.
`,
  });

  const {output} = await prompt(input);
  return output!;
}
