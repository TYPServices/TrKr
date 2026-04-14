import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Profile } from '../lib/types';
import { DEMO_PROFILE } from '../lib/demo';

export function useProfile() {
  return useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async (): Promise<Profile> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return DEMO_PROFILE;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        // Profile row may not exist yet — fall back to auth metadata
        return {
          id: user.id,
          name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User',
          email: user.email ?? null,
          is_pro: false,
          linked_accounts: [],
        };
      }

      return data as Profile;
    },
    placeholderData: DEMO_PROFILE,
  });
}
