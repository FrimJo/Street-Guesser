import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontSize, palette, radius, spacing } from '../theme';

type QuizOptionProps = {
  index: number;
  label: string;
  selected: boolean;
  isCorrectOption: boolean;
  answered: boolean;
  onPress: () => void;
};

const PREFIXES = ['A', 'B', 'C', 'D'];

export function QuizOption({
  index,
  label,
  selected,
  isCorrectOption,
  answered,
  onPress,
}: QuizOptionProps) {
  const isRevealCorrect = answered && isCorrectOption;
  const isRevealWrong = answered && selected && !isCorrectOption;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={answered}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        selected && !answered ? styles.rootSelected : null,
        isRevealCorrect ? styles.rootCorrect : null,
        isRevealWrong ? styles.rootWrong : null,
        pressed && !answered ? styles.rootPressed : null,
      ]}
    >
      <View
        style={[
          styles.badge,
          selected && !answered ? styles.badgeSelected : null,
          isRevealCorrect ? styles.badgeCorrect : null,
          isRevealWrong ? styles.badgeWrong : null,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            isRevealCorrect ? styles.badgeTextCorrect : null,
            isRevealWrong ? styles.badgeTextWrong : null,
          ]}
        >
          {PREFIXES[index] ?? '?'}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {answered ? (
          <Text
            style={[
              styles.hint,
              isRevealCorrect ? styles.hintCorrect : null,
              isRevealWrong ? styles.hintWrong : null,
            ]}
          >
            {isRevealCorrect ? 'Correct' : isRevealWrong ? 'Your pick' : ''}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: palette.bgCardElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 60,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rootPressed: {
    backgroundColor: palette.accentMuted,
    transform: [{ scale: 0.99 }],
  },
  rootSelected: {
    borderColor: palette.accent,
    backgroundColor: palette.accentSoft,
  },
  rootCorrect: {
    borderColor: palette.successBorder,
    backgroundColor: palette.successSoft,
  },
  rootWrong: {
    borderColor: palette.dangerBorder,
    backgroundColor: palette.dangerSoft,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  badgeSelected: {
    backgroundColor: palette.accentSoft,
  },
  badgeCorrect: {
    backgroundColor: palette.successSoft,
  },
  badgeWrong: {
    backgroundColor: palette.dangerSoft,
  },
  badgeText: {
    color: palette.text,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  badgeTextCorrect: {
    color: palette.success,
  },
  badgeTextWrong: {
    color: palette.danger,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: palette.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  hint: {
    color: palette.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  hintCorrect: {
    color: palette.success,
  },
  hintWrong: {
    color: palette.danger,
  },
});
