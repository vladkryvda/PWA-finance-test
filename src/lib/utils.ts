import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Dummy exchange rates. In a real app we might fetch these live or input manually.
export const EXCHANGE_RATES: Record<string, number> = {
  UAH: 1,
  EUR: 43.15,
  GBP: 50.80,
};

export const DEFAULT_CATEGORIES = [
  { id: 'cat_food', name: 'Food', icon: 'pizza', color: '#ffb703', type: 'expense' },
  { id: 'cat_transport', name: 'Transport', icon: 'bus', color: '#023047', type: 'expense' },
  { id: 'cat_shopping', name: 'Shopping', icon: 'shopping-bag', color: '#fb8500', type: 'expense' },
  { id: 'cat_entertainment', name: 'Entertainment', icon: 'film', color: '#8ecae6', type: 'expense' },
  { id: 'cat_travel', name: 'Travel', icon: 'plane', color: '#219ebc', type: 'expense' },
  { id: 'cat_health', name: 'Health', icon: 'heart', color: '#e63946', type: 'expense' },
  { id: 'cat_bills', name: 'Bills', icon: 'file-text', color: '#457b9d', type: 'expense' },
  { id: 'cat_salary', name: 'Salary', icon: 'briefcase', color: '#2a9d8f', type: 'income' },
  { id: 'cat_freelance', name: 'Freelance', icon: 'laptop', color: '#e9c46a', type: 'income' },
  { id: 'cat_other', name: 'Other', icon: 'more-horizontal', color: '#6c757d', type: 'both' },
];

export function parseTransactionInput(input: string): { amount: number, currency: string, category: string, note: string, type: 'expense' | 'income' } | null {
  // Regex to simply parse out amount, currency, category mapping
  // Example "Food 500", "Coffee 120 EUR", "Flight 120 EUR"
  
  const tokens = input.trim().split(/\s+/);
  if (tokens.length < 2) return null;

  let amount = 0;
  let currency = 'UAH';
  let potentialCategoryWords = [];
  
  // Find amount (first token that is a number)
  let amountIndex = -1;
  for (let i = 0; i < tokens.length; i++) {
    const num = parseFloat(tokens[i]);
    if (!isNaN(num) && tokens[i].match(/\d/)) {
      amount = num;
      amountIndex = i;
      break;
    }
  }

  if (amountIndex === -1) return null;

  // After amount, there might be a currency
  if (amountIndex + 1 < tokens.length) {
    const nextToken = tokens[amountIndex + 1].toUpperCase();
    if (['EUR', 'GBP', 'UAH'].includes(nextToken)) {
      currency = nextToken;
    }
  } else if (tokens[amountIndex].match(/[£€$₴]/)) {
     if (tokens[amountIndex].includes('£') || tokens[amountIndex].toUpperCase().includes('GBP')) currency = 'GBP';
     if (tokens[amountIndex].includes('€') || tokens[amountIndex].toUpperCase().includes('EUR')) currency = 'EUR';
     if (tokens[amountIndex].includes('₴') || tokens[amountIndex].toUpperCase().includes('UAH')) currency = 'UAH';
  }

  for(let i = 0; i < tokens.length; i++) {
    if (i === amountIndex) continue;
    if (['EUR', 'GBP', 'UAH'].includes(tokens[i].toUpperCase())) continue;
    potentialCategoryWords.push(tokens[i]);
  }

  const query = potentialCategoryWords.join(' ');
  const categoryMatch = matchCategory(query);

  let type: 'income' | 'expense' = 'expense';
  if (categoryMatch.type === 'income') {
    type = 'income';
  }

  return {
    amount,
    currency,
    category: categoryMatch.id,
    note: query,
    type,
  };
}

function matchCategory(text: string) {
  const lowercaseText = text.toLowerCase();
  
  const defaultMapping: Record<string, string> = {
    'coffee': 'cat_food',
    'lunch': 'cat_food',
    'dinner': 'cat_food',
    'food': 'cat_food',
    'grocery': 'cat_food',
    'groceries': 'cat_food',
    'bus': 'cat_transport',
    'taxi': 'cat_transport',
    'uber': 'cat_transport',
    'train': 'cat_transport',
    'flight': 'cat_travel',
    'hotel': 'cat_travel',
    'clothes': 'cat_shopping',
    'shoes': 'cat_shopping',
    'amazon': 'cat_shopping',
    'doctor': 'cat_health',
    'pharmacy': 'cat_health',
    'electricity': 'cat_bills',
    'internet': 'cat_bills',
    'rent': 'cat_bills',
    'salary': 'cat_salary',
    'wage': 'cat_salary',
    'freelance': 'cat_freelance',
    'project': 'cat_freelance',
    'cinema': 'cat_entertainment',
    'movie': 'cat_entertainment',
    'netflix': 'cat_entertainment',
    'spotify': 'cat_entertainment',
  };

  for (const [key, value] of Object.entries(defaultMapping)) {
    if (lowercaseText.includes(key)) {
      const match = DEFAULT_CATEGORIES.find(c => c.id === value);
      if (match) return match;
    }
  }

  // Fallback
  return DEFAULT_CATEGORIES.find(c => c.id === 'cat_other')!;
}

export function formatCurrency(amount: number, currency: string = 'UAH', compact: boolean = false) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    notation: compact ? 'compact' : 'standard'
  }).format(amount).replace('UAH', '₴').replace('GBP', '£').replace('EUR', '€');
}
