/**
 * RehabX design tokens — mirrors the clinician web theme (calm clinical teal + warm coral)
 * so both apps feel like one product.
 */
export const colors = {
  background: '#F6F8FA',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#5B6576',
  textMuted: '#8A94A6',
  border: '#E3E8EE',
  primary: '#0E7C86',
  primaryDark: '#0B5F67',
  primarySoft: '#E6F3F4',
  onPrimary: '#FFFFFF',
  coral: '#FF7A59',
  coralSoft: '#FFF0EB',
  success: '#15803D',
  successSoft: '#E8F6EE',
  warning: '#B45309',
  warningSoft: '#FDF3E4',
  danger: '#D92D20',
  dangerSoft: '#FEECEB',
  muted: '#EEF2F6',
  // Data-viz: validated categorical order + neutral baseline
  series: ['#2A78D6', '#EB6834', '#1BAF7A', '#EDA100'],
  baseline: '#A3ACB9',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 } as const;

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const type = {
  display: { fontFamily: fonts.extrabold, fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
  title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24 },
  subheading: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  micro: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 0.6 },
} as const;

export const shadow = {
  card: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const;
