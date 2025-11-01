"use server";

import { extractTransactionDetails } from "@/ai/flows/extract-transaction-details";
import { generateSpendingInsights } from "@/ai/flows/generate-spending-insights";
import type { Transaction, Category } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

export async function parseTransaction(
  text: string
): Promise<Omit<Transaction, "id" | "date"> | { error: string }> {
  try {
    if (!text.trim()) {
      return { error: "Please enter a transaction." };
    }
    const result = await extractTransactionDetails({ transactionText: text });

    if (!result || !result.category || !CATEGORIES.includes(result.category as Category)) {
      return { error: "Could not determine a valid category for this transaction." };
    }

    return {
      amount: result.amount,
      description: result.description,
      category: result.category as Category,
      icon: result.icon,
    };
  } catch (e) {
    console.error(e);
    return { error: "Failed to parse transaction. Please check your input and try again." };
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
