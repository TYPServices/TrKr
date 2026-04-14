import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Holding } from '../lib/types';
import { DEMO_HOLDINGS } from '../lib/demo';

export function useHoldings() {
  return useQuery<Holding[]>({
    queryKey: ['holdings'],
    queryFn: async (): Promise<Holding[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return DEMO_HOLDINGS;

      const { data, error } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', user.id)
        .order('current_value', { ascending: false });

      if (error) throw error;
      return (data ?? DEMO_HOLDINGS) as Holding[];
    },
    placeholderData: DEMO_HOLDINGS,
  });
}
