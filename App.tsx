import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { Session } from '@supabase/supabase-js';

import { supabase } from './src/lib/supabase';
import { queryClient } from './src/lib/queryClient';
import { initSentry } from './src/lib/sentry';
import { fmt, fK } from './src/utils/format';
import { DEMO_HOME, DEMO_HOLDINGS, DEMO_BUDGET, DEMO_DIVIDENDS, DEMO_PROFILE } from './src/lib/demo';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AuthScreen } from './src/screens/AuthScreen';
import { useHomeData } from './src/hooks/useHomeData';
import { useHoldings } from './src/hooks/useHoldings';
import { useBudget } from './src/hooks/useBudget';
import { useDividends } from './src/hooks/useDividends';
import { useProfile } from './src/hooks/useProfile';

initSentry();

const B = {
  teal: '#2d8a8a', tl: '#5ec6c6', td: '#1a6b6b',
  bg: '#0b1117', cd: '#111820', bd: '#1a2430',
  tx: '#f0f4f8', mu: '#8a9bb0',
  gn: '#22c55e', rd: '#ef4444', am: '#f59e0b',
};

function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState('home');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) queryClient.clear(); // Clear cache on sign-out
    });
    return () => subscription.unsubscribe();
  }, []);

  const TABS = [
    { id: 'home', label: 'Home', emoji: '\u{1F3E0}' },
    { id: 'portfolio', label: 'Portfolio', emoji: '\u{1F4C8}' },
    { id: 'budget', label: 'Budget', emoji: '\u{1F4B0}' },
    { id: 'dividends', label: 'Dividends', emoji: '\u{1F4B5}' },
    { id: 'settings', label: 'Settings', emoji: '\u{2699}\u{FE0F}' },
  ];

  if (authLoading) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <View style={{ flex: 1, backgroundColor: B.bg, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: B.tl, fontSize: 32, fontWeight: '900', marginBottom: 24 }}>TrKr</Text>
          <ActivityIndicator color={B.tl} />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" />
          <SafeAreaView style={s.container}>
            <View style={s.header}>
              <Text style={s.logo}>TrKr</Text>
              <Text style={s.sync}>Synced just now</Text>
            </View>
            <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 100 }}>
              {tab === 'home' && <HomeTab />}
              {tab === 'portfolio' && <PortfolioTab />}
              {tab === 'budget' && <BudgetTab />}
              {tab === 'dividends' && <DividendTab />}
              {tab === 'settings' && <SettingsTab />}
            </ScrollView>
            <View style={s.tabBar}>
              {TABS.map(t => (
                <TouchableOpacity key={t.id} onPress={() => setTab(t.id)} style={s.tabBtn}>
                  <Text style={{ fontSize: 20 }}>{t.emoji}</Text>
                  <Text style={[s.tabLabel, tab === t.id && { color: B.teal }]}>{t.label}</Text>
                  {tab === t.id && <View style={s.tabDot} />}
                </TouchableOpacity>
              ))}
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function HomeTab() {
  const { data: home = DEMO_HOME } = useHomeData();
  const dividendPct = home.dividendGoal > 0
    ? Math.round((home.dividendAnnual / home.dividendGoal) * 100)
    : 0;

  return (
    <View style={s.tc}>
      <Card style={{ alignItems: 'center', padding: 28 }}>
        <Text style={s.label}>NET WORTH</Text>
        <Text style={s.big}>{fmt(home.netWorth)}</Text>
        <Text style={{ color: B.gn, fontWeight: '600', marginTop: 4 }}>
          +{fmt(home.monthlyChange)} this month
        </Text>
      </Card>
      <View style={s.grid}>
        <Card style={s.gridItem}>
          <Text style={s.label}>PORTFOLIO</Text>
          <Text style={s.med}>{fmt(home.portfolioValue)}</Text>
          <Text style={{ color: B.gn, fontSize: 11, fontWeight: '600' }}>
            +{home.portfolioGainPct.toFixed(2)}% all time
          </Text>
        </Card>
        <Card style={s.gridItem}>
          <Text style={s.label}>DIVIDENDS</Text>
          <Text style={[s.med, { color: B.gn }]}>{fmt(home.dividendAnnual)}</Text>
          <Text style={{ color: B.gn, fontSize: 11, fontWeight: '600' }}>
            {dividendPct}% of {fK(home.dividendGoal)} goal
          </Text>
        </Card>
        <Card style={s.gridItem}>
          <Text style={s.label}>BUDGET LEFT</Text>
          <Text style={[s.med, { color: B.am }]}>{fmt(home.budgetLeft)}</Text>
          <Text style={{ color: B.am, fontSize: 11, fontWeight: '600' }}>
            {Math.round(home.budgetUsedPct)}% used
          </Text>
        </Card>
        <Card style={s.gridItem}>
          <Text style={s.label}>FI PROGRESS</Text>
          <Text style={[s.med, { color: B.tl }]}>{home.fiProgress.toFixed(1)}%</Text>
          <Text style={{ color: B.tl, fontSize: 11, fontWeight: '600' }}>
            {fK(home.portfolioValue)} / {fK(home.fiTarget)}
          </Text>
        </Card>
      </View>
    </View>
  );
}

