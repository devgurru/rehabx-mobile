import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@/theme';
import { AppText } from './AppText';

const clamp = (v: number) => Math.max(0, Math.min(100, v));

export function ProgressBar({
  value,
  color = colors.primary,
  track = colors.muted,
  height = 8,
}: {
  value: number;
  color?: string;
  track?: string;
  height?: number;
}) {
  return (
    <View
      style={[styles.track, { backgroundColor: track, height, borderRadius: height / 2 }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamp(value)) }}
    >
      <View
        style={{
          width: `${clamp(value)}%`,
          backgroundColor: color,
          height,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}

export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  color = colors.primary,
  track = colors.muted,
  textColor = colors.text,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  textColor?: string;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <View
      style={{ width: size, height: size }}
      accessibilityLabel={`${label ?? 'Progress'} ${Math.round(value)} percent`}
    >
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - clamp(value) / 100)}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <AppText variant={size >= 110 ? 'title' : 'subheading'} color={textColor}>
          {Math.round(value)}%
        </AppText>
        {label && (
          <AppText variant="caption" color={textColor} style={{ opacity: 0.8 }}>
            {label}
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
