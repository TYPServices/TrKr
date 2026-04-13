import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const B = {
  teal: '#2d8a8a', tl: '#5ec6c6', td: '#1a6b6b',
  bg: '#0b1117', cd: '#111820', bd: '#1a2430',
  tx: '#f0f4f8', mu: '#8a9bb0',
  gn: '#22c55e', rd: '#ef4444', am: '#f59e0b',
};

const fmt = (n: number) => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD',
  minimumFractionDigits: Math.abs(n) < 100 ? 2 : 0,
  maximumFractionDigits: Math.abs(n) < 100 ? 2 : 0,
}).format(n);
const fK = (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(0)}K` : fmt(n);

function Card({ children, style }: any) {
  return <View style={[s.card, style]}>{children}</View>;
}

export default function App() {
  const [tab, setTab] = useState('home');
  const TABS = [
    { id: 'home', label: 'Home', emoji: '\u{1F3E0}' },
    { id: 'portfolio', label: 'Portfolio', emoji: '\u{1F4C8}' },
    { id: 'budget', label: 'Budget', emoji: '\u{1F4B0}' },
    { id: 'dividends', label: 'Dividends', emoji: '\u{1F4B5}' },
    { id: 'settings', label: 'Settings', emoji: '\u{2699}\u{FE0F}' },
  ];

  return (
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
  );
}

function HomeTab() {
  return (
    <View style={s.tc}>
      <Card style={{ alignItems: 'center', padding: 28 }}>
        <Text style={s.label}>NET WORTH</Text>
        <Text style={s.big}>{fmt(487210)}</Text>
        <Text style={{ color: B.gn, fontWeight: '600', marginTop: 4 }}>+$4,210 this month</Text>
      </Card>
      <View style={s.grid}>
        <Card style={s.gridItem}><Text style={s.label}>PORTFOLIO</Text><Text style={s.med}>{fmt(142847)}</Text><Text style={{ color: B.gn, fontSize: 11, fontWeight: '600' }}>+24.81% all time</Text></Card>
        <Card style={s.gridItem}><Text style={s.label}>DIVIDENDS</Text><Text style={[s.med, { color: B.gn }]}>{fmt(1855)}</Text><Text style={{ color: B.gn, fontSize: 11, fontWeight: '600' }}>62% of $3K goal</Text></Card>
        <Card style={s.gridItem}><Text style={s.label}>BUDGET LEFT</Text><Text style={[s.med, { color: B.am }]}>{fmt(1489)}</Text><Text style={{ color: B.am, fontSize: 11, fontWeight: '600' }}>69% used</Text></Card>
        <Card style={s.gridItem}><Text style={s.label}>FI PROGRESS</Text><Text style={[s.med, { color: B.tl }]}>11.8%</Text><Text style={{ color: B.tl, fontSize: 11, fontWeight: '600' }}>{fK(142847)} / {fK(1212000)}</Text></Card>
      </View>
    </View>
  );
}

function PortfolioTab() {
  const h = [
    { t: 'AAPL', n: 'Apple', v: 8915, g: 24.8 },
    { t: 'MSFT', n: 'Microsoft', v: 12686, g: 19.2 },
    { t: 'SCHD', n: 'Schwab Div ETF', v: 9894, g: 4.1 },
    { t: 'VOO', n: 'Vanguard S&P 500', v: 25617, g: 11.4 },
    { t: 'VYM', n: 'Vanguard Hi Div', v: 10688, g: 6.8 },
    { t: 'O', n: 'Realty Income', v: 4898, g: 3.9 },
    { t: 'KO', n: 'Coca-Cola', v: 3791, g: 20.8 },
    { t: 'JNJ', n: 'Johnson & Johnson', v: 4061, g: 4.8 },
  ];
  return (
    <View style={s.tc}>
      <Card style={{ alignItems: 'center' }}>
        <Text style={s.label}>TOTAL PORTFOLIO</Text>
        <Text style={s.big}>{fmt(142847)}</Text>
        <Text style={{ color: B.gn, fontWeight: '600' }}>+{fmt(28400)} (+24.81%)</Text>
      </Card>
      <Card>
        <Text style={s.sec}>HOLDINGS ({h.length})</Text>
        {h.map((x, i) => (
          <View key={i} style={[s.row, i < h.length - 1 && s.rowB]}>
            <View><Text style={s.tk}>{x.t}</Text><Text style={s.sub}>{x.n}</Text></View>
            <View style={{ alignItems: 'flex-end' }}><Text style={s.tk}>{fmt(x.v)}</Text><Text style={{ color: B.gn, fontSize: 12, fontWeight: '600' }}>+{x.g}%</Text></View>
          </View>
        ))}
      </Card>
    </View>
  );
}

function BudgetTab() {
  const c = [
    { n: 'Housing', b: 2200, s: 2200, cl: B.teal },
    { n: 'Food & Dining', b: 800, s: 642, cl: B.am },
    { n: 'Transportation', b: 400, s: 318, cl: B.gn },
    { n: 'Utilities', b: 300, s: 267, cl: '#3b82f6' },
    { n: 'Entertainment', b: 200, s: 189, cl: '#ec4899' },
    { n: 'Shopping', b: 500, s: 423, cl: '#8b5cf6' },
    { n: 'Health', b: 250, s: 125, cl: '#14b8a6' },
    { n: 'Subscriptions', b: 150, s: 147, cl: '#f97316' },
  ];
  return (
    <View style={s.tc}>
      <Card style={{ alignItems: 'center' }}>
        <Text style={s.label}>MARCH BUDGET</Text>
        <Text style={s.big}>{fmt(4311)} <Text style={{ fontSize: 16, color: B.mu }}>/ {fmt(4800)}</Text></Text>
        <Text style={{ color: B.gn, fontWeight: '600', marginTop: 4 }}>{fmt(489)} remaining</Text>
      </Card>
      <Card>
        <Text style={s.sec}>CATEGORIES</Text>
        {c.map((x, i) => (
          <View key={i} style={{ marginBottom: 14 }}>
            <View style={s.row}><Text style={s.tk}>{x.n}</Text><Text style={s.tk}>{fmt(x.s)} <Text style={s.sub}>/ {fmt(x.b)}</Text></Text></View>
            <View style={s.bar}><View style={[s.barF, { width: `${Math.min((x.s / x.b) * 100, 100)}%`, backgroundColor: x.cl }]} /></View>
            <Text style={[s.sub, { marginTop: 3 }]}>{x.s >= x.b ? 'Fully used' : `${fmt(x.b - x.s)} left`}</Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

function DividendTab() {
  const divs = [
    { t: 'VOO', a: 320, y: 1.25 }, { t: 'SCHD', a: 338, y: 3.42 },
    { t: 'VYM', a: 307, y: 2.87 }, { t: 'O', a: 250, y: 5.10 },
    { t: 'JNJ', a: 119, y: 2.94 }, { t: 'KO', a: 116, y: 3.05 },
    { t: 'MSFT', a: 90, y: 0.72 }, { t: 'AAPL', a: 45, y: 0.52 },
  ];
  return (
    <View style={s.tc}>
      <Card style={{ alignItems: 'center', padding: 28 }}>
        <Text style={s.label}>ANNUAL DIVIDEND INCOME</Text>
        <Text style={[s.big, { color: B.gn }]}>{fmt(1855)}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 16 }}>
          <View style={{ alignItems: 'center' }}><Text style={s.label}>Monthly</Text><Text style={s.med}>{fmt(155)}</Text></View>
          <View style={{ alignItems: 'center' }}><Text style={s.label}>Yield</Text><Text style={s.med}>1.30%</Text></View>
          <View style={{ alignItems: 'center' }}><Text style={s.label}>YoC</Text><Text style={s.med}>1.62%</Text></View>
        </View>
      </Card>
      <Card>
        <Text style={s.sec}>DIVIDEND GOAL</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={[s.big, { color: B.gn, fontSize: 26 }]}>{fmt(1855)}</Text>
          <Text style={s.sub}>of {fmt(3000)}/yr</Text>
        </View>
        <View style={[s.bar, { marginTop: 8, height: 10 }]}><View style={[s.barF, { width: '61.8%', backgroundColor: B.gn, height: 10 }]} /></View>
        <Text style={[s.sub, { marginTop: 4 }]}>61.8% achieved</Text>
      </Card>
      <Card>
        <Text style={s.sec}>BY HOLDING</Text>
        {divs.map((d, i) => (
          <View key={i} style={[s.row, i < divs.length - 1 && s.rowB]}>
            <View><Text style={s.tk}>{d.t}</Text><Text style={s.sub}>{d.y}% yield</Text></View>
            <View style={{ alignItems: 'flex-end' }}><Text style={{ color: B.gn, fontSize: 14, fontWeight: '700' }}>{fmt(d.a)}/yr</Text><Text style={s.sub}>{fmt(d.a / 12)}/mo</Text></View>
          </View>
        ))}
      </Card>
    </View>
  );
}

function SettingsTab() {
  return (
    <View style={s.tc}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={s.avatar}><Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>N</Text></View>
        <View><Text style={s.tk}>Neil</Text><Text style={s.sub}>neil@trkr.app</Text><Text style={{ color: B.tl, fontSize: 11, fontWeight: '600', marginTop: 2 }}>TrKr Pro</Text></View>
      </Card>
      <Card>
        <Text style={s.sec}>SECURITY</Text>
        <View style={[s.row, s.rowB]}><Text style={s.tk}>Face ID</Text><Text style={{ color: B.gn, fontWeight: '600', fontSize: 13 }}>Active</Text></View>
        <View style={[s.row, s.rowB]}><Text style={s.tk}>2FA Method</Text><Text style={{ color: B.gn, fontWeight: '600', fontSize: 13 }}>Authenticator App</Text></View>
        <View style={s.row}><Text style={s.tk}>Sign-In</Text><Text style={{ color: B.gn, fontWeight: '600', fontSize: 13 }}>Apple, Google, Email</Text></View>
      </Card>
      <Card>
        <Text style={s.sec}>LINKED ACCOUNTS</Text>
        {['JPMorgan Chase', 'Fidelity', 'Vanguard', 'Goldman Sachs'].map((a, i) => (
          <View key={i} style={[s.row, i < 3 && s.rowB]}><Text style={s.tk}>{a}</Text><Text style={{ color: B.gn, fontSize: 12, fontWeight: '600' }}>Connected</Text></View>
        ))}
      </Card>
      <Card>
        <Text style={s.sec}>TRKR PRO</Text>
        <Text style={{ color: B.mu, fontSize: 13, lineHeight: 20 }}>Unlimited accounts, AI advisor, mortgage analyzer, FI calculator, home value, benchmarks, CSV export.</Text>
        <View style={{ marginTop: 12, backgroundColor: B.td + '30', borderRadius: 10, padding: 12, alignSelf: 'flex-start' }}>
          <Text style={{ color: B.tl, fontSize: 14, fontWeight: '700' }}>$4.99/mo or $39.99/yr</Text>
        </View>
      </Card>
      <Card>
        <Text style={s.sec}>LEGAL</Text>
        {['Privacy Policy', 'Terms of Service', 'Data Deletion Request', 'Manage Subscriptions'].map((x, i) => (
          <View key={i} style={[s.row, i < 3 && s.rowB]}><Text style={{ color: B.tl, fontSize: 13 }}>{x}</Text></View>
        ))}
      </Card>
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