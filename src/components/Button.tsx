import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'medium' | 'large';
  label: string;
  onPress: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  label,
  onPress,
  disabled = false,
  fullWidth = false,
  loading = false,
  style,
}) => {
  const buttonStyles: ViewStyle[] = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`text_${variant}` as keyof typeof styles] as TextStyle,
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        ...buttonStyles,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.text.inverse : colors.interactive.primary}
        />
      ) : (
        <Text style={textStyles}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
  },

  // Variants
  primary: {
    backgroundColor: colors.interactive.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.divider.light,
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.md,
  },

  // Sizes
  small: {
    height: 36,
  },
  medium: {
    height: 48,
  },
  large: {
    height: 56,
  },

  // States
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },

  // Text styles
  text_primary: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  text_secondary: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  text_text: {
    ...typography.body,
    fontWeight: '600',
    color: colors.interactive.primary,
  },
});
