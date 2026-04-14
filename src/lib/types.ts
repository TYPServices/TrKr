export interface Holding {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  current_value: number;
  gain_loss_pct: number;
  created_at: string;
  updated_at?: string;
}

export interface BudgetCategory {
  id: string;
  user_id: string;
  name: string;
  budget_amount: number;
  spent_amount: number;
  month: number;
  year: number;
  color: string;
}

export interface DividendPosition {
  id: string;
  user_id: string;
  symbol: string;
  annual_income: number;
  yield_pct: number;
  created_at: string;
}

export interface NetWorthSnapshot {
  id: string;
  user_id: string;
  total_net_worth: number;
  portfolio_value: number;
  portfolio_gain_pct: number;
  monthly_change: number;
  dividend_annual: number;
  dividend_goal: number;
  budget_total: number;
  budget_spent: number;
  fi_target: number;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  is_pro: boolean;
  linked_accounts: string[];
}

export interface HomeData {
  netWorth: number;
  monthlyChange: number;
  portfolioValue: number;
  portfolioGainPct: number;
  dividendAnnual: number;
  dividendGoal: number;
  budgetLeft: number;
  budgetTotal: number;
  budgetUsedPct: number;
  fiProgress: number;
  fiTarget: number;
}
