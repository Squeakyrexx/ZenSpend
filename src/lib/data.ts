import type { Budget, Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';

export const CATEGORY_ICONS: Record<Category, string> = {
  'Food & Drink': '🍔',
  'Transportation': '🚗',
  'Entertainment': '🎬',
  'Essentials': '🏠',
  'Shopping': '🛍️',
  'Misc': '💡',
};


export const DEFAULT_BUDGETS: Budget[] = (CATEGORIES as Category[]).map(category => ({
  category: category,
  limit: 500,
  spent: 0,
  icon: CATEGORY_ICONS[category] ?? '💡'
}));
