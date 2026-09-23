import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';

export function LoadingView({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.center} accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText variant="caption" color={colors.textSecondary}>
        {label}
      </AppText>
    </View>
  );
}

export function ErrorView({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <View style={[styles.icon, { backgroundColor: colors.dangerSoft }]}>
        <Feather name="wifi-off" size={22} color={colors.danger} />
      </View>
      <AppText variant="subheading">We couldn’t load this</AppText>
      <AppText variant="caption" color={colors.textSecondary} style={styles.text}>
        {error instanceof Error ? error.message : 'Something went wrong.'}
      </AppText>
      {onRetry && (
        <Button
          title="Try again"
          variant="secondary"
          size="md"
          icon="refresh-cw"
          onPress={onRetry}
        />
      )}
    </View>
  );
}

export function EmptyView({
  title,
  message,
  icon = 'inbox',
}: {
  title: string;
  message?: string;
  icon?: keyof typeof Feather.glyphMap;
}) {
  return (
    <View style={styles.center}>
      <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
        <Feather name={icon} size={22} color={colors.primary} />
      </View>
      <AppText variant="subheading">{title}</AppText>
      {message && (
        <AppText variant="caption" color={colors.textSecondary} style={styles.text}>
          {message}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xxl,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { textAlign: 'center', maxWidth: 300 },
});
