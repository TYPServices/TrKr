import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

const B = {
  teal: '#2d8a8a', tl: '#5ec6c6', td: '#1a6b6b',
  bg: '#0b1117', cd: '#111820', bd: '#1a2430',
  tx: '#f0f4f8', mu: '#8a9bb0',
  gn: '#22c55e', rd: '#ef4444',
};

type Mode = 'signin' | 'signup';

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const showMessage = (text: string, error = true) => {
    setMessage(text);
    setIsError(error);
  };

  const handleEmailAuth = async () => {
    if (!email || !password) { showMessage('Please enter your email and password.'); return; }
    setMessage('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() || email.split('@')[0] } },
        });
        if (error) throw error;
        showMessage('Check your email for a confirmation link!', false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        // Auth state change in App.tsx handles navigation
      }
    } catch (err: unknown) {
      showMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setMessage('');
    setLoading(true);
    try {
      const redirectUri = makeRedirectUri({ scheme: 'trkr', path: 'auth' });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUri, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data.url) return;

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      if (result.type === 'success' && result.url) {
        // Supabase returns tokens in the URL fragment (#access_token=...)
        const fragment = result.url.split('#')[1] ?? '';
        const params = new URLSearchParams(fragment);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
        }
      }
    } catch (err: unknown) {
      showMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    setMessage('');
    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
      });
      if (error) throw error;
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === 'ERR_REQUEST_CANCELED') { setLoading(false); return; }
      showMessage(e.message ?? 'Apple sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setMessage('');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo */}
            <View style={s.header}>
              <Text style={s.logo}>TrKr</Text>
              <Text style={s.tagline}>Your wealth, tracked.</Text>
            </View>

            {/* Mode toggle */}
            <View style={s.toggle}>
              <TouchableOpacity
                onPress={() => switchMode('signin')}
                style={[s.toggleBtn, mode === 'signin' && s.toggleActive]}
              >
                <Text style={[s.toggleText, mode === 'signin' && s.toggleActiveText]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => switchMode('signup')}
                style={[s.toggleBtn, mode === 'signup' && s.toggleActive]}
              >
                <Text style={[s.toggleText, mode === 'signup' && s.toggleActiveText]}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={s.form}>
              {mode === 'signup' && (
                <TextInput
                  style={s.input}
                  placeholder="Full name"
                  placeholderTextColor={B.mu}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              )}
              <TextInput
                style={s.input}
                placeholder="Email"
                placeholderTextColor={B.mu}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              <TextInput
                style={s.input}
                placeholder="Password"
                placeholderTextColor={B.mu}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleEmailAuth}
              />

              {message ? (
                <Text style={[s.message, isError ? s.errorText : s.successText]}>{message}</Text>
              ) : null}

              <TouchableOpacity
                style={[s.primaryBtn, loading && { opacity: 0.6 }]}
                onPress={handleEmailAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.primaryBtnText}>
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>or continue with</Text>
              <View style={s.dividerLine} />
            </View>

            {/* OAuth buttons */}
            <TouchableOpacity
              style={[s.oauthBtn, loading && { opacity: 0.6 }]}
              onPress={handleGoogle}
              disabled={loading}
            >
              <Text style={s.googleIcon}>G</Text>
              <Text style={s.oauthBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                cornerRadius={14}
                style={s.appleBtn}
                onPress={handleApple}
              />
            )}

            <Text style={s.legal}>
              By continuing, you agree to our{' '}
              <Text style={{ color: B.tl }}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={{ color: B.tl }}>Privacy Policy</Text>.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: B.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 48, fontWeight: '900', color: B.tl, letterSpacing: -1 },
  tagline: { fontSize: 14, color: B.mu, marginTop: 4, fontWeight: '500' },
  toggle: {
    flexDirection: 'row',
    backgroundColor: B.cd,
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: B.bd,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 11 },
  toggleActive: { backgroundColor: B.teal },
  toggleText: { fontSize: 14, fontWeight: '700', color: B.mu },
  toggleActiveText: { color: '#fff' },
  form: { gap: 12, marginBottom: 24 },
  input: {
    backgroundColor: B.cd,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: B.tx,
    borderWidth: 1,
    borderColor: B.bd,
  },
  message: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
  errorText: { color: B.rd },
  successText: { color: B.gn },
  primaryBtn: {
    backgroundColor: B.teal,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: B.bd },
  dividerText: { fontSize: 12, color: B.mu, fontWeight: '500' },
  oauthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: B.cd,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: B.bd,
  },
  googleIcon: { fontSize: 18, fontWeight: '900', color: '#4285F4' },
  oauthBtnText: { fontSize: 15, fontWeight: '600', color: B.tx },
  appleBtn: { height: 50, marginBottom: 12 },
  legal: { fontSize: 11, color: B.mu, textAlign: 'center', lineHeight: 16, marginTop: 8 },
});
