
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
import { ICONS } from '@/lib/icons';

const GenerateSpendingInsightsInputSchema = z.object({
  transactions: z
    .array(
      z.object({
        amount: z.number(),
        description: z.string(),
        category: z.string(),
        date: z.string(),
      })
    )
    .describe('An array of transaction objects.'),
  categories: z.array(z.string()).describe('A list of available categories.'),
});
export type GenerateSpendingInsightsInput = z.infer<
  typeof GenerateSpendingInsightsInputSchema
>;

const InsightSchema = z.object({
  type: z.enum(['observation', 'suggestion', 'alert', 'positive']).describe("The type of insight: 'observation' for a neutral fact, 'suggestion' for an actionable tip, 'alert' for a potential issue, or 'positive' for encouragement."),
  title: z.string().describe('A short, catchy headline for the insight.'),
  description: z.string().describe('The full, helpful description of the insight.'),
  category: z.string().describe('The primary category this insight relates to.'),
  icon: z.enum(ICONS).describe('A relevant lucide-react icon name for the insight.'),
});

const GenerateSpendingInsightsOutputSchema = z.object({
  insights: z.array(InsightSchema).describe('An array of AI-generated spending insights.'),
});
export type GenerateSpendingInsightsOutput = z.infer<
  typeof GenerateSpendingInsightsOutputSchema
>;
export type Insight = z.infer<typeof InsightSchema>;


export async function generateSpendingInsights(
  input: GenerateSpendingInsightsInput
): Promise<GenerateSpendingInsightsOutput> {
  return generateSpendingInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSpendingInsightsPrompt',
  input: {schema: GenerateSpendingInsightsInputSchema},
  output: {schema: GenerateSpendingInsightsOutputSchema},
  prompt: `You are a friendly and insightful personal finance advisor named Zen. Your goal is to help the user understand their spending habits by analyzing their transaction data from the past month.

Analyze the following transactions and generate 2-4 structured insights.

Your insights should be:
- **Actionable:** Provide concrete suggestions where possible.
- **Personalized:** Reference specific categories or spending patterns.
- **Varied:** Include a mix of observations, suggestions, and positive reinforcement. Avoid being overly critical.
- **Concise:** Get straight to the point.

Transaction Data:
{{#each transactions}}
- Amount: \${{amount}}, Description: "{{description}}", Category: "{{category}}", Date: {{date}}
{{/each}}

Here are the available categories: {{#each categories}}"{{this}}"{{#unless @last}}, {{/unless}}{{/each}}.
The icon for each insight must be one of the following from this list of lucide-react icon names: ${ICONS.join(
    ', '
  )}.

For each insight, you must provide:
- A 'type': 'observation', 'suggestion', 'alert', or 'positive'.
- A 'title': A short, catchy headline.
- A 'description': The helpful advice or observation.
- A 'category': The most relevant spending category.
- An 'icon': A suitable icon name from the list.

Example Output Insight:
{
  "type": "suggestion",
  "title": "Tackle Your Top Expense",
  "description": "Your spending on 'Food & Drink' was your highest this month. Look for opportunities to cook at home to save some cash.",
  "category": "Food & Drink",
  "icon": "Utensils"
}

Generate a JSON object containing a list of these structured insights under the 'insights' key.
`,
});

const generateSpendingInsightsFlow = ai.defineFlow(
  {
    name: 'generateSpendingInsightsFlow',
    inputSchema: GenerateSpendingInsightsInputSchema,
    outputSchema: GenerateSpendingInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      insights: output?.insights || [],
    };
  }
);
