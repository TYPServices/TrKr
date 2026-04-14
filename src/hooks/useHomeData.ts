import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { HomeData } from '../lib/types';
import { DEMO_HOME } from '../lib/demo';

export function useHomeData() {
  return useQuery<HomeData>({
    queryKey: ['home-data'],
    queryFn: async (): Promise<HomeData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return DEMO_HOME;

      const { data: snapshot } = await supabase
        .from('net_worth_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!snapshot) return DEMO_HOME;

      const budgetSpent = snapshot.budget_spent ?? 0;
      const budgetTotal = snapshot.budget_total ?? 0;

      return {
        netWorth: snapshot.total_net_worth,
        monthlyChange: snapshot.monthly_change,
        portfolioValue: snapshot.portfolio_value,
        portfolioGainPct: snapshot.portfolio_gain_pct,
        dividendAnnual: snapshot.dividend_annual,
        dividendGoal: snapshot.dividend_goal,
        budgetLeft: Math.max(0, budgetTotal - budgetSpent),
        budgetTotal,
        budgetUsedPct: budgetTotal > 0 ? (budgetSpent / budgetTotal) * 100 : 0,
        fiProgress: snapshot.fi_target > 0
          ? (snapshot.total_net_worth / snapshot.fi_target) * 100
          : 0,
        fiTarget: snapshot.fi_target,
      };
    },
    placeholderData: DEMO_HOME,
  });
}
