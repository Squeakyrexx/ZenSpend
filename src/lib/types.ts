export const CATEGORIES = [
  'Food & Drink',
  'Transportation',
  'Entertainment',
  'Essentials',
  'Shopping',
  'Misc',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: Category;
  icon: string;
  date: string; // ISO string
}

export interface Budget {
  category: Category;
  limit: number;
  spent: number;
}
