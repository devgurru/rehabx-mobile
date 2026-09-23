import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTimeline } from '@/api/queries';
import { useChild } from '@/api/useChild';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { EmptyView, ErrorView, LoadingView } from '@/components/States';
import { formatShortDate } from '@/lib/format';
import type { TimelineEventType } from '@/lib/types';
import { colors, spacing } from '@/theme';

const ICONS: Record<TimelineEventType, keyof typeof Feather.glyphMap> = {
  ASSESSMENT: 'clipboard',
  REFERRAL: 'send',
  PROGRAM: 'list',
  EXERCISE: 'activity',
  MILESTONE: 'flag',
  KPI: 'trending-up',
  GOAL: 'target',
};

export default function TimelineScreen() {
  const { child } = useChild();
  const { data, isPending, error, refetch, isRefetching } = useTimeline(child?.id ?? '');
  if (isPending) return <LoadingView />;
  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;
  if (!data.length) return <EmptyView icon="git-commit" title="No activity yet" />;

  return (
    <Screen edges={['bottom']} onRefresh={() => void refetch()} refreshing={isRefetching}>
      {data.map((e, i) => (
        <View key={e.id} style={styles.row}>
          <AppText variant="caption" color={colors.textSecondary} style={styles.date}>
            {formatShortDate(e.occurredAt)}
          </AppText>
          <View style={styles.rail}>
            <View style={styles.dot}>
              <Feather name={ICONS[e.type]} size={14} color={colors.primary} />
            </View>
            {i < data.length - 1 && <View style={styles.line} />}
          </View>
          <View style={styles.body}>
            <AppText variant="bodyStrong">{e.title}</AppText>
            {e.description && (
              <AppText variant="caption" color={colors.textSecondary}>
                {e.description}
              </AppText>
            )}
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, marginBottom: -spacing.lg + spacing.sm },
  date: { width: 52, textAlign: 'right', paddingTop: 6 },
  rail: { alignItems: 'center' },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 2 },
  body: { flex: 1, paddingBottom: spacing.xl, paddingTop: 4, gap: 2 },
});
