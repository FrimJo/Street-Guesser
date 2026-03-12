import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '../theme';

type QuizOptionProps = {
  index: number;
  label: string;
  selected: boolean;
  isCorrectOption: boolean;
  answered: boolean;
  onPress: () => void;
};

const optionPrefixes = ['A', 'B', 'C', 'D'];

export function QuizOption({
  index,
  label,
  selected,
  isCorrectOption,
  answered,
  onPress,
}: QuizOptionProps) {
  const shouldRevealCorrect = answered && isCorrectOption;
  const shouldRevealError = answered && selected && !isCorrectOption;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={answered}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected && !answered ? styles.optionSelected : null,
        shouldRevealCorrect ? styles.optionCorrect : null,
        shouldRevealError ? styles.optionWrong : null,
        pressed && !answered ? styles.optionPressed : null,
      ]}
    >
      <View
        style={[
          styles.prefix,
          selected && !answered ? styles.prefixSelected : null,
          shouldRevealCorrect ? styles.prefixCorrect : null,
          shouldRevealError ? styles.prefixWrong : null,
        ]}
      >
        <Text style={styles.prefixLabel}>{optionPrefixes[index] ?? '?'}</Text>
      </View>

      <View style={styles.copyWrap}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.helper}>
          {shouldRevealCorrect
            ? 'Correct street'
            : shouldRevealError
              ? 'Your guess'
              : 'Tap to lock in'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    alignItems: 'center',
    backgroundColor: palette.panelMuted,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  optionPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  optionSelected: {
    borderColor: '#6caeff',
    backgroundColor: 'rgba(92, 157, 255, 0.12)',
  },
  optionCorrect: {
    borderColor: palette.success,
    backgroundColor: 'rgba(99, 217, 164, 0.16)',
  },
  optionWrong: {
    borderColor: palette.danger,
    backgroundColor: 'rgba(255, 141, 122, 0.12)',
  },
  prefix: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  prefixSelected: {
    backgroundColor: 'rgba(92, 157, 255, 0.24)',
  },
  prefixCorrect: {
    backgroundColor: 'rgba(99, 217, 164, 0.22)',
  },
  prefixWrong: {
    backgroundColor: 'rgba(255, 141, 122, 0.22)',
  },
  prefixLabel: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  copyWrap: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  helper: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
});
