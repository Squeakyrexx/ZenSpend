
export let CATEGORIES = [
  'Food & Drink',
  'Transportation',
  'Entertainment',
  'Essentials',
  'Shopping',
  'Misc',
] as string[];

export function setCategories(newCategories: string[]) {
    CATEGORIES = newCategories;
}

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
  icon: string;
}

export interface RecurringPayment {
  id: string;
  description: string;
  amount: number;
  category: Category;
  icon: string;
  dayOfMonth: number;
  lastLogged: string | null; // ISO string
}

export type IncomeFrequency = 'weekly' | 'bi-weekly' | 'monthly' | 'one-time';

export interface Income {
  id: string;
  description: string;
  amount: number;
  frequency: IncomeFrequency;
  startDate: string; // ISO string for fixed, date of income for one-time
}
