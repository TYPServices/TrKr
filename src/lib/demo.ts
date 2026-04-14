import { Holding, BudgetCategory, DividendPosition, HomeData, Profile } from './types';

export const DEMO_HOME: HomeData = {
  netWorth: 487210,
  monthlyChange: 4210,
  portfolioValue: 142847,
  portfolioGainPct: 24.81,
  dividendAnnual: 1855,
  dividendGoal: 3000,
  budgetLeft: 1489,
  budgetTotal: 4800,
  budgetUsedPct: 69,
  fiProgress: 11.8,
  fiTarget: 1212000,
};

export const DEMO_HOLDINGS: Holding[] = [
  { id: '1', user_id: 'demo', symbol: 'AAPL', name: 'Apple', current_value: 8915, gain_loss_pct: 24.8, created_at: '' },
  { id: '2', user_id: 'demo', symbol: 'MSFT', name: 'Microsoft', current_value: 12686, gain_loss_pct: 19.2, created_at: '' },
  { id: '3', user_id: 'demo', symbol: 'SCHD', name: 'Schwab Div ETF', current_value: 9894, gain_loss_pct: 4.1, created_at: '' },
  { id: '4', user_id: 'demo', symbol: 'VOO', name: 'Vanguard S&P 500', current_value: 25617, gain_loss_pct: 11.4, created_at: '' },
  { id: '5', user_id: 'demo', symbol: 'VYM', name: 'Vanguard Hi Div', current_value: 10688, gain_loss_pct: 6.8, created_at: '' },
  { id: '6', user_id: 'demo', symbol: 'O', name: 'Realty Income', current_value: 4898, gain_loss_pct: 3.9, created_at: '' },
  { id: '7', user_id: 'demo', symbol: 'KO', name: 'Coca-Cola', current_value: 3791, gain_loss_pct: 20.8, created_at: '' },
  { id: '8', user_id: 'demo', symbol: 'JNJ', name: 'Johnson & Johnson', current_value: 4061, gain_loss_pct: 4.8, created_at: '' },
];

export const DEMO_BUDGET: BudgetCategory[] = [
  { id: '1', user_id: 'demo', name: 'Housing', budget_amount: 2200, spent_amount: 2200, month: 3, year: 2026, color: '#2d8a8a' },
  { id: '2', user_id: 'demo', name: 'Food & Dining', budget_amount: 800, spent_amount: 642, month: 3, year: 2026, color: '#f59e0b' },
  { id: '3', user_id: 'demo', name: 'Transportation', budget_amount: 400, spent_amount: 318, month: 3, year: 2026, color: '#22c55e' },
  { id: '4', user_id: 'demo', name: 'Utilities', budget_amount: 300, spent_amount: 267, month: 3, year: 2026, color: '#3b82f6' },
  { id: '5', user_id: 'demo', name: 'Entertainment', budget_amount: 200, spent_amount: 189, month: 3, year: 2026, color: '#ec4899' },
  { id: '6', user_id: 'demo', name: 'Shopping', budget_amount: 500, spent_amount: 423, month: 3, year: 2026, color: '#8b5cf6' },
  { id: '7', user_id: 'demo', name: 'Health', budget_amount: 250, spent_amount: 125, month: 3, year: 2026, color: '#14b8a6' },
  { id: '8', user_id: 'demo', name: 'Subscriptions', budget_amount: 150, spent_amount: 147, month: 3, year: 2026, color: '#f97316' },
];

export const DEMO_DIVIDENDS: DividendPosition[] = [
  { id: '1', user_id: 'demo', symbol: 'VOO', annual_income: 320, yield_pct: 1.25, created_at: '' },
  { id: '2', user_id: 'demo', symbol: 'SCHD', annual_income: 338, yield_pct: 3.42, created_at: '' },
  { id: '3', user_id: 'demo', symbol: 'VYM', annual_income: 307, yield_pct: 2.87, created_at: '' },
  { id: '4', user_id: 'demo', symbol: 'O', annual_income: 250, yield_pct: 5.10, created_at: '' },
  { id: '5', user_id: 'demo', symbol: 'JNJ', annual_income: 119, yield_pct: 2.94, created_at: '' },
  { id: '6', user_id: 'demo', symbol: 'KO', annual_income: 116, yield_pct: 3.05, created_at: '' },
  { id: '7', user_id: 'demo', symbol: 'MSFT', annual_income: 90, yield_pct: 0.72, created_at: '' },
  { id: '8', user_id: 'demo', symbol: 'AAPL', annual_income: 45, yield_pct: 0.52, created_at: '' },
];

export const DEMO_PROFILE: Profile = {
  id: 'demo',
  name: 'Neil',
  email: 'neil@trkr.app',
  is_pro: true,
  linked_accounts: ['JPMorgan Chase', 'Fidelity', 'Vanguard', 'Goldman Sachs'],
};
