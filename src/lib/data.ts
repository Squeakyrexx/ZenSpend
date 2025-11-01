import type { Budget, Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';

export const DEFAULT_BUDGETS: Budget[] = CATEGORIES.map(category => ({
  category: category as Category,
  limit: 500,
  spent: 0,
}));

export const CATEGORY_ICONS: Record<Category, string> = {
  'Food & Drink': '🍔',
  'Transportation': '🚗',
  'Entertainment': '🎬',
  'Essentials': '🏠',
  'Shopping': '🛍️',
  'Misc': '💡',
};
