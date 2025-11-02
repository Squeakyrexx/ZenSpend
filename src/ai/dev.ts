import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-transaction.ts';
import '@/ai/flows/generate-spending-insights.ts';
import '@/ai/flows/extract-transaction-details.ts';
import '@/ai/flows/suggest-budget.ts';
