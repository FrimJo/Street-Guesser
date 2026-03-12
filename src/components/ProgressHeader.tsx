import { StyleSheet, Text, View } from 'react-native';

import { fontSize, palette, radius, spacing } from '../theme';

type ProgressHeaderProps = {
  current: number;
  total: number;
  score: number;
  streak: number;
  districtName?: string;
};

export function ProgressHeader({
  current,
  total,
  score,
  streak,
  districtName,
}: ProgressHeaderProps) {
  const progress = total > 0 ? current / total : 0;

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <View style={styles.roundBadge}>
          <Text style={styles.roundText}>
            {current} / {total}
          </Text>
        </View>
        {districtName ? <Text style={styles.district}>{districtName}</Text> : null}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{score}</Text>
            <Text style={styles.statLabel}>pts</Text>
          </View>
          {streak > 0 ? (
            <View style={[styles.stat, styles.streakStat]}>
              <Text style={styles.streakValue}>{streak}</Text>
              <Text style={styles.statLabel}>streak</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.sm,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  roundBadge: {
    backgroundColor: palette.accentSoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  roundText: {
    color: palette.accent,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  district: {
    color: palette.textSecondary,
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  statsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginLeft: 'auto',
  },
  stat: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  streakStat: {
    backgroundColor: palette.warningSoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statValue: {
    color: palette.text,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  streakValue: {
    color: palette.warning,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  statLabel: {
    color: palette.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  progressTrack: {
    backgroundColor: palette.border,
    borderRadius: radius.pill,
    height: 4,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: palette.accent,
    borderRadius: radius.pill,
    height: '100%',
  },
});
