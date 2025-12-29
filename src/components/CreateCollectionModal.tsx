import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { Button } from './Button';
import { MoodPill } from './MoodPill';
import type { MoodType } from '@/theme';

interface CreateCollectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    mood?: string;
    isPublic: boolean;
  }) => Promise<void>;
  initialData?: {
    name?: string;
    description?: string;
    mood?: string;
    isPublic?: boolean;
  };
  isEditing?: boolean;
}

export function CreateCollectionModal({
  visible,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}: CreateCollectionModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(
    (initialData?.mood as MoodType) || null
  );
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moods: MoodType[] = ['warm', 'nostalgic', 'night', 'calm', 'energy'];

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        mood: selectedMood || undefined,
        isPublic,
      });
      // Reset form
      setName('');
      setDescription('');
      setSelectedMood(null);
      setIsPublic(true);
      onClose();
    } catch (error) {
      console.error('Failed to create collection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isEditing) {
      setName('');
      setDescription('');
      setSelectedMood(null);
      setIsPublic(true);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {isEditing ? 'Edit Collection' : 'New Collection'}
          </Text>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <X size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Collection Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Collection Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Late Night Listens"
              placeholderTextColor={colors.text.muted}
              maxLength={100}
              autoFocus={!isEditing}
            />
            <Text style={styles.hint}>Give your collection a memorable name</Text>
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g., Perfect for 2 AM contemplation"
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={3}
              maxLength={300}
              textAlignVertical="top"
            />
            <Text style={styles.hint}>
              {description.length}/300 characters
            </Text>
          </View>

          {/* Mood */}
          <View style={styles.field}>
            <Text style={styles.label}>Mood (Optional)</Text>
            <Text style={styles.hint}>Choose the vibe of this collection</Text>
            <View style={styles.moodGrid}>
              {moods.map((mood) => (
                <TouchableOpacity
                  key={mood}
                  onPress={() =>
                    setSelectedMood(selectedMood === mood ? null : mood)
                  }
                  style={styles.moodOption}
                >
                  <MoodPill
                    mood={mood}
                    selected={selectedMood === mood}
                    size="medium"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Privacy Toggle */}
          <View style={styles.field}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.label}>Public Collection</Text>
                <Text style={styles.hint}>
                  {isPublic
                    ? 'Others can discover and save this collection'
                    : 'Only you can see this collection'}
                </Text>
              </View>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                trackColor={{
                  false: colors.divider.light,
                  true: colors.interactive.primary,
                }}
                thumbColor={colors.background.base}
              />
            </View>
          </View>

          {/* Examples */}
          {!isEditing && (
            <View style={styles.examples}>
              <Text style={styles.examplesTitle}>Need inspiration?</Text>
              <Text style={styles.exampleText}>
                • Sunday Morning Soul{'\n'}
                • Rainy Day Blues{'\n'}
                • Road Trip Essentials{'\n'}
                • Dad's Favorites{'\n'}
                • Late Night Jazz
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            label="Cancel"
            onPress={handleClose}
            variant="secondary"
            style={styles.cancelButton}
          />
          <Button
            label={isEditing ? 'Save Changes' : 'Create Collection'}
            onPress={handleSubmit}
            variant="primary"
            disabled={!name.trim() || isSubmitting}
            loading={isSubmitting}
            style={styles.submitButton}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider.light,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  field: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.divider.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.xs,
  },
  textArea: {
    minHeight: 80,
    paddingTop: spacing.md,
  },
  hint: {
    ...typography.caption,
    color: colors.text.muted,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  moodOption: {
    marginRight: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  examples: {
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  examplesTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  exampleText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider.light,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
