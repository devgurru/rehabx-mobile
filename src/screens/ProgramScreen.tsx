import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
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
        <AppText variant="title">Rehabilitation plan</AppText>
        <EmptyView
          icon="clipboard"
          title="Your plan is being prepared"
          message="Your clinician will share the rehabilitation program here."
        />
      </Screen>
    );

  const refresh = () =>
    void Promise.all([program.refetch(), progress.refetch(), milestones.refetch()]);

  return (
    <Screen onRefresh={refresh} refreshing={program.isRefetching}>
      <AppText variant="title">Rehabilitation plan</AppText>

      <Card>
        <SpecialtyChip name={p.specialty.name} color={p.specialty.color} />
        <AppText variant="heading">{p.name}</AppText>
        <View style={styles.stats}>
          {[
            { icon: 'calendar' as const, label: 'Duration', value: `${p.durationWeeks} weeks` },
            { icon: 'repeat' as const, label: 'Frequency', value: `${p.sessionsPerWeek}× / week` },
            { icon: 'clock' as const, label: 'Started', value: formatDate(p.startDate) },
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
            Week {p.currentWeek} of {p.durationWeeks}
          </AppText>
        </View>
        <ProgressBar value={(p.currentWeek / p.durationWeeks) * 100} />
      </Card>

      <SectionHeader title="Goals" />
      <Card>
        {(progress.data?.goals ?? p.goals.map((g) => ({ ...g, progress: 0 }))).map((g) => (
          <View key={g.id} style={styles.goal}>
            <View style={styles.goalHead}>
              <Feather name="target" size={16} color={colors.primary} />
              <AppText variant="bodyStrong" style={styles.flex}>
                {g.title}
              </AppText>
              <AppText variant="bodyStrong">{g.progress}%</AppText>
            </View>
            <ProgressBar value={g.progress} height={6} />
          </View>
        ))}
      </Card>

      <SectionHeader
        title="Exercise schedule"
        action="Today"
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
              <AppText variant="bodyStrong">{e.name}</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                {e.reps ? `${e.reps} reps · ` : ''}
                {e.durationMin} min · {e.frequencyPerWeek}× per week
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
        title="Milestones"
        action="View all"
        onAction={() => navigation.navigate('Milestones')}
      />
      <Card>
        {milestones.data?.items.map((m, i) => (
          <View key={m.id} style={[styles.exercise, i > 0 && styles.divider]}>
            <AppText variant="caption" color={colors.textSecondary} style={styles.week}>
              Week {m.targetWeek}
            </AppText>
            <AppText variant="bodyStrong" style={styles.flex}>
              {m.title}
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
            <AppText variant="bodyStrong">Assessment summary</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              What your clinician found and why this plan was chosen
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
