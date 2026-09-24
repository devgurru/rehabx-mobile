import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMilestones } from '@/api/queries';
import { useChild } from '@/api/useChild';
import { AppText } from '@/components/AppText';
import { MilestoneStatusBadge } from '@/components/Badge';
import { ProgressBar } from '@/components/Progress';
import { Screen } from '@/components/Screen';
import { EmptyView, ErrorView, LoadingView } from '@/components/States';
import { formatDate } from '@/lib/format';
import type { MilestoneStatus } from '@/lib/types';
import { colors, radius, spacing } from '@/theme';

const dot: Record<
  MilestoneStatus,
  { bg: string; fg: string; icon: keyof typeof Feather.glyphMap }
> = {
  ACHIEVED: { bg: colors.success, fg: colors.onPrimary, icon: 'check' },
  IN_PROGRESS: { bg: colors.primary, fg: colors.onPrimary, icon: 'clock' },
  PENDING: { bg: colors.muted, fg: colors.textMuted, icon: 'flag' },
};

export default function MilestonesScreen() {
  const { child } = useChild();
  const { t } = useTranslation(['milestones', 'program', 'assessment', 'exercises']);
  const { data, isPending, error, refetch, isRefetching } = useMilestones(child?.id ?? '');
  if (isPending) return <LoadingView />;
  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;
  if (!data.program) return <EmptyView icon="flag" title={t('noMilestonesYet')} />;

  return (
    <Screen edges={['bottom']} onRefresh={() => void refetch()} refreshing={isRefetching}>
      <View style={styles.summary}>
        <AppText variant="title">
          {t('achievedOfTotal', { achieved: data.achieved, total: data.total })}
        </AppText>
        <AppText variant="body" color={colors.textSecondary}>
          {t('weekOfDuration', { current: data.program.currentWeek, duration: data.program.durationWeeks, name: t(data.program.name) })}
        </AppText>
        <ProgressBar
          value={(data.achieved / Math.max(1, data.total)) * 100}
          color={colors.success}
        />
      </View>

      <View>
        {data.items.map((m, i) => {
          const d = dot[m.status];
          const last = i === data.items.length - 1;
          return (
            <View key={m.id} style={styles.item}>
              <View style={styles.rail}>
                <View style={[styles.dot, { backgroundColor: d.bg }]}>
                  <Feather name={d.icon} size={16} color={d.fg} />
                </View>
                {!last && (
                  <View
                    style={[
                      styles.line,
                      m.status === 'ACHIEVED' && { backgroundColor: colors.success },
                    ]}
                  />
                )}
              </View>
              <View style={[styles.card, m.status === 'IN_PROGRESS' && styles.current]}>
                <AppText variant="micro" color={colors.textSecondary}>
                  {t('weekUpper', { week: m.targetWeek })}
                  {m.targetDate ? ` · ${formatDate(m.targetDate).toUpperCase()}` : ''}
                </AppText>
                <AppText variant="subheading">{t(m.title)}</AppText>
                {m.description && (
                  <AppText variant="caption" color={colors.textSecondary}>
                    {t(m.description ?? '')}
                  </AppText>
                )}
                <MilestoneStatusBadge status={m.status} />
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { gap: spacing.sm },
  item: { flexDirection: 'row', gap: spacing.md },
  rail: { alignItems: 'center', width: 36 },
  dot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 4 },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: 6,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  current: { borderColor: colors.primary, borderWidth: 1.5 },
});
