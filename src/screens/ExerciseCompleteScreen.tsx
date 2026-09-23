import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ProgressBar, ProgressRing } from '@/components/Progress';
import type { RootScreenProps } from '@/navigation/types';
import { colors, radius, spacing } from '@/theme';

export default function ExerciseCompleteScreen({
  route,
  navigation,
}: RootScreenProps<'ExerciseComplete'>) {
  const { result } = route.params;
  const [scale] = useState(() => new Animated.Value(0.6));
  const [ring, setRing] = useState(result.progress.before);

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    const t = setTimeout(() => setRing(result.progress.after), 500);
    return () => clearTimeout(t);
  }, [scale, result.progress.after]);

  const allDone = result.today.completed === result.today.total;
  const gained = result.progress.after - result.progress.before;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>
        <Animated.View style={[styles.check, { transform: [{ scale }] }]}>
          <Feather name="check" size={44} color={colors.onPrimary} />
        </Animated.View>
        <View style={styles.center}>
          <AppText variant="display" style={styles.text}>
            {result.alreadyCompleted ? 'Already done today' : 'Exercise completed'}
          </AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.text}>
            {allDone
              ? 'Great work! Today’s program is complete.'
              : 'Great work! Keep going with the next exercise.'}
          </AppText>
        </View>

        <Card style={styles.card}>
          <AppText variant="caption" color={colors.textSecondary}>
            Today’s progress
          </AppText>
          <AppText variant="title">
            {result.today.completed} / {result.today.total} exercises completed
          </AppText>
          <ProgressBar
            value={(result.today.completed / Math.max(1, result.today.total)) * 100}
            color={colors.success}
          />
        </Card>

        <View style={styles.row}>
          <Card style={[styles.card, styles.half]}>
            <ProgressRing value={ring} size={96} stroke={8} label="Overall" />
            <AppText variant="caption" color={colors.textSecondary} style={styles.text}>
              {gained > 0 ? `Up from ${result.progress.before}%` : 'Rehabilitation progress'}
            </AppText>
          </Card>
          {result.kpiUpdate && (
            <Card style={[styles.card, styles.half]}>
              <View style={styles.kpiIcon}>
                <Feather name="trending-up" size={20} color={colors.success} />
              </View>
              <AppText variant="caption" color={colors.textSecondary}>
                {result.kpiUpdate.kpiName}
              </AppText>
              <AppText variant="title">{Math.round(result.kpiUpdate.after)}%</AppText>
              <AppText variant="caption" color={colors.success}>
                +{Math.round(result.kpiUpdate.after - result.kpiUpdate.before)} · target{' '}
                {Math.round(result.kpiUpdate.target)}%
              </AppText>
            </Card>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="View progress"
          icon="trending-up"
          onPress={() => navigation.navigate('Main', { screen: 'Progress' })}
        />
        <Button
          title="Back to exercises"
          variant="secondary"
          onPress={() => navigation.navigate('Main', { screen: 'Exercises' })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.xl, gap: spacing.lg, justifyContent: 'center' },
  center: { alignItems: 'center', gap: spacing.sm },
  text: { textAlign: 'center' },
  check: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.success,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  card: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1, alignItems: 'center' },
  kpiIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { padding: spacing.xl, gap: spacing.md },
});
