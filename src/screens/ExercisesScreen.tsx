import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTodayExercises } from '@/api/queries';
import { AppText } from '@/components/AppText';
import { ExerciseStatusBadge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { ChildGate } from '@/components/ChildGate';
import { ProgressBar } from '@/components/Progress';
import { Screen } from '@/components/Screen';
import { EmptyView, ErrorView, LoadingView } from '@/components/States';
import type { TabScreenProps } from '@/navigation/types';
import { colors, radius, spacing } from '@/theme';

export default function ExercisesScreen(props: TabScreenProps<'Exercises'>) {
  return <ChildGate>{(child) => <ExercisesContent childId={child.id} {...props} />}</ChildGate>;
}

function ExercisesContent({
  childId,
  navigation,
}: TabScreenProps<'Exercises'> & { childId: string }) {
  const { t } = useTranslation('exercises');
  const { data, isPending, error, refetch, isRefetching } = useTodayExercises(childId);
  if (isPending) return <LoadingView />;
  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  return (
    <Screen onRefresh={() => void refetch()} refreshing={isRefetching}>
      <View>
        <AppText variant="title">{t('todaysProgram')}</AppText>
        <AppText variant="body" color={colors.textSecondary}>
          {data.total
            ? t('exercisesCompleted', { completed: data.completed, total: data.total })
            : t('noExercisesAssigned')}
        </AppText>
      </View>
      {data.total > 0 && <ProgressBar value={(data.completed / data.total) * 100} />}

      {data.items.length === 0 && (
        <EmptyView
          icon="activity"
          title={t('nothingScheduled')}
          message={t('clinicianWillAssign')}
        />
      )}

      {data.items.map((item, i) => {
        const done = item.status === 'COMPLETED';
        return (
          <Card
            key={item.id}
            onPress={() => navigation.navigate('ExerciseDetail', { programExerciseId: item.id })}
            accessibilityLabel={`${item.exercise.name}, ${item.status.replace('_', ' ').toLowerCase()}`}
          >
            <View style={styles.row}>
              <View style={[styles.number, done && { backgroundColor: colors.successSoft }]}>
                {done ? (
                  <Feather name="check" size={18} color={colors.success} />
                ) : (
                  <AppText variant="heading" color={colors.primary}>
                    {i + 1}
                  </AppText>
                )}
              </View>
              <View style={styles.body}>
                <AppText variant="subheading">{t(item.exercise.name)}</AppText>
                <View style={styles.meta}>
                  {item.reps !== null && (
                    <AppText variant="caption" color={colors.textSecondary}>
                      {t('repetitionsCount', { count: item.reps })}
                    </AppText>
                  )}
                  <AppText variant="caption" color={colors.textSecondary}>
                    {t('minutesCount', { count: item.durationMin })}
                  </AppText>
                </View>
                <View style={styles.meta}>
                  <ExerciseStatusBadge status={item.status} />
                  {item.exercise.motionKey && (
                    <View style={styles.guide}>
                      <Feather name="box" size={12} color={colors.primary} />
                      <AppText variant="caption" color={colors.primary}>
                        {t('3dGuide')}
                      </AppText>
                    </View>
                  )}
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  body: { flex: 1, gap: spacing.xs },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  number: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guide: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
