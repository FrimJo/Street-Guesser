import { StyleSheet } from 'react-native';

import type { Street } from '../data/streetPacks';
import { displayFont, palette, shadowCard } from '../theme';

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
    borderRadius: 28,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 22,
    gap: 18,
    backgroundColor: '#0d1826',
    ...shadowCard,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  eyebrow: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.text,
    fontFamily: displayFont,
    fontSize: 26,
    lineHeight: 29,
    marginTop: 6,
  },
  legendBadge: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  legendDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  legendText: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '700',
  },
  mapFrame: {
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  caption: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  fallbackWrap: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#0f1e31',
    borderRadius: 24,
    gap: 10,
    justifyContent: 'center',
    padding: 24,
  },
  fallbackTitle: {
    color: palette.text,
    fontFamily: displayFont,
    fontSize: 22,
    textAlign: 'center',
  },
  fallbackBody: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
