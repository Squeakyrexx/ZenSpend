import type { Budget, Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';
import type { IconName } from './icons.tsx';

export const CATEGORY_ICONS: Record<Category, IconName> = {
  'Food & Drink': 'Utensils',
  'Transportation': 'Car',
  'Entertainment': 'Ticket',
  'Essentials': 'Home',
  'Shopping': 'ShoppingBag',
  'Misc': 'Lightbulb',
};


export const DEFAULT_BUDGETS: Budget[] = (CATEGORIES as Category[]).map(category => ({
  category: category,
  limit: 500,
  spent: 0,
  icon: CATEGORY_ICONS[category] ?? 'Landmark'
}));
