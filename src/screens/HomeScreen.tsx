import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { usePatient, usePatientKpis, useTodayExercises } from '@/api/queries';
import { AppText } from '@/components/AppText';
import { Badge, ExerciseStatusBadge, SpecialtyChip } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChildGate } from '@/components/ChildGate';
import { ProgressBar, ProgressRing } from '@/components/Progress';
import { Screen } from '@/components/Screen';
import { InitialsAvatar, SectionHeader } from '@/components/Section';
import { ErrorView, LoadingView } from '@/components/States';
import { greeting } from '@/lib/format';
import type { TabScreenProps } from '@/navigation/types';
import { useAppSelector } from '@/store';
import { colors, radius, spacing } from '@/theme';

export default function HomeScreen(props: TabScreenProps<'Home'>) {
  return <ChildGate>{(child) => <HomeContent childId={child.id} {...props} />}</ChildGate>;
}

function HomeContent({ childId, navigation }: TabScreenProps<'Home'> & { childId: string }) {
  const user = useAppSelector((s) => s.auth.user);
  const patient = usePatient(childId);
  const today = useTodayExercises(childId);
  const kpis = usePatientKpis(childId);

  const refreshing = patient.isRefetching || today.isRefetching || kpis.isRefetching;
  const refresh = () => void Promise.all([patient.refetch(), today.refetch(), kpis.refetch()]);

  if (patient.isPending) return <LoadingView />;
  if (patient.error) return <ErrorView error={patient.error} onRetry={refresh} />;
  const p = patient.data;
  const nextExercise = today.data?.items.find((i) => i.status !== 'COMPLETED');
  const allDone = today.data && today.data.total > 0 && today.data.completed === today.data.total;

  return (
    <Screen onRefresh={refresh} refreshing={refreshing}>
      <View style={styles.header}>
        <View>
          <AppText variant="caption" color={colors.textSecondary}>
            {greeting()},
          </AppText>
          <AppText variant="title">{user?.firstName ?? 'there'}</AppText>
        </View>
        <InitialsAvatar name={user?.displayName ?? ''} color={colors.primary} />
      </View>

      <LinearGradient
        colors={[colors.primaryDark, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroBubble} />
        <View style={styles.heroTop}>
          <View style={styles.heroText}>
            <AppText variant="title" color="#FFFFFF">
              {p.firstName}
            </AppText>
            <AppText variant="body" color="rgba(255,255,255,0.85)">
              {p.age} years old · {p.diagnosis.name}
            </AppText>
            {p.specialty && (
              <SpecialtyChip name={p.specialty.name} color={p.specialty.color} light />
            )}
          </View>
          <ProgressRing
            value={p.progress}
            size={104}
            stroke={9}
            color="#FFFFFF"
            track="rgba(255,255,255,0.22)"
            textColor="#FFFFFF"
            label="Progress"
          />
        </View>
        <View style={styles.heroFooter}>
          <Feather name="calendar" size={14} color="rgba(255,255,255,0.85)" />
          <AppText variant="caption" color="rgba(255,255,255,0.9)">
            {p.program
              ? `${p.program.name} · week ${p.program.currentWeek} of ${p.program.durationWeeks}`
              : 'Program starting soon'}
          </AppText>
        </View>
      </LinearGradient>

      <Card>
        <View style={styles.rowBetween}>
          <View>
            <AppText variant="heading">Today’s exercises</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {today.data ? `${today.data.completed} of ${today.data.total} completed` : 'Loading…'}
            </AppText>
          </View>
          {allDone && <Badge label="All done" tone="success" icon="award" />}
        </View>
        <ProgressBar
          value={
            today.data && today.data.total ? (today.data.completed / today.data.total) * 100 : 0
          }
        />
        {today.data?.items.map((item) => (
          <View key={item.id} style={styles.exerciseRow}>
            <AppText variant="bodyStrong" style={styles.flex}>
              {item.exercise.name}
            </AppText>
            <ExerciseStatusBadge status={item.status} />
          </View>
        ))}
        {nextExercise ? (
          <Button
            title="Continue exercises"
            iconRight="arrow-right"
            onPress={() =>
              navigation.navigate('ExerciseDetail', { programExerciseId: nextExercise.id })
            }
          />
        ) : (
          <Button
            title="View today’s program"
            variant="secondary"
            onPress={() => navigation.navigate('Main', { screen: 'Exercises' })}
          />
        )}
      </Card>

      {p.nextMilestone && (
        <Card
          onPress={() => navigation.navigate('Milestones')}
          accessibilityLabel="Open milestones"
        >
          <View style={styles.rowGap}>
            <View style={[styles.iconTile, { backgroundColor: colors.coralSoft }]}>
              <Feather name="flag" size={20} color={colors.coral} />
            </View>
            <View style={styles.flex}>
              <AppText variant="caption" color={colors.textSecondary}>
                Next milestone · week {p.nextMilestone.targetWeek}
              </AppText>
              <AppText variant="subheading">{p.nextMilestone.title}</AppText>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </View>
        </Card>
      )}

      <SectionHeader
        title="Progress at a glance"
        action="See all"
        onAction={() => navigation.navigate('Main', { screen: 'Progress' })}
      />
      <Card>
        {kpis.data?.map((k, i) => (
          <View key={k.id} style={[styles.kpiRow, i > 0 && styles.kpiDivider]}>
            <View style={styles.flex}>
              <AppText variant="bodyStrong">{k.kpi.name}</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Target {Math.round(k.target)}%
              </AppText>
            </View>
            <AppText variant="heading">{Math.round(k.current)}%</AppText>
            <View style={styles.delta}>
              <Feather name="trending-up" size={12} color={colors.success} />
              <AppText variant="caption" color={colors.success}>
                +{Math.round(k.change)}
              </AppText>
            </View>
          </View>
        ))}
      </Card>

      <Card
        onPress={() => navigation.navigate('Main', { screen: 'Program' })}
        accessibilityLabel="Open rehabilitation plan"
      >
        <View style={styles.rowGap}>
          <View style={[styles.iconTile, { backgroundColor: colors.primarySoft }]}>
            <Feather name="clipboard" size={20} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <AppText variant="caption" color={colors.textSecondary}>
              Current program
            </AppText>
            <AppText variant="subheading">{p.program?.name ?? 'Not started'}</AppText>
            {p.program && (
              <AppText variant="caption" color={colors.textSecondary}>
                {p.program.sessionsPerWeek} sessions per week · with {p.clinician.name}
              </AppText>
            )}
          </View>
          <Feather name="chevron-right" size={20} color={colors.textMuted} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hero: { borderRadius: radius.xl + 4, padding: spacing.xl, gap: spacing.lg, overflow: 'hidden' },
  heroBubble: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    right: -60,
    bottom: -90,
    backgroundColor: 'rgba(255,122,89,0.22)',
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroText: { flex: 1, gap: spacing.sm },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  kpiDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  delta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
});
