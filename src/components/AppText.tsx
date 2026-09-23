import { Text, type TextProps } from 'react-native';
import { colors, type as typeScale } from '@/theme';

export type TextVariant = keyof typeof typeScale;

export function AppText({
  variant = 'body',
  color = colors.text,
  style,
  ...props
}: TextProps & { variant?: TextVariant; color?: string }) {
  return <Text {...props} style={[typeScale[variant], { color }, style]} />;
}