function PortfolioTab() {
  const { data: holdings = DEMO_HOLDINGS } = useHoldings();
  const total = holdings.reduce((sum, h) => sum + h.current_value, 0);
  const totalGain = holdings.reduce((sum, h) => sum + h.current_value * (h.gain_loss_pct / 100), 0);
  const totalGainPct = total > 0 ? (totalGain / (total - totalGain)) * 100 : 0;

  return (
    <View style={s.tc}>
      <Card style={{ alignItems: 'center' }}>
        <Text style={s.label}>TOTAL PORTFOLIO</Text>
        <Text style={s.big}>{fmt(total)}</Text>
        <Text style={{ color: B.gn, fontWeight: '600' }}>
          +{fmt(totalGain)} (+{totalGainPct.toFixed(2)}%)
        </Text>
      </Card>
      <Card>
        <Text style={s.sec}>HOLDINGS ({holdings.length})</Text>
        {holdings.map((x, i) => (
          <View key={x.id} style={[s.row, i < holdings.length - 1 && s.rowB]}>
            <View>
              <Text style={s.tk}>{x.symbol}</Text>
              <Text style={s.sub}>{x.name}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.tk}>{fmt(x.current_value)}</Text>
              <Text style={{ color: B.gn, fontSize: 12, fontWeight: '600' }}>
                +{x.gain_loss_pct.toFixed(1)}%
              </Text>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

function BudgetTab() {
  const { data: categories = DEMO_BUDGET } = useBudget();
  const totalBudget = categories.reduce((sum, c) => sum + c.budget_amount, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent_amount, 0);
  const remaining = Math.max(0, totalBudget - totalSpent);
  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' });

  return (
    <View style={s.tc}>
      <Card style={{ alignItems: 'center' }}>
        <Text style={s.label}>{monthName.toUpperCase()} BUDGET</Text>
        <Text style={s.big}>
          {fmt(totalSpent)}{' '}
          <Text style={{ fontSize: 16, color: B.mu }}>/ {fmt(totalBudget)}</Text>
        </Text>
        <Text style={{ color: B.gn, fontWeight: '600', marginTop: 4 }}>
          {fmt(remaining)} remaining
        </Text>
      </Card>
      <Card>
        <Text style={s.sec}>CATEGORIES</Text>
        {categories.map((x, i) => (
          <View key={x.id} style={{ marginBottom: i < categories.length - 1 ? 14 : 0 }}>
            <View style={s.row}>
              <Text style={s.tk}>{x.name}</Text>
              <Text style={s.tk}>
                {fmt(x.spent_amount)}{' '}
                <Text style={s.sub}>/ {fmt(x.budget_amount)}</Text>
              </Text>
            </View>
            <View style={s.bar}>
              <View style={[s.barF, {
                width: `${Math.min((x.spent_amount / x.budget_amount) * 100, 100)}%`,
                backgroundColor: x.color,
              }]} />
            </View>
            <Text style={[s.sub, { marginTop: 3 }]}>
              {x.spent_amount >= x.budget_amount ? 'Fully used' : `${fmt(x.budget_amount - x.spent_amount)} left`}
            </Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

function DividendTab() {
  const { data: divs = DEMO_DIVIDENDS } = useDividends();
  const annualTotal = divs.reduce((sum, d) => sum + d.annual_income, 0);
  const monthlyTotal = annualTotal / 12;
  const portfolioValue = DEMO_HOME.portfolioValue; // Will be replaced when portfolioValue hook added
  const yieldPct = portfolioValue > 0 ? (annualTotal / portfolioValue) * 100 : 0;
  const dividendGoal = DEMO_HOME.dividendGoal;
  const goalPct = dividendGoal > 0 ? Math.min((annualTotal / dividendGoal) * 100, 100) : 0;

  return (
    <View style={s.tc}>
      <Card style={{ alignItems: 'center', padding: 28 }}>
        <Text style={s.label}>ANNUAL DIVIDEND INCOME</Text>
        <Text style={[s.big, { color: B.gn }]}>{fmt(annualTotal)}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 16 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={s.label}>Monthly</Text>
            <Text style={s.med}>{fmt(monthlyTotal)}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={s.label}>Yield</Text>
            <Text style={s.med}>{yieldPct.toFixed(2)}%</Text>
          </View>
        </View>
      </Card>
      <Card>
        <Text style={s.sec}>DIVIDEND GOAL</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={[s.big, { color: B.gn, fontSize: 26 }]}>{fmt(annualTotal)}</Text>
          <Text style={s.sub}>of {fmt(dividendGoal)}/yr</Text>
        </View>
        <View style={[s.bar, { marginTop: 8, height: 10 }]}>
          <View style={[s.barF, { width: `${goalPct}%`, backgroundColor: B.gn, height: 10 }]} />
        </View>
        <Text style={[s.sub, { marginTop: 4 }]}>{goalPct.toFixed(1)}% achieved</Text>
      </Card>
      <Card>
        <Text style={s.sec}>BY HOLDING</Text>
        {divs.map((d, i) => (
          <View key={d.id} style={[s.row, i < divs.length - 1 && s.rowB]}>
            <View>
              <Text style={s.tk}>{d.symbol}</Text>
              <Text style={s.sub}>{d.yield_pct.toFixed(2)}% yield</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: B.gn, fontSize: 14, fontWeight: '700' }}>{fmt(d.annual_income)}/yr</Text>
              <Text style={s.sub}>{fmt(d.annual_income / 12)}/mo</Text>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

function SettingsTab() {
  const { data: profile = DEMO_PROFILE } = useProfile();
  const initial = (profile.name?.[0] ?? 'U').toUpperCase();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={s.tc}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={s.avatar}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{initial}</Text>
        </View>
        <View>
          <Text style={s.tk}>{profile.name ?? 'User'}</Text>
          <Text style={s.sub}>{profile.email ?? ''}</Text>
          {profile.is_pro && (
            <Text style={{ color: B.tl, fontSize: 11, fontWeight: '600', marginTop: 2 }}>TrKr Pro</Text>
          )}
        </View>
      </Card>
      <Card>
        <Text style={s.sec}>SECURITY</Text>
        <View style={[s.row, s.rowB]}><Text style={s.tk}>Face ID</Text><Text style={{ color: B.gn, fontWeight: '600', fontSize: 13 }}>Active</Text></View>
        <View style={[s.row, s.rowB]}><Text style={s.tk}>2FA Method</Text><Text style={{ color: B.gn, fontWeight: '600', fontSize: 13 }}>Authenticator App</Text></View>
        <View style={s.row}><Text style={s.tk}>Sign-In</Text><Text style={{ color: B.gn, fontWeight: '600', fontSize: 13 }}>Apple, Google, Email</Text></View>
      </Card>
      {profile.linked_accounts.length > 0 && (
        <Card>
          <Text style={s.sec}>LINKED ACCOUNTS</Text>
          {profile.linked_accounts.map((a, i) => (
            <View key={i} style={[s.row, i < profile.linked_accounts.length - 1 && s.rowB]}>
              <Text style={s.tk}>{a}</Text>
              <Text style={{ color: B.gn, fontSize: 12, fontWeight: '600' }}>Connected</Text>
            </View>
          ))}
        </Card>
      )}
      <Card>
        <Text style={s.sec}>TRKR PRO</Text>
        <Text style={{ color: B.mu, fontSize: 13, lineHeight: 20 }}>
          Unlimited accounts, AI advisor, mortgage analyzer, FI calculator, home value, benchmarks, CSV export.
        </Text>
        <View style={{ marginTop: 12, backgroundColor: B.td + '30', borderRadius: 10, padding: 12, alignSelf: 'flex-start' }}>
          <Text style={{ color: B.tl, fontSize: 14, fontWeight: '700' }}>$4.99/mo or $39.99/yr</Text>
        </View>
      </Card>
     <Card>
        <Text style={s.sec}>LEGAL</Text>
        {[
          { label: 'Privacy Policy', url: 'https://trkr.fyi/privacy-policy.html' },
          { label: 'Terms of Service', url: 'https://trkr.fyi/terms-of-service.html' },
          { label: 'Data Deletion Request', url: 'https://trkr.fyi/data-deletion.html' },
          { label: 'Manage Subscriptions', url: 'https://apps.apple.com/account/subscriptions' },
        ].map((x, i) => (
          <TouchableOpacity key={i} style={[s.row, i < 3 && s.rowB]} onPress={() => Linking.openURL(x.url)}>
            <Text style={{ color: B.tl, fontSize: 13 }}>{x.label}</Text>
          </TouchableOpacity>
        ))}
      </Card>
      <TouchableOpacity
        style={[s.card, { alignItems: 'center', borderColor: B.rd + '40' }]}
        onPress={handleSignOut}
      >
        <Text style={{ color: B.rd, fontWeight: '700', fontSize: 15 }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: B.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
  logo: { fontSize: 24, fontWeight: '800', color: B.tl },
  sync: { fontSize: 10, color: B.mu, marginTop: 1 },
  scroll: { flex: 1, paddingHorizontal: 14 },
  tabBar: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 8, paddingBottom: 28, borderTopWidth: 1, borderTopColor: B.bd, backgroundColor: B.bg },
  tabBtn: { alignItems: 'center', gap: 2, paddingHorizontal: 12, paddingVertical: 4 },
  tabLabel: { fontSize: 10, fontWeight: '600', color: B.mu },
  tabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: B.teal },
  tc: { gap: 12, paddingBottom: 20 },
  card: { backgroundColor: B.cd, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: B.bd },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: { flexGrow: 1, flexBasis: '45%' },
  label: { fontSize: 10, color: B.mu, fontWeight: '600' },
  big: { fontSize: 32, fontWeight: '800', color: B.tx, marginTop: 4 },
  med: { fontSize: 20, fontWeight: '700', color: B.tx, marginTop: 4 },
  sec: { fontSize: 12, fontWeight: '600', color: B.mu, letterSpacing: 1, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  rowB: { borderBottomWidth: 1, borderBottomColor: B.bd },
  tk: { fontSize: 14, fontWeight: '700', color: B.tx },
  sub: { fontSize: 11, color: B.mu },
  bar: { height: 6, backgroundColor: B.bd, borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  barF: { height: '100%', borderRadius: 3 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: B.teal, alignItems: 'center', justifyContent: 'center' },
});
