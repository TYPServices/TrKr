import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { DividendPosition } from '../lib/types';
import { DEMO_DIVIDENDS } from '../lib/demo';

export function useDividends() {
  return useQuery<DividendPosition[]>({
    queryKey: ['dividends'],
    queryFn: async (): Promise<DividendPosition[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return DEMO_DIVIDENDS;

      const { data, error } = await supabase
        .from('dividend_positions')
        .select('*')
        .eq('user_id', user.id)
        .order('annual_income', { ascending: false });

      if (error) throw error;
      return (data ?? DEMO_DIVIDENDS) as DividendPosition[];
    },
    placeholderData: DEMO_DIVIDENDS,
  });
}
