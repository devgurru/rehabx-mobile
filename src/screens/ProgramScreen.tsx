import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMilestones, useProgram, useProgress } from '@/api/queries';
import { AppText } from '@/components/AppText';
import { MilestoneStatusBadge, SpecialtyChip } from '@/components/Badge';
import { Card } from '@/components/Card';
import { ChildGate } from '@/components/ChildGate';
import { ProgressBar } from '@/components/Progress';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/Section';
import { EmptyView, ErrorView, LoadingView } from '@/components/States';
import { formatDate } from '@/lib/format';
import type { TabScreenProps } from '@/navigation/types';
import { colors, radius, spacing } from '@/theme';

export default function ProgramScreen(props: TabScreenProps<'Program'>) {
  return <ChildGate>{(child) => <ProgramContent childId={child.id} {...props} />}</ChildGate>;
}

function ProgramContent({ childId, navigation }: TabScreenProps<'Program'> & { childId: string }) {
  const { t } = useTranslation('program');
  const program = useProgram(childId);
  const progress = useProgress(childId);
  const milestones = useMilestones(childId);

  if (program.isPending) return <LoadingView />;
  if (program.error)
    return <ErrorView error={program.error} onRetry={() => void program.refetch()} />;
  const p = program.data;
  if (!p)
    return (
      <Screen>
        <AppText variant="title">{t('rehabilitationPlan')}</AppText>
        <EmptyView
          icon="clipboard"
          title={t('planBeingPrepared')}
          message={t('planBeingPreparedMessage')}
        />
      </Screen>
    );

  const refresh = () =>
    void Promise.all([program.refetch(), progress.refetch(), milestones.refetch()]);

  return (
    <Screen onRefresh={refresh} refreshing={program.isRefetching}>
      <AppText variant="title">{t('rehabilitationPlan')}</AppText>

      <Card>
        <SpecialtyChip name={t(p.specialty.name)} color={p.specialty.color} />
        <AppText variant="heading">{t(p.name)}</AppText>
        <View style={styles.stats}>
          {[
            { icon: 'calendar' as const, label: t('duration'), value: t('weeksCount', { count: p.durationWeeks }) },
            { icon: 'repeat' as const, label: t('frequency'), value: t('frequencyCount', { count: p.sessionsPerWeek }) },
            { icon: 'clock' as const, label: t('started'), value: formatDate(p.startDate) },
          ].map((s) => (
            <View key={s.label} style={styles.stat}>
              <Feather name={s.icon} size={16} color={colors.primary} />
              <AppText variant="caption" color={colors.textSecondary}>
                {s.label}
              </AppText>
              <AppText variant="bodyStrong">{s.value}</AppText>
            </View>
          ))}
        </View>
        <View style={styles.weekRow}>
          <AppText variant="caption" color={colors.textSecondary}>
            {t('weekXofY', { current: p.currentWeek, total: p.durationWeeks })}
          </AppText>
        </View>
        <ProgressBar value={(p.currentWeek / p.durationWeeks) * 100} />
      </Card>

      <SectionHeader title={t('goals')} />
      <Card>
        {(progress.data?.goals ?? p.goals.map((g) => ({ ...g, progress: 0 }))).map((g) => (
          <View key={g.id} style={styles.goal}>
            <View style={styles.goalHead}>
              <Feather name="target" size={16} color={colors.primary} />
              <AppText variant="bodyStrong" style={styles.flex}>
                {t(g.title)}
              </AppText>
              <AppText variant="bodyStrong">{g.progress}%</AppText>
            </View>
            <ProgressBar value={g.progress} height={6} />
          </View>
        ))}
      </Card>

      <SectionHeader
        title={t('exerciseSchedule')}
        action={t('today')}
        onAction={() => navigation.navigate('Main', { screen: 'Exercises' })}
      />
      <Card>
        {p.exercises.map((e, i) => (
          <View key={e.id} style={[styles.exercise, i > 0 && styles.divider]}>
            <View style={styles.number}>
              <AppText variant="bodyStrong" color={colors.primary}>
                {i + 1}
              </AppText>
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyStrong">{t(e.name)}</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                {e.reps ? t('repsCount', { count: e.reps }) : ''}
                {t('minFreq', { min: e.durationMin, freq: e.frequencyPerWeek })}
              </AppText>
            </View>
            {e.motionKey && (
              <Feather
                name="box"
                size={16}
                color={colors.primary}
                accessibilityLabel="Has 3D guide"
              />
            )}
          </View>
        ))}
      </Card>

      <SectionHeader
        title={t('milestones')}
        action={t('viewAll')}
        onAction={() => navigation.navigate('Milestones')}
      />
      <Card>
        {milestones.data?.items.map((m, i) => (
          <View key={m.id} style={[styles.exercise, i > 0 && styles.divider]}>
            <AppText variant="caption" color={colors.textSecondary} style={styles.week}>
              {t('weekCount', { week: m.targetWeek })}
            </AppText>
            <AppText variant="bodyStrong" style={styles.flex}>
              {t(m.title)}
            </AppText>
            <MilestoneStatusBadge status={m.status} />
          </View>
        ))}
      </Card>

      <Card
        onPress={() => navigation.navigate('Assessment')}
        accessibilityLabel="Open assessment summary"
      >
        <View style={styles.exercise}>
          <Feather name="file-text" size={20} color={colors.primary} />
          <View style={styles.flex}>
            <AppText variant="bodyStrong">{t('assessmentSummary')}</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {t('assessmentSummaryDesc')}
            </AppText>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textMuted} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stats: { flexDirection: 'row', gap: spacing.sm },
  stat: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2,
  },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  goal: { gap: spacing.sm },
  goalHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  exercise: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  number: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  week: { width: 56 },
});
