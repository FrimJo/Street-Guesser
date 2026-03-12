import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { CityOption } from '../data/streetPacks';
import { fontSize, palette, radius, shadows, spacing } from '../theme';

type CityPickerProps = {
  searchValue: string;
  onChangeSearch: (value: string) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  cities: CityOption[];
  onSelect: (city: CityOption) => void;
};

export function CityPicker({
  searchValue,
  onChangeSearch,
  isOpen,
  onOpen,
  onClose,
  cities,
  onSelect,
}: CityPickerProps) {
  return (
    <View style={styles.root}>
      <TextInput
        autoCapitalize="words"
        autoCorrect={false}
        onBlur={() => {
          setTimeout(onClose, 120);
        }}
        onChangeText={(value) => {
          onChangeSearch(value);
          onOpen();
        }}
        onFocus={onOpen}
        placeholder="Search for a city..."
        placeholderTextColor={palette.textTertiary}
        style={styles.input}
        value={searchValue}
      />

      {isOpen ? (
        <View style={styles.dropdown}>
          {cities.length > 0 ? (
            cities.map((city) => (
              <Pressable
                key={city.id}
                onPress={() => onSelect(city)}
                style={({ pressed }) => [styles.option, pressed ? styles.optionActive : null]}
              >
                <Text style={styles.optionLabel}>{city.name}</Text>
              </Pressable>
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyLabel}>No cities match your search</Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    zIndex: 10,
  },
  input: {
    backgroundColor: palette.bgInput,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: palette.text,
    fontSize: fontSize.lg,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  dropdown: {
    backgroundColor: palette.bgCard,
    borderColor: palette.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.sm,
    overflow: 'hidden',
    ...shadows.lg,
  },
  option: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  optionActive: {
    backgroundColor: palette.accentMuted,
  },
  optionLabel: {
    color: palette.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  empty: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  emptyLabel: {
    color: palette.textTertiary,
    fontSize: fontSize.md,
  },
});
