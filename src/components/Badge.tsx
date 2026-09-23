import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import type { MilestoneStatus, TodayStatus } from '@/lib/types';
import { AppText } from './AppText';

export type Tone = 'success' | 'warning' | 'neutral' | 'brand' | 'coral';

const tones: Record<Tone, { bg: string; fg: string }> = {
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  neutral: { bg: colors.muted, fg: colors.textSecondary },
  brand: { bg: colors.primarySoft, fg: colors.primaryDark },
  coral: { bg: colors.coralSoft, fg: '#C2410C' },
};

export function Badge({
  label,
  tone = 'neutral',
  icon,
}: {
  label: string;
  tone?: Tone;
  icon?: keyof typeof Feather.glyphMap;
}) {
  const t = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      {icon && <Feather name={icon} size={12} color={t.fg} />}
      <AppText variant="caption" color={t.fg} style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

/** Specialty chip — colored dot carries identity, label stays in text ink. */
export function SpecialtyChip({
  name,
  color,
  light,
}: {
  name: string;
  color: string;
  light?: boolean;
}) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: light ? 'rgba(255,255,255,0.18)' : colors.card,
          borderWidth: light ? 0 : 1,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: light ? '#FFFFFF' : color }]} />
      <AppText variant="caption" color={light ? '#FFFFFF' : colors.text} style={styles.text}>
        {name}
      </AppText>
    </View>
  );
}

const exerciseTone: Record<
  TodayStatus,
  { label: string; tone: Tone; icon: keyof typeof Feather.glyphMap }
> = {
  COMPLETED: { label: 'Completed', tone: 'success', icon: 'check-circle' },
  IN_PROGRESS: { label: 'In progress', tone: 'brand', icon: 'clock' },
  NOT_STARTED: { label: 'Not started', tone: 'neutral', icon: 'circle' },
};

export const ExerciseStatusBadge = ({ status }: { status: TodayStatus }) => (
  <Badge {...exerciseTone[status]} />
);

const milestoneTone: Record<
  MilestoneStatus,
  { label: string; tone: Tone; icon: keyof typeof Feather.glyphMap }
> = {
  ACHIEVED: { label: 'Achieved', tone: 'success', icon: 'check-circle' },
  IN_PROGRESS: { label: 'In progress', tone: 'brand', icon: 'clock' },
  PENDING: { label: 'Upcoming', tone: 'neutral', icon: 'circle' },
};

export const MilestoneStatusBadge = ({ status }: { status: MilestoneStatus }) => (
  <Badge {...milestoneTone[status]} />
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  text: { fontSize: 12 },
});
