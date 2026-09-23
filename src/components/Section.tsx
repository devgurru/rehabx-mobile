import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme';
import { AppText } from './AppText';

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.row}>
      <AppText variant="heading">{title}</AppText>
      {action && onAction && (
        <Pressable onPress={onAction} hitSlop={12} accessibilityRole="link">
          <AppText variant="bodyStrong" color={colors.primary}>
            {action}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

export function InfoRow({
  label,
  value,
  right,
}: {
  label: string;
  value: ReactNode;
  right?: ReactNode;
}) {
  return (
    <View style={styles.infoRow}>
      <AppText variant="caption" color={colors.textSecondary}>
        {label}
      </AppText>
      <View style={styles.value}>
        {typeof value === 'string' ? <AppText variant="bodyStrong">{value}</AppText> : value}
        {right}
      </View>
    </View>
  );
}

export function InitialsAvatar({
  name,
  color,
  size = 44,
  light,
}: {
  name: string;
  color: string;
  size?: number;
  light?: boolean;
}) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('');
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: light ? 'rgba(255,255,255,0.2)' : `${color}1F`,
      }}
    >
      <AppText
        variant="subheading"
        color={light ? '#FFFFFF' : color}
        style={{ fontSize: size * 0.38 }}
      >
        {initials}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  value: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
