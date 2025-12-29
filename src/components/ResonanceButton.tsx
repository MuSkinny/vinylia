import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated } from 'react-native';
import { colors, typography, spacing } from '@/theme';

interface ResonanceButtonProps {
  hasResonated: boolean;
  onPress: () => void;
  disabled?: boolean;
  showLabel?: boolean;
}

export function ResonanceButton({
  hasResonated,
  onPress,
  disabled = false,
  showLabel = true,
}: ResonanceButtonProps) {
  // Simple vinyl ripple icon using text
  const icon = hasResonated ? '🎵' : '🎶';

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={hasResonated ? 'Remove resonance' : 'Resonate with this story'}
      accessibilityState={{ selected: hasResonated }}
    >
      <View style={[styles.iconContainer, hasResonated && styles.iconContainerActive]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, hasResonated && styles.labelActive]}>
          {hasResonated ? 'Resonates' : 'Resonance'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    opacity: 0.6,
  },
  iconContainerActive: {
    opacity: 1,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text.muted,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.interactive.primary,
    fontWeight: '600',
  },
});
