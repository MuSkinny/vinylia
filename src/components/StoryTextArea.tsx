import React, { useRef, useEffect } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

interface StoryTextAreaProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const StoryTextArea: React.FC<StoryTextAreaProps> = ({
  value,
  onChange,
  placeholder = "Why does this record matter to you?",
  autoFocus = false,
}) => {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [autoFocus]);

  return (
    <TextInput
      ref={inputRef}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.text.muted}
      multiline
      textAlignVertical="top"
      style={styles.input}
      accessible={true}
      accessibilityLabel="Story text area"
      accessibilityHint="Write your personal story about this record"
    />
  );
};

const styles = StyleSheet.create({
  input: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    backgroundColor: colors.background.base,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    minHeight: 120,
    maxHeight: 400,
    borderWidth: 0,
  },
});
