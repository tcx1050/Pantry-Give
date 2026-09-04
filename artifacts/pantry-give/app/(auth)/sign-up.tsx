import { Feather } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useSSO, useSignUp } from '@clerk/expo';
import { type Href, Link, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';

WebBrowser.maybeCompleteAuthSession();
const C = colors.light;
const mascot = require('../../assets/images/mascot.png');

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const busy = fetchStatus === 'fetching';
  const verifying = signUp.status === 'missing_requirements' && signUp.unverifiedFields.includes('email_address') && signUp.missingFields.length === 0;

  const finish = useCallback(async () => {
    await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) return;
        router.replace(decorateUrl('/') as Href);
      },
    });
  }, [router, signUp]);

  const createAccount = async () => {
    const { error } = await signUp.password({ emailAddress: emailAddress.trim(), password });
    if (error) return;
    await signUp.verifications.sendEmailCode();
  };

  const verifyEmail = async () => {
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === 'complete') await finish();
  };

  const signUpWithGoogle = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy: 'oauth_google', redirectUrl: AuthSession.makeRedirectUri({ scheme: 'axotrak', path: 'oauth-native-callback' }) });
      if (createdSessionId) await setActive?.({ session: createdSessionId, navigate: ({ session, decorateUrl }) => { if (session?.currentTask) return; router.replace(decorateUrl('/') as Href); } });
      else Alert.alert('Almost there', 'Google sign-up needs one more step before your account is ready.');
    } catch {
      Alert.alert('Could not create account', 'Please try Google sign-up again.');
    }
  };

  const errorMessage = errors?.fields.emailAddress?.message || errors?.fields.password?.message || errors?.fields.code?.message;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          <View style={styles.logoCircle}>
            <Image source={mascot} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.brandName}>PANTRY GIVE</Text>
        </View>
        <Text style={styles.title}>{verifying ? 'Check your email' : 'Create your account'}</Text>
        <Text style={styles.subtitle}>
          {verifying
            ? `We sent a verification code to ${emailAddress}.`
            : 'Join a kinder way to track food, share more, and waste less.'}
        </Text>

        {verifying ? (
          <>
            <Text style={styles.label}>Verification code</Text>
            <View style={styles.inputWrap}>
              <Feather name="shield" size={17} color={C.mutedForeground} />
              <TextInput
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                placeholder="Enter 6-digit code"
                placeholderTextColor={C.mutedForeground}
                style={styles.input}
              />
            </View>
            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                (!code || busy) && styles.disabled,
                pressed && styles.pressed,
              ]}
              onPress={verifyEmail}
              disabled={!code || busy}
            >
              {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Verify email</Text>}
            </Pressable>
            <Pressable onPress={() => signUp.verifications.sendEmailCode()} style={styles.resend}>
              <Text style={styles.resendText}>Send me a new code</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              style={({ pressed }) => [styles.googleButton, pressed && styles.pressed, busy && styles.disabled]}
              onPress={signUpWithGoogle}
              disabled={busy}
            >
              <Text style={styles.googleMark}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </Pressable>
            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.or}>or use email</Text>
              <View style={styles.line} />
            </View>
            <Text style={styles.label}>Email address</Text>
            <View style={styles.inputWrap}>
              <Feather name="mail" size={17} color={C.mutedForeground} />
              <TextInput
                value={emailAddress}
                onChangeText={setEmailAddress}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor={C.mutedForeground}
                style={styles.input}
              />
            </View>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Feather name="lock" size={17} color={C.mutedForeground} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="At least 8 characters"
                placeholderTextColor={C.mutedForeground}
                style={styles.input}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={17} color={C.mutedForeground} />
              </Pressable>
            </View>
            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                (!emailAddress || !password || busy) && styles.disabled,
                pressed && styles.pressed,
              ]}
              onPress={createAccount}
              disabled={!emailAddress || !password || busy}
            >
              {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Create account</Text>}
            </Pressable>
            <View nativeID="clerk-captcha" />
          </>
        )}

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>{verifying ? 'Already verified? ' : 'Already have an account? '}</Text>
          <Link href={"/sign-in" as Href} asChild>
            <Pressable><Text style={styles.link}>Sign in</Text></Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background },
  content: { paddingHorizontal: 26 },
  brand: { alignItems: 'center', marginBottom: 26 },
  logoCircle: { height: 72, width: 72, borderRadius: 36, backgroundColor: '#FFFFFF', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  logo: { height: 72, width: 72 },
  brandName: { color: C.mutedForeground, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  title: { color: C.foreground, fontSize: 28, fontWeight: '800', textAlign: 'center', letterSpacing: -.7 },
  subtitle: { color: C.mutedForeground, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 9, marginBottom: 25, paddingHorizontal: 8 },
  googleButton: { height: 50, backgroundColor: '#FFFFFF', borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: C.border },
  googleMark: { color: '#4285F4', fontSize: 18, fontWeight: '800' },
  googleText: { color: C.foreground, fontSize: 14, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 22 },
  line: { height: 1, backgroundColor: C.border, flex: 1 },
  or: { color: C.mutedForeground, fontSize: 11 },
  label: { color: C.foreground, fontSize: 12, fontWeight: '700', marginBottom: 7, marginTop: 5 },
  inputWrap: { height: 50, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10, marginBottom: 10 },
  input: { color: C.foreground, flex: 1, fontSize: 14, paddingVertical: 0 },
  error: { color: C.destructive, fontSize: 11, lineHeight: 16, marginTop: 1, marginBottom: 7 },
  primaryButton: { height: 50, borderRadius: 13, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginTop: 11 },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  resend: { alignItems: 'center', marginTop: 16 },
  resendText: { color: C.primary, fontSize: 12, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  switchText: { color: C.mutedForeground, fontSize: 12 },
  link: { color: C.primary, fontSize: 12, fontWeight: '800' },
  disabled: { opacity: .55 },
  pressed: { opacity: .8 },
});