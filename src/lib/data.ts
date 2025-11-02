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

const DEFAULT_COLORS = [
  "hsl(220 70% 60%)", // chart-1
  "hsl(160 60% 55%)", // chart-2
  "hsl(340 70% 65%)", // chart-3
  "hsl(40 70% 60%)",  // chart-4
  "hsl(280 60% 65%)", // chart-5
  "hsl(200 70% 60%)"
];

export const DEFAULT_BUDGETS: Budget[] = (CATEGORIES as Category[]).map((category, index) => ({
  category: category,
  limit: 500,
  spent: 0,
  icon: CATEGORY_ICONS[category] ?? 'Landmark',
  color: DEFAULT_COLORS[index % DEFAULT_COLORS.length]
}));
