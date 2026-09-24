import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTimeline } from '@/api/queries';
import { useChild } from '@/api/useChild';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { EmptyView, ErrorView, LoadingView } from '@/components/States';
import { formatShortDate } from '@/lib/format';
import type { TimelineEventType } from '@/lib/types';
import { colors, spacing } from '@/theme';

function translateDynamic(text: string, t: any): string {
  if (!text) return '';
  const direct = t(text);
  if (direct && direct !== text) return direct;

  let match;
  match = text.match(/(\d+) of (\d+) exercises completed at home\./);
  if (match) return t('exercisesCompletedAtHome', { completed: match[1], total: match[2] });

  match = text.match(/(\d+) milestones over (\d+) weeks/);
  if (match) return t('milestonesOverWeeks', { count: match[1], weeks: match[2] });

  match = text.match(/(\d+) exercises assigned/);
  if (match) return t('exercisesAssigned', { count: match[1] });

  match = text.match(/Week (\d+) review — (.*?) (\d+)% \(baseline (\d+)%\)\./);
  if (match) return t('kpiReviewFormat', { week: match[1], kpi: t(match[2]), val: match[3], base: match[4] });

  match = text.match(/(.*?) referral created/);
  if (match) return t('referralCreatedFormat', { specialty: t(match[1]) });

  match = text.match(/^Milestone achieved: (.*)$/);
  if (match) return t('milestoneAchievedFormat', { milestone: t(match[1]) });

  match = text.match(/(.*?) · (\d+) weeks · (\d+) sessions per week/);
  if (match) return t('programUpdatedFormat', { specialty: t(match[1]), weeks: match[2], sessions: match[3] });

  if (text.includes(' · ')) return text.split(' · ').map(item => t(item)).join(' · ');
  if (text.includes(', ')) return text.split(', ').map(item => t(item)).join('، ');

  return text;
}

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
  const { t } = useTranslation(['timeline', 'program', 'assessment', 'exercises', 'milestones']);
  const { data, isPending, error, refetch, isRefetching } = useTimeline(child?.id ?? '');
  if (isPending) return <LoadingView />;
  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;
  if (!data.length) return <EmptyView icon="git-commit" title={t('noActivityYet')} />;

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
            <AppText variant="bodyStrong">{translateDynamic(e.title, t)}</AppText>
            {e.description && (
              <AppText variant="caption" color={colors.textSecondary}>
                {translateDynamic(e.description, t)}
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
