"use server";

import { extractTransactionDetails } from "@/ai/flows/extract-transaction-details";
import { generateSpendingInsights } from "@/ai/flows/generate-spending-insights";
import type { Transaction, Category } from "@/lib/types";

export async function parseTransactionDescription(
  descriptionText: string,
  categories: string[]
): Promise<Omit<Transaction, "id" | "date" | "amount"> | { error: string }> {
  try {
    if (!descriptionText.trim()) {
      return { error: "Please enter a transaction description." };
    }
    // The AI performs better with some monetary context, even if it's zero.
    const fullText = `$0 ${descriptionText}`;
    const result = await extractTransactionDetails({ transactionText: fullText, categories });

    if (!result || !result.category || !categories.includes(result.category as Category)) {
      return { error: "Could not determine a valid category for this transaction." };
    }

    // The amount is now handled on the client, so we only return AI-generated details.
    return {
      description: result.description,
      category: result.category as Category,
      icon: result.icon,
    };
  } catch (e) {
    console.error(e);
    return { error: "Failed to parse transaction. Please try a different description." };
  }
}

export async function getInsights(transactions: Transaction[]) {
  try {
    if (transactions.length === 0) {
        return { insights: ["No transactions yet. Start logging to see your insights!"], progress: "" };
    }
    const result = await generateSpendingInsights({ transactions });
    return result;
  } catch(e) {
    console.error(e);
    return { error: "Failed to generate insights." };
  }
}
