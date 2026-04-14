import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { BudgetCategory } from '../lib/types';
import { DEMO_BUDGET } from '../lib/demo';

export function useBudget() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  return useQuery<BudgetCategory[]>({
    queryKey: ['budget', month, year],
    queryFn: async (): Promise<BudgetCategory[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return DEMO_BUDGET;

      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year)
        .order('budget_amount', { ascending: false });

      if (error) throw error;
      return (data ?? DEMO_BUDGET) as BudgetCategory[];
    },
    placeholderData: DEMO_BUDGET,
  });
}
