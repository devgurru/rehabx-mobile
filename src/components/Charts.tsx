import { useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { colors, spacing } from '@/theme';
import { AppText } from './AppText';

function useWidth(initial = 300) {
  const [width, setWidth] = useState(initial);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  return { width, onLayout };
}

/**
 * Single-KPI sparkline with the target as a dashed reference. The y-range hugs the data and
 * target (it is a trend glyph, not a comparison chart) so week-to-week change stays visible.
 */
export function TrendLine({
  values,
  target,
  color = colors.series[0],
  height = 72,
}: {
  values: number[];
  target: number;
  color?: string;
  height?: number;
}) {
  const { width, onLayout } = useWidth();
  const pad = 6;
  const baseline = values[0] ?? 0;
  const lo = Math.max(0, Math.min(...values, target, baseline) - 5);
  const hi = Math.min(100, Math.max(...values, target, baseline) + 5);
  const x = (i: number) => pad + (i / Math.max(1, values.length - 1)) * (width - pad * 2);
  const y = (v: number) => pad + (1 - (v - lo) / Math.max(1, hi - lo)) * (height - pad * 2);
  const d = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ');
  const last = values.at(-1) ?? 0;

  return (
    <View
      onLayout={onLayout}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={width} height={height}>
        {/* Baseline Line */}
        <Line
          x1={pad}
          x2={width - pad}
          y1={y(baseline)}
          y2={y(baseline)}
          stroke={colors.textMuted}
          strokeDasharray="4 4"
          strokeWidth={1.5}
        />
        {/* Target Line */}
        <Line
          x1={pad}
          x2={width - pad}
          y1={y(target)}
          y2={y(target)}
          stroke={colors.success}
          strokeDasharray="4 4"
          strokeWidth={1.5}
        />
        <Path
          d={d}
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Circle
          cx={x(values.length - 1)}
          cy={y(last)}
          r={4}
          fill={colors.card}
          stroke={color}
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}

/** Weekly completed sessions with the plan as a dashed reference line. */
export function WeeklyBars({
  data,
  planned,
  height = 140,
}: {
  data: { label: string; value: number }[];
  planned?: number;
  height?: number;
}) {
  const { width, onLayout } = useWidth();
  const max = Math.max(planned ?? 0, ...data.map((d) => d.value), 1) * 1.15;
  const chartH = height - 22;
  const slot = width / Math.max(1, data.length);
  const barW = Math.min(28, slot * 0.55);
  const y = (v: number) => chartH - (v / max) * chartH;

  return (
    <View onLayout={onLayout}>
      <Svg width={width} height={chartH}>
        {data.map((d, i) => {
          const h = Math.max(2, chartH - y(d.value));
          const bx = i * slot + (slot - barW) / 2;
          return (
            <Rect
              key={d.label}
              x={bx}
              y={chartH - h}
              width={barW}
              height={h}
              rx={4}
              fill={colors.series[0]}
            />
          );
        })}
        {planned !== undefined && (
          <Line
            x1={0}
            x2={width}
            y1={y(planned)}
            y2={y(planned)}
            stroke={colors.textSecondary}
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        )}
      </Svg>
      <View style={styles.labels}>
        {data.map((d) => (
          <AppText
            key={d.label}
            variant="caption"
            color={colors.textSecondary}
            style={[styles.label, { width: slot }]}
          >
            {d.label}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: { flexDirection: 'row', marginTop: spacing.xs },
  label: { textAlign: 'center', fontSize: 11 },
});
