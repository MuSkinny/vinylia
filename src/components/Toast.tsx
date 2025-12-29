import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const typeColors = {
  success: colors.states.success,
  error: colors.states.error,
  info: colors.states.info,
};

const typeIcons = {
  success: '✓',
  error: '✕',
  info: 'ⓘ',
};

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  visible: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  duration = 2500,
  visible,
}) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide up and fade in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: typeColors[type] },
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLive="polite"
    >
      <Text style={styles.icon}>{typeIcons[type]}</Text>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.medium,
  },
  icon: {
    fontSize: 18,
    color: colors.text.inverse,
    marginRight: spacing.sm,
  },
  message: {
    ...typography.bodySmall,
    color: colors.text.inverse,
    flex: 1,
  },
});
