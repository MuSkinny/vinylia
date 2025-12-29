import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';
import { colors, typography, spacing } from '../theme';

interface EmptyStateProps {
  icon: string;
  heading: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  heading,
  body,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>

      <Text style={styles.heading}>{heading}</Text>

      <Text style={styles.body}>{body}</Text>

      {actionLabel && onAction && (
        <Button
          variant="primary"
          label={actionLabel}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
    opacity: 0.6,
  },
  heading: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
  },
});
