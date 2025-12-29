import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search your library...",
  autoFocus = false,
}) => {
  return (
    <View style={[styles.container, value && styles.containerActive]}>
      <Search size={20} color={value ? colors.text.secondary : colors.text.muted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        style={styles.input}
        autoFocus={autoFocus}
        accessible={true}
        accessibilityLabel="Search"
        accessibilityHint="Search for vinyls in your library"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: colors.brand.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 0,
  },
  containerActive: {
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.divider.light,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    padding: 0,
  },
});
