import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius, spacing, shadows } from '../theme';
import type { MoodType } from '../theme';

const moodLabels: Record<MoodType, string> = {
  warm: 'Warm',
  nostalgic: 'Nostalgic',
  night: 'Night',
  calm: 'Calm',
  energy: 'Energy',
};

interface MoodPillProps {
  mood: MoodType;
  selected: boolean;
  onPress: () => void;
}

export const MoodPill: React.FC<MoodPillProps> = ({ mood, selected, onPress }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.pill,
        selected && styles.pillSelected,
        selected && { backgroundColor: colors.mood[mood] },
        pressed && styles.pillPressed,
      ]}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Mood: ${moodLabels[mood]}`}
      accessibilityState={{ selected }}
    >
      <Text style={[
        styles.text,
        selected && styles.textSelected,
      ]}>
        {moodLabels[mood]}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pill: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.divider.light,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  pillSelected: {
    borderWidth: 0,
    ...shadows.soft,
  },
  pillPressed: {
    transform: [{ scale: 0.96 }],
  },
  text: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  textSelected: {
    color: colors.text.inverse,
  },
});
