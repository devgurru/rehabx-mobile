import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { usePatientKpis, useProgress } from '@/api/queries';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { TrendLine, WeeklyBars } from '@/components/Charts';
import { ChildGate } from '@/components/ChildGate';
import { ProgressBar, ProgressRing } from '@/components/Progress';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/Section';
import { ErrorView, LoadingView } from '@/components/States';
import type { TabScreenProps } from '@/navigation/types';
import { colors, radius, spacing } from '@/theme';

export default function ProgressScreen(props: TabScreenProps<'Progress'>) {
  return <ChildGate>{(child) => <ProgressContent childId={child.id} {...props} />}</ChildGate>;
}

function ProgressContent({
  childId,
  navigation,
}: TabScreenProps<'Progress'> & { childId: string }) {
  const progress = useProgress(childId);
  const kpis = usePatientKpis(childId);
  const refresh = () => void Promise.all([progress.refetch(), kpis.refetch()]);

  if (progress.isPending) return <LoadingView />;
  if (progress.error) return <ErrorView error={progress.error} onRetry={refresh} />;
  const p = progress.data;

  return (
    <Screen onRefresh={refresh} refreshing={progress.isRefetching || kpis.isRefetching}>
      <AppText variant="title">Progress</AppText>

      <Card style={styles.overall}>
        <ProgressRing value={p.overall} size={132} stroke={11} label="Overall" />
        <View style={styles.breakdown}>
          {[
            { label: 'KPI improvement', value: p.kpiAttainment },
            { label: 'Exercise adherence', value: p.adherence },
            { label: 'Milestones', value: p.milestoneCompletion },
          ].map((b) => (
            <View key={b.label} style={styles.breakRow}>
              <View style={styles.breakHead}>
                <AppText variant="caption" color={colors.textSecondary}>
                  {b.label}
                </AppText>
                <AppText variant="caption">{b.value}%</AppText>
              </View>
              <ProgressBar value={b.value} height={6} />
            </View>
          ))}
        </View>
      </Card>

      <View style={styles.tiles}>
        <Card style={styles.tile}>
          <Feather name="activity" size={18} color={colors.primary} />
          <AppText variant="title">
            {p.exercises.completed}
            <AppText variant="subheading" color={colors.textMuted}>
              {' '}
              / {p.exercises.planned}
            </AppText>
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            Exercises completed
          </AppText>
        </Card>
        <Card
          style={styles.tile}
          onPress={() => navigation.navigate('Milestones')}
          accessibilityLabel="Open milestones"
        >
          <Feather name="flag" size={18} color={colors.coral} />
          <AppText variant="title">
            {p.milestones.achieved}
            <AppText variant="subheading" color={colors.textMuted}>
              {' '}
              / {p.milestones.total}
            </AppText>
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            Milestones achieved
          </AppText>
        </Card>
      </View>

      <SectionHeader title="Key outcomes" />
      {kpis.data?.map((k) => (
        <Card key={k.id}>
          <View style={styles.kpiHead}>
            <View style={styles.flex}>
              <AppText variant="subheading">{k.kpi.name}</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                {k.goalProgress}% of the way to target
              </AppText>
            </View>
            <View style={styles.delta}>
              <Feather name="trending-up" size={12} color={colors.success} />
              <AppText variant="caption" color={colors.success}>
                +{Math.round(k.change)}
              </AppText>
            </View>
          </View>
          <View style={styles.kpiValues}>
            {[
              { label: 'Baseline', value: k.baseline, color: colors.textSecondary },
              { label: 'Current', value: k.current, color: colors.text },
              { label: 'Target', value: k.target, color: colors.textSecondary },
            ].map((v) => (
              <View key={v.label}>
                <AppText variant={v.label === 'Current' ? 'title' : 'heading'} color={v.color}>
                  {Math.round(v.value)}%
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {v.label}
                </AppText>
              </View>
            ))}
          </View>
          <TrendLine values={k.trend.map((t) => t.value)} target={k.target} />
        </Card>
      ))}

      <SectionHeader title="Weekly exercise sessions" />
      <Card>
        <WeeklyBars
          data={p.weeklyAdherence.map((w) => ({ label: `W${w.week}`, value: w.completed }))}
          planned={p.weeklyAdherence[0]?.planned}
        />
        <AppText variant="caption" color={colors.textSecondary}>
          Dashed line shows the planned sessions per week.
        </AppText>
      </Card>

      <SectionHeader
        title="Goals"
        action="Milestones"
        onAction={() => navigation.navigate('Milestones')}
      />
      <Card>
        {p.goals.map((g) => (
          <View key={g.id} style={styles.goal}>
            <View style={styles.breakHead}>
              <AppText variant="bodyStrong" style={styles.flex}>
                {g.title}
              </AppText>
              <AppText variant="bodyStrong">{g.progress}%</AppText>
            </View>
            <ProgressBar
              value={g.progress}
              height={6}
              color={g.status === 'ACHIEVED' ? colors.success : colors.primary}
            />
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overall: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  breakdown: { flex: 1, gap: spacing.md },
  breakRow: { gap: 6 },
  breakHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tiles: { flexDirection: 'row', gap: spacing.md },
  tile: { flex: 1, gap: spacing.xs },
  kpiHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  kpiValues: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  delta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  goal: { gap: spacing.sm },
});
