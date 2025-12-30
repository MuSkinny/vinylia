import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MoreVertical, Trash2 } from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { vinylService } from '@/services/vinyl-service';
import { useAuth } from '@/contexts/AuthContext';
import { Button, MoodPill, BottomSheet, StoryTextArea, AddToCollectionSheet, CreateCollectionModal } from '@/components';
import { Toggle } from '@/components/Toggle';
import { colors, typography, spacing, borderRadius } from '@/theme';
import type { MoodType } from '@/theme';
import { useAutoSave, useToast } from '@/hooks';

export default function MyVinylDetailScreen() {
  const { userVinylId } = useLocalSearchParams<{ userVinylId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isEditingStory, setIsEditingStory] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [story, setStory] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [isPublic, setIsPublic] = useState(true);

  const { data: vinyl, isLoading } = useQuery({
    queryKey: ['my-vinyl', userVinylId],
    queryFn: async () => {
      // Fetch from user's library
      const library = await vinylService.getUserLibrary(user!.id);
      const item = library.find((v: any) => v.id === userVinylId);
      if (item) {
        setStory(item.story || '');
        setSelectedMood(item.mood || null);
        setIsPublic(item.is_public ?? true);
      }
      return item;
    },
    enabled: !!user && !!userVinylId,
  });

  // Auto-save story
  useAutoSave(story, async (newStory) => {
    if (vinyl && newStory !== vinyl.story) {
      await vinylService.updateStory(userVinylId!, newStory);
      queryClient.invalidateQueries({ queryKey: ['my-vinyl', userVinylId] });
    }
  });

  const handleMoodChange = async (mood: MoodType) => {
    setSelectedMood(mood);
    await vinylService.updateMood(userVinylId!, mood);
    queryClient.invalidateQueries({ queryKey: ['my-vinyl', userVinylId] });
    queryClient.invalidateQueries({ queryKey: ['library', user?.id] });
    setShowMoodSelector(false);
  };

  const handleDelete = async () => {
    try {
      await vinylService.removeFromLibrary(userVinylId!);
      queryClient.invalidateQueries({ queryKey: ['library', user?.id] });
      showToast('Removed from library', 'success');
      setShowDeleteConfirm(false);
      router.back();
    } catch (error) {
      showToast('Failed to remove', 'error');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.interactive.primary} />
      </View>
    );
  }

  if (!vinyl) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Vinyl not found</Text>
      </View>
    );
  }

  const moods: MoodType[] = ['warm', 'nostalgic', 'night', 'calm', 'energy'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} style={styles.iconButton}>
          <Trash2 size={22} color={colors.states.error} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Cover Art */}
          <View style={styles.coverContainer}>
            <Image
              source={{ uri: vinyl.vinyl?.cover_art_url || vinyl.vinyl?.cover_art_thumb_url }}
              style={styles.cover}
              resizeMode="cover"
            />
          </View>

          {/* Album Info */}
          <Text style={styles.artist}>{vinyl.vinyl?.artist}</Text>
          <Text style={styles.album}>{vinyl.vinyl?.album}</Text>
          <Text style={styles.metadata}>
            {vinyl.vinyl?.year}
            {vinyl.vinyl?.label && ` · ${vinyl.vinyl.label}`}
          </Text>

          {/* Mood */}
          {selectedMood && (
            <TouchableOpacity onPress={() => setShowMoodSelector(true)}>
              <View style={[styles.moodBadge, { backgroundColor: colors.mood[selectedMood] }]}>
                <Text style={styles.moodBadgeText}>
                  {selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Add to Collection Button */}
          <Button
            variant="secondary"
            label="Add to Collection"
            onPress={() => setShowAddToCollection(true)}
            style={styles.addToCollectionButton}
          />

          {/* Privacy Toggle */}
          <View style={styles.privacySection}>
            <Toggle
              label="Public in Library"
              description="Show this record in your public profile"
              value={isPublic}
              onValueChange={async (value) => {
                setIsPublic(value);
                await vinylService.updateUserVinyl(userVinylId!, { is_public: value });
                queryClient.invalidateQueries({ queryKey: ['my-vinyl', userVinylId] });
                showToast(`Record is now ${value ? 'public' : 'private'}`, 'success');
              }}
            />
          </View>

          {/* Story Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Story</Text>
              {!isEditingStory && (
                <TouchableOpacity onPress={() => setIsEditingStory(true)}>
                  <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>

            {isEditingStory ? (
              <>
                <StoryTextArea
                  value={story}
                  onChange={setStory}
                  autoFocus
                />
                <Button
                  variant="primary"
                  label="Done"
                  onPress={() => setIsEditingStory(false)}
                  style={styles.doneButton}
                />
              </>
            ) : story ? (
              <Text style={styles.storyText}>{story}</Text>
            ) : (
              <TouchableOpacity onPress={() => setIsEditingStory(true)}>
                <Text style={styles.emptyStory}>
                  Why does this record matter to you? Tap to add your story.
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitleMuted}>Details</Text>
            <View style={styles.detailsGrid}>
              {vinyl.vinyl?.catalog_number && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Catalog No.</Text>
                  <Text style={styles.detailValue}>{vinyl.vinyl.catalog_number}</Text>
                </View>
              )}
              {vinyl.vinyl?.country && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Country</Text>
                  <Text style={styles.detailValue}>{vinyl.vinyl.country}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Mood Selector Sheet */}
      <BottomSheet
        visible={showMoodSelector}
        onClose={() => setShowMoodSelector(false)}
        title="What mood does this record have?"
      >
        <View style={styles.moodContainer}>
          {moods.map((mood) => (
            <MoodPill
              key={mood}
              mood={mood}
              selected={selectedMood === mood}
              onPress={() => handleMoodChange(mood)}
            />
          ))}
        </View>
      </BottomSheet>

      {/* Delete Confirmation BottomSheet */}
      <BottomSheet
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Remove from library?"
      >
        <View style={styles.deleteConfirmContent}>
          <Text style={styles.deleteWarningText}>
            {vinyl?.vinyl?.artist} - {vinyl?.vinyl?.album}
          </Text>
          <Text style={styles.deleteSubtext}>
            Your story will be deleted too. This can't be undone.
          </Text>
          <View style={styles.deleteActions}>
            <Button
              variant="secondary"
              label="Cancel"
              onPress={() => setShowDeleteConfirm(false)}
              style={{ flex: 1 }}
            />
            <Button
              variant="primary"
              label="Remove"
              onPress={handleDelete}
              style={{ flex: 1, backgroundColor: colors.states.error }}
            />
          </View>
        </View>
      </BottomSheet>

      {/* Add to Collection Sheet */}
      <AddToCollectionSheet
        isVisible={showAddToCollection}
        onClose={() => setShowAddToCollection(false)}
        userVinylId={userVinylId!}
        onCreateCollection={() => {
          setShowAddToCollection(false);
          setShowCreateCollection(true);
        }}
      />

      {/* Create Collection Modal */}
      <CreateCollectionModal
        visible={showCreateCollection}
        onClose={() => setShowCreateCollection(false)}
        onSubmit={async (data) => {
          const { collectionService } = await import('@/services/collection-service');
          await collectionService.createCollection(data);
          queryClient.invalidateQueries({ queryKey: ['myCollections'] });
          setShowCreateCollection(false);
          setShowAddToCollection(true);
          showToast('Collection created!', 'success');
        }}
      />
    </SafeAreaView>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconButton: {
    padding: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.base,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.base,
  },
  errorText: {
    ...typography.body,
    color: colors.text.primary,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  coverContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  cover: {
    width: 320,
    height: 320,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.elevated,
  },
  artist: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  album: {
    ...typography.h1,
    color: colors.text.primary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  metadata: {
    ...typography.bodySmall,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  moodBadge: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xl,
  },
  moodBadgeText: {
    ...typography.bodySmall,
    color: colors.text.inverse,
    fontWeight: '500',
  },
  addToCollectionButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  privacySection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  sectionTitleMuted: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  editButton: {
    ...typography.body,
    color: colors.interactive.primary,
    fontWeight: '600',
  },
  storyText: {
    ...typography.bodyLarge,
    color: colors.text.primary,
  },
  emptyStory: {
    ...typography.bodyLarge,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  doneButton: {
    marginTop: spacing.md,
  },
  detailsGrid: {
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  detailValue: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: spacing.lg,
  },
  deleteConfirmContent: {
    paddingBottom: spacing.lg,
  },
  deleteWarningText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  deleteSubtext: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
