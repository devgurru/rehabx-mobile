import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogin } from '@/api/queries';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { signIn } from '@/store/authSlice';
import { useAppDispatch } from '@/store';
import { colors, fonts, radius, spacing } from '@/theme';

const DEMO = { email: 'caregiver@rehabx.demo', password: 'demo' };

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleError, setRoleError] = useState<string | null>(null);
  const [submitMode, setSubmitMode] = useState<'demo' | 'manual' | null>(null);

  const submit = (credentials: { email: string; password: string }, mode: 'demo' | 'manual') => {
    setSubmitMode(mode);
    setRoleError(null);
    login.mutate(credentials, {
      onSuccess: ({ accessToken, user }) => {
        if (user.role !== 'CAREGIVER') {
          setRoleError('This app is for families. Clinicians use the RehabX web portal.');
          return;
        }
        void dispatch(signIn({ token: accessToken, user }));
      },
    });
  };

  const error = roleError ?? (login.error instanceof Error ? login.error.message : null);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.primaryDark, colors.primary]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.bubble} />
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.hero}>
              <View style={styles.logo}>
                <AppText variant="title" color={colors.primary}>
                  R
                </AppText>
                <View style={styles.logoDot} />
              </View>
              <AppText variant="display" color="#FFFFFF">
                RehabX
              </AppText>
              <AppText variant="body" color="rgba(255,255,255,0.85)" style={styles.tagline}>
                Your child’s rehabilitation at home — guided, measured and shared with their care
                team.
              </AppText>
            </View>

            <View style={styles.sheet}>
              <AppText variant="heading">Welcome</AppText>
              <Button
                title="Continue as demo caregiver"
                icon="heart"
                iconRight="arrow-right"
                loading={login.isPending && submitMode === 'demo'}
                disabled={login.isPending}
                onPress={() => submit(DEMO, 'demo')}
              />
              <View style={styles.divider}>
                <View style={styles.line} />
                <AppText variant="caption" color={colors.textMuted}>
                  or sign in
                </AppText>
                <View style={styles.line} />
              </View>
              <TextInput
                style={styles.input}
                placeholder={DEMO.email}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                accessibilityLabel="Email"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                accessibilityLabel="Password"
                onSubmitEditing={() => submit({ email, password }, 'manual')}
              />
              {error && (
                <View style={styles.error}>
                  <Feather name="alert-circle" size={16} color={colors.danger} />
                  <AppText variant="caption" color={colors.danger} style={styles.flex}>
                    {error}
                  </AppText>
                </View>
              )}
              <Button
                title="Sign in"
                variant="secondary"
                loading={login.isPending && submitMode === 'manual'}
                disabled={!email || !password || login.isPending}
                onPress={() => submit({ email, password }, 'manual')}
              />
              <AppText variant="caption" color={colors.textMuted} style={styles.center}>
                Investor prototype · fictional demo data · not for clinical use
              </AppText>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'space-between' },
  bubble: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -80,
    right: -120,
    backgroundColor: 'rgba(255,122,89,0.18)',
  },
  hero: { padding: spacing.xxl, paddingTop: spacing.xxxl * 1.5, gap: spacing.md },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logoDot: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.coral,
  },
  tagline: { maxWidth: 320 },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.xxl,
    paddingBottom: spacing.xxxl * 1.5,
    gap: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  input: {
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
  },
  error: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  center: { textAlign: 'center' },
});
