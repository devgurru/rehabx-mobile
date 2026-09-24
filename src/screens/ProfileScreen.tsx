import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { I18nManager, Alert } from 'react-native';
import * as Updates from 'expo-updates';
import { useQueryClient } from '@tanstack/react-query';
import { Pressable, StyleSheet, View, Switch } from 'react-native';
import { usePatient, useProgram } from '@/api/queries';
import { AppText } from '@/components/AppText';
import { SpecialtyChip } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChildGate } from '@/components/ChildGate';
import { Screen } from '@/components/Screen';
import { InfoRow, InitialsAvatar, SectionHeader } from '@/components/Section';
import { ErrorView, LoadingView } from '@/components/States';
import type { TabScreenProps } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store';
import { signOut } from '@/store/authSlice';
import { colors, spacing } from '@/theme';

export default function ProfileScreen(props: TabScreenProps<'Profile'>) {
  return <ChildGate>{(child) => <ProfileContent childId={child.id} {...props} />}</ChildGate>;
}

function ProfileContent({ childId, navigation }: TabScreenProps<'Profile'> & { childId: string }) {
  const patient = usePatient(childId);
  const program = useProgram(childId);
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation(['profile', 'home', 'program', 'assessment', 'progress', 'exercises', 'milestones']);

  const handleLanguageChange = async (lang: string) => {
    await i18n.changeLanguage(lang);
    const isRTL = lang === 'ar';
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    
    try {
      await Updates.reloadAsync();
    } catch (error) {
      Alert.alert(
        t('language'),
        lang === 'ar' 
          ? 'يرجى إعادة تشغيل التطبيق بالكامل لتطبيق التغييرات.' 
          : 'Please completely close and reopen the app to apply layout changes.'
      );
    }
  };

  if (patient.isPending) return <LoadingView />;
  if (patient.error)
    return <ErrorView error={patient.error} onRetry={() => void patient.refetch()} />;
  const p = patient.data;

  const links = [
    {
      icon: 'file-text' as const,
      label: t('assessmentSummary'),
      onPress: () => navigation.navigate('Assessment'),
    },
    {
      icon: 'flag' as const,
      label: t('goalsAndMilestones'),
      onPress: () => navigation.navigate('Milestones'),
    },
    {
      icon: 'git-commit' as const,
      label: t('rehabilitationJourney'),
      onPress: () => navigation.navigate('Timeline'),
    },
  ];

  return (
    <Screen onRefresh={() => void patient.refetch()} refreshing={patient.isRefetching}>
      <View style={styles.header}>
        <InitialsAvatar name={p.fullName} color={p.avatarColor} size={72} />
        <AppText variant="title">{p.fullName}</AppText>
        <AppText variant="body" color={colors.textSecondary}>
          {p.age} {t('yearsOld')} · {p.gender === 'MALE' ? t('boy') : t('girl')}
        </AppText>
        {p.specialty && (
          <View style={styles.chip}>
            <SpecialtyChip name={p.specialty.name} color={p.specialty.color} />
          </View>
        )}
      </View>

      <Card>
        <InfoRow label={t('diagnosis')} value={t(p.diagnosis.name)} />
        <InfoRow label={t('currentSpecialty')} value={p.specialty ? t(p.specialty.name) : '—'} />
        <InfoRow
          label={t('program')}
          value={
            p.program
              ? `${p.program.durationWeeks} ${t('weeks')} · ${t('week')} ${p.program.currentWeek}`
              : t('notStarted')
          }
        />
        <InfoRow label={t('clinician')} value={p.clinician.name} />
      </Card>

      <SectionHeader title={t('rehabilitationGoals')} />
      <Card>
        {(program.data?.goals ?? []).map((g) => (
          <View key={g.id} style={styles.goal}>
            <Feather
              name={g.status === 'ACHIEVED' ? 'check-circle' : 'target'}
              size={18}
              color={g.status === 'ACHIEVED' ? colors.success : colors.primary}
            />
            <AppText variant="bodyStrong" style={styles.flex}>
              {t(g.title)}
            </AppText>
          </View>
        ))}
      </Card>

      <Card>
        {links.map((l, i) => (
          <Pressable
            key={l.label}
            onPress={l.onPress}
            style={[styles.link, i > 0 && styles.divider]}
            accessibilityRole="button"
          >
            <Feather name={l.icon} size={18} color={colors.primary} />
            <AppText variant="bodyStrong" style={styles.flex}>
              {l.label}
            </AppText>
            <Feather name="chevron-right" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </Card>

      <SectionHeader title={t('caregiver')} />
      <Card>
        <InfoRow label={t('signedInAs')} value={user?.displayName ?? ''} />
        <InfoRow label={t('relationship')} value={t(p.caregiver.relationship)} />
      </Card>

      <SectionHeader title={t('settings') || 'Settings'} />
      <Card>
        <View style={styles.link}>
          <Feather name="globe" size={18} color={colors.primary} />
          <AppText variant="bodyStrong" style={styles.flex}>
            {t('language')}: {i18n.language === 'en' ? t('english') : t('arabic')}
          </AppText>
          <Switch
            value={i18n.language === 'ar'}
            onValueChange={(value) => handleLanguageChange(value ? 'ar' : 'en')}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={'#ffffff'}
          />
        </View>
      </Card>

      <Button
        title={t('signOut')}
        variant="secondary"
        icon="log-out"
        onPress={() => {
          queryClient.clear();
          void dispatch(signOut());
        }}
      />
      <AppText variant="caption" color={colors.textMuted} style={styles.center}>
        {t('prototypeDisclaimer')}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  goal: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  center: { textAlign: 'center' },
  chip: { alignSelf: 'center' },
});
