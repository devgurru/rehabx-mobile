import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTodayExercises } from '@/api/queries';
import { useChild } from '@/api/useChild';
import { AppText } from '@/components/AppText';
import { Badge, ExerciseStatusBadge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { ErrorView, LoadingView } from '@/components/States';
import { ExerciseStage } from '@/exercise3d/ExerciseStage';
import { formatTime } from '@/lib/format';
import type { RootScreenProps } from '@/navigation/types';
import { colors, radius, spacing } from '@/theme';

export default function ExerciseDetailScreen({
  route,
  navigation,
}: RootScreenProps<'ExerciseDetail'>) {
  const { t } = useTranslation('exercises');
  const { child } = useChild();
  const today = useTodayExercises(child?.id ?? '');
  const item = today.data?.items.find((i) => i.id === route.params.programExerciseId);

  if (today.isPending) return <LoadingView />;
  if (today.error || !item)
    return (
      <ErrorView
        error={today.error ?? new Error(t('exerciseNotFound'))}
        onRetry={() => void today.refetch()}
      />
    );

  const done = item.status === 'COMPLETED';
  const e = item.exercise;

  return (
    <Screen edges={['bottom']} contentStyle={styles.content}>
      <ExerciseStage motionKey={e.motionKey} />
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <AppText variant="title">{t(e.name)}</AppText>
          <AppText variant="body" color={colors.textSecondary}>
            {t(e.description)}
          </AppText>
        </View>
      </View>
      <View style={styles.badges}>
        <ExerciseStatusBadge status={item.status} />
        {e.motionKey && <Badge label={t('ai3dGuide')} tone="brand" icon="box" />}
      </View>

      <View style={styles.stats}>
        {[
          {
            icon: 'repeat' as const,
            label: t('repetitions'),
            value: item.reps ? String(item.reps) : t('hold'),
          },
          { icon: 'clock' as const, label: t('duration'), value: t('minCount', { count: item.durationMin }) },
          { icon: 'calendar' as const, label: t('perWeek'), value: t('freqCount', { count: item.frequencyPerWeek }) },
        ].map((s) => (
          <View key={s.label} style={styles.stat}>
            <Feather name={s.icon} size={18} color={colors.primary} />
            <AppText variant="heading">{s.value}</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {s.label}
            </AppText>
          </View>
        ))}
      </View>

      <Card>
        <AppText variant="heading">{t('howToDoIt')}</AppText>
        {e.instructions.map((step, i) => (
          <View key={step} style={styles.step}>
            <View style={styles.stepNumber}>
              <AppText variant="caption" color={colors.primary}>
                {i + 1}
              </AppText>
            </View>
            <AppText variant="body" style={styles.flex}>
              {t(step)}
            </AppText>
          </View>
        ))}
      </Card>

      <View style={styles.safety}>
        <View style={styles.safetyHead}>
          <Feather name="shield" size={18} color={colors.warning} />
          <AppText variant="subheading" color={colors.warning}>
            {t('safetyFirst')}
          </AppText>
        </View>
        {e.safetyNotes.map((note) => (
          <AppText key={note} variant="body">
            • {t(note)}
          </AppText>
        ))}
      </View>

      {done ? (
        <View style={styles.doneBox}>
          <Feather name="check-circle" size={22} color={colors.success} />
          <View style={styles.flex}>
            <AppText variant="subheading" color={colors.success}>
              {t('completedToday')}{item.completedAt ? t('atTime', { time: formatTime(item.completedAt) }) : ''}
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {t('sessionsCompletedDesc', { count: item.totalCompleted })}
            </AppText>
          </View>
        </View>
      ) : null}

      <Button
        title={
          done
            ? t('practiseAgain')
            : item.status === 'IN_PROGRESS'
              ? t('resumeExercise')
              : t('startExercise')
        }
        icon="play"
        variant={done ? 'secondary' : 'primary'}
        onPress={() => navigation.navigate('ExerciseSession', { programExerciseId: item.id })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm },
  flex: { flex: 1 },
  titleRow: { flexDirection: 'row', gap: spacing.md },
  badges: { flexDirection: 'row', gap: spacing.sm },
  stats: { flexDirection: 'row', gap: spacing.sm },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  step: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  safety: {
    backgroundColor: colors.warningSoft,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  safetyHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  doneBox: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
});
