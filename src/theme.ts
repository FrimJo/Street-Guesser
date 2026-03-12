import { Platform, StyleSheet } from 'react-native';

export const palette = {
  bg: '#060e19',
  bgElevated: '#0c1a2b',
  bgCard: '#111f33',
  bgCardElevated: '#162942',
  bgInput: '#0e1b2e',
  bgOverlay: 'rgba(6, 14, 25, 0.85)',

  border: 'rgba(180, 210, 240, 0.10)',
  borderLight: 'rgba(180, 210, 240, 0.06)',
  borderFocus: 'rgba(120, 180, 255, 0.35)',

  text: '#f0f6fc',
  textSecondary: '#8ba3bc',
  textTertiary: '#5c7a95',
  textInverse: '#0a1628',

  accent: '#4d9fff',
  accentSoft: 'rgba(77, 159, 255, 0.14)',
  accentMuted: 'rgba(77, 159, 255, 0.08)',

  success: '#34d399',
  successSoft: 'rgba(52, 211, 153, 0.14)',
  successBorder: 'rgba(52, 211, 153, 0.30)',

  danger: '#f87171',
  dangerSoft: 'rgba(248, 113, 113, 0.14)',
  dangerBorder: 'rgba(248, 113, 113, 0.30)',

  warning: '#fbbf24',
  warningSoft: 'rgba(251, 191, 36, 0.14)',

  shadow: '#020610',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const fontFamily = {
  display:
    Platform.select({
      ios: 'Avenir Next Condensed',
      android: 'sans-serif-condensed',
      default: 'Trebuchet MS',
    }) ?? undefined,
  body: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'system-ui',
  }),
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  display: 32,
} as const;

export const shadows = {
  sm: {
    shadowColor: palette.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  md: {
    shadowColor: palette.shadow,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  lg: {
    shadowColor: palette.shadow,
    shadowOpacity: 0.36,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },
} as const;

export const shared = StyleSheet.create({
  card: {
    backgroundColor: palette.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.xl,
    ...shadows.md,
  },
  pressable: {
    opacity: 1,
  },
  pressableActive: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonPrimary: {
    alignItems: 'center' as const,
    backgroundColor: palette.accent,
    borderRadius: radius.lg,
    justifyContent: 'center' as const,
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonPrimaryLabel: {
    color: palette.textInverse,
    fontSize: fontSize.md,
    fontWeight: '700' as const,
  },
  buttonSecondary: {
    alignItems: 'center' as const,
    backgroundColor: 'transparent',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    justifyContent: 'center' as const,
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonSecondaryLabel: {
    color: palette.text,
    fontSize: fontSize.md,
    fontWeight: '600' as const,
  },
  eyebrow: {
    color: palette.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: '700' as const,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
  },
  heading: {
    color: palette.text,
    fontFamily: fontFamily.display,
    fontSize: fontSize.display,
    lineHeight: 38,
  },
  headingSm: {
    color: palette.text,
    fontFamily: fontFamily.display,
    fontSize: fontSize.xxl,
    lineHeight: 32,
  },
  body: {
    color: palette.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  bodySm: {
    color: palette.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 19,
  },
});

export const displayFont = fontFamily.display;
export const shadowCard = shadows.md;
