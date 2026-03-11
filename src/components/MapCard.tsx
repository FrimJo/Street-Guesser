import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline, Rect } from 'react-native-svg';

import type { Street } from '../data/streetPacks';
import { displayFont, palette, shadowCard } from '../theme';

type MapCardProps = {
  districtName: string;
  accent: string;
  streets: Street[];
  answerId: string;
};

function toSvgPoints(street: Street) {
  return street.route.map((point) => `${point.x},${point.y}`).join(' ');
}

export function MapCard({ districtName, accent, streets, answerId }: MapCardProps) {
  const highlightedStreet = streets.find((street) => street.id === answerId);

  return (
    <LinearGradient colors={['#18324b', '#0f1e31', '#0a1523']} style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>{districtName}</Text>
          <Text style={styles.title}>No labels. One glowing street.</Text>
        </View>
        <View style={[styles.legendBadge, { borderColor: accent }]}>
          <View style={[styles.legendDot, { backgroundColor: accent }]} />
          <Text style={styles.legendText}>Target</Text>
        </View>
      </View>

      <View style={styles.mapFrame}>
        <Svg viewBox="0 0 100 100" width="100%" height="100%">
          <Rect x="0" y="0" width="100" height="100" rx="12" fill="rgba(255,255,255,0.02)" />

          <Circle cx="18" cy="18" r="3" fill="rgba(255,255,255,0.08)" />
          <Circle cx="83" cy="22" r="2.2" fill="rgba(255,255,255,0.08)" />
          <Circle cx="72" cy="82" r="3" fill="rgba(255,255,255,0.06)" />

          {streets.map((street) => (
            <Polyline
              key={street.id}
              fill="none"
              points={toSvgPoints(street)}
              stroke={palette.routeBase}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3.2"
            />
          ))}

          {highlightedStreet ? (
            <>
              <Polyline
                fill="none"
                points={toSvgPoints(highlightedStreet)}
                stroke={accent}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.32"
                strokeWidth="8"
              />
              <Polyline
                fill="none"
                points={toSvgPoints(highlightedStreet)}
                stroke={palette.highlight}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4.5"
              />
            </>
          ) : null}
        </Svg>
      </View>

      <Text style={styles.caption}>
        Trace the highlighted route and match it to the right street name before you move on.
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 22,
    gap: 18,
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
    padding: 12,
  },
  caption: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
});
