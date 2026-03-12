import { StyleSheet } from 'react-native';

import type { Street } from '../data/streetPacks';
import { fontFamily, fontSize, palette, radius, shadows, spacing } from '../theme';

export type MapCardProps = {
  districtName: string;
  accent: string;
  streets: Street[];
  answerId: string;
};

export const GOOGLE_MAP_STYLES = [
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];

export function buildStreetPath(street: Street) {
  return street.route.map((point) => ({
    lat: point.latitude,
    lng: point.longitude,
  }));
}

export function buildStreetEndpoints(street: Street) {
  const path = buildStreetPath(street);
  const start = path[0];
  const end = path[path.length - 1];

  if (!start || !end) {
    return null;
  }

  return { start, end };
}

export function findHighlightedStreet(streets: Street[], answerId: string) {
  return streets.find((street) => street.id === answerId) ?? null;
}

export const mapCardStyles = StyleSheet.create({
  card: {
    backgroundColor: palette.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
    ...shadows.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  districtLabel: {
    color: palette.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  legendBadge: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  legendDot: {
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
  legendText: {
    color: palette.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  mapFrame: {
    aspectRatio: 4 / 3,
    backgroundColor: palette.bgElevated,
    marginHorizontal: spacing.sm,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  fallbackWrap: {
    alignItems: 'center',
    aspectRatio: 4 / 3,
    backgroundColor: palette.bgElevated,
    borderRadius: radius.lg,
    gap: spacing.sm,
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
    padding: spacing.xl,
  },
  fallbackTitle: {
    color: palette.text,
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    textAlign: 'center',
  },
  fallbackBody: {
    color: palette.textTertiary,
    fontSize: fontSize.sm,
    lineHeight: 19,
    textAlign: 'center',
  },
  caption: {
    color: palette.textTertiary,
    fontSize: fontSize.xs,
    lineHeight: 16,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
});
