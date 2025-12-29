import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2, Edit3 } from 'lucide-react-native';
import { vinylService } from '@/services/vinyl-service';
import { storyService } from '@/services/story-service';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/config/colors';

export default function MyVinylScreen() {
  const { userVinylId } = useLocalSearchParams<{ userVinylId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [storyMood, setStoryMood] = useState('');

  // Fetch user vinyl with stories
  const { data: userVinyl, isLoading } = useQuery({
    queryKey: ['userVinyl', userVinylId],
    queryFn: () => vinylService.getUserVinyl(userVinylId!),
    enabled: !!userVinylId,
  });

  // Delete vinyl mutation
  const deleteMutation = useMutation({
    mutationFn: () => vinylService.deleteUserVinyl(userVinylId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', user?.id] });
      Alert.alert('Success', 'Vinyl removed from collection');
      router.back();
    },
  });

  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: (data: { title?: string; content: string; mood?: string }) =>
      storyService.createStory({
        user_vinyl_id: userVinylId!,
        ...data,
        is_public: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userVinyl', userVinylId] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'discover'] });
      setShowStoryModal(false);
      setStoryTitle('');
      setStoryContent('');
      setStoryMood('');
      Alert.alert('Success', 'Story created and published to Discovery feed!');
    },
    onError: (error: any) => {
      console.error('Failed to create story:', error);
      Alert.alert('Error', error.message || 'Failed to create story. Please try again.');
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Remove Vinyl',
      'Are you sure you want to remove this vinyl from your collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  const handleCreateStory = () => {
    if (!storyContent.trim()) {
      Alert.alert('Error', 'Please write your story');
      return;
    }

    createStoryMutation.mutate({
      title: storyTitle.trim() || undefined,
      content: storyContent.trim(),
      mood: storyMood.trim() || undefined,
    });
  };

  if (isLoading || !userVinyl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const vinyl = userVinyl.vinyl;
  const stories = userVinyl.stories || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <X size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Vinyl</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Trash2 size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Cover Art */}
        {vinyl?.cover_art_url && (
          <Image
            source={{ uri: vinyl.cover_art_url }}
            style={styles.coverArt}
            resizeMode="cover"
          />
        )}

        {/* Vinyl Info */}
        <View style={styles.info}>
          <Text style={styles.album}>{vinyl?.album}</Text>
          <Text style={styles.artist}>{vinyl?.artist}</Text>

          <View style={styles.metadata}>
            {vinyl?.year && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Year</Text>
                <Text style={styles.metaValue}>{vinyl.year}</Text>
              </View>
            )}
            {vinyl?.label && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Label</Text>
                <Text style={styles.metaValue}>{vinyl.label}</Text>
              </View>
            )}
            {vinyl?.format && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Format</Text>
                <Text style={styles.metaValue}>{vinyl.format}</Text>
              </View>
            )}
          </View>

          {/* Genres */}
          {vinyl?.genres && vinyl.genres.length > 0 && (
            <View style={styles.genres}>
              {vinyl.genres.map((genre, index) => (
                <View key={index} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Stories Section */}
          <View style={styles.storiesSection}>
            <View style={styles.storiesSectionHeader}>
              <Text style={styles.storiesSectionTitle}>My Stories</Text>
              <TouchableOpacity
                style={styles.addStoryButton}
                onPress={() => setShowStoryModal(true)}
              >
                <Plus size={16} color={colors.white} />
                <Text style={styles.addStoryButtonText}>Add Story</Text>
              </TouchableOpacity>
            </View>

            {stories.length === 0 ? (
              <View style={styles.emptyStories}>
                <Text style={styles.emptyStoriesIcon}>📖</Text>
                <Text style={styles.emptyStoriesText}>No stories yet</Text>
                <Text style={styles.emptyStoriesSubtext}>
                  Share a memory, a moment, or why this vinyl is special
                </Text>
              </View>
            ) : (
              stories.map((story: any) => (
                <View key={story.id} style={styles.storyCard}>
                  {story.title && (
                    <Text style={styles.storyTitle}>{story.title}</Text>
                  )}
                  <Text style={styles.storyContent}>{story.content}</Text>
                  {story.mood && (
                    <Text style={styles.storyMood}>Mood: {story.mood}</Text>
                  )}
                  <Text style={styles.storyDate}>
                    {new Date(story.created_at).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Tracklist */}
          {vinyl?.tracklist && vinyl.tracklist.length > 0 && (
            <View style={styles.tracklist}>
              <Text style={styles.tracklistTitle}>Tracklist</Text>
              {vinyl.tracklist.map((track: any, index: number) => (
                <View key={`track-${index}`} style={styles.track}>
                  <Text style={styles.trackNumber}>{track.position}.</Text>
                  <Text style={styles.trackTitle}>{track.title}</Text>
                  {track.duration && (
                    <Text style={styles.trackDuration}>{track.duration}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Story Creation Modal */}
      <Modal
        visible={showStoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowStoryModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowStoryModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Story</Text>
            <TouchableOpacity
              onPress={handleCreateStory}
              disabled={createStoryMutation.isPending}
            >
              <Text style={styles.modalSave}>
                {createStoryMutation.isPending ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.vinylLabel}>
              {vinyl?.artist} - {vinyl?.album}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Title (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Give your story a title..."
                placeholderTextColor={colors.text.muted}
                value={storyTitle}
                onChangeText={setStoryTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Story *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Share a memory, a moment, or why this vinyl is special to you..."
                placeholderTextColor={colors.text.muted}
                value={storyContent}
                onChangeText={setStoryContent}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Mood (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Nostalgic, Energetic, Melancholic..."
                placeholderTextColor={colors.text.muted}
                value={storyMood}
                onChangeText={setStoryMood}
              />
            </View>

            <View style={styles.storyHint}>
              <Text style={styles.storyHintText}>
                💡 Stories are shared publicly in the Feed so others can discover
                this vinyl through your experience
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginLeft: 12,
  },
  deleteButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text.tertiary,
  },
  coverArt: {
    width: '100%',
    height: 400,
    backgroundColor: colors.surface,
  },
  info: {
    padding: 24,
  },
  album: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  artist: {
    fontSize: 20,
    color: colors.primary,
    marginBottom: 24,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  metaItem: {
    flex: 1,
    minWidth: 100,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  genreTag: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  genreText: {
    color: colors.text.tertiary,
    fontSize: 12,
  },
  storiesSection: {
    marginBottom: 24,
  },
  storiesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  storiesSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  addStoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addStoryButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyStories: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyStoriesIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStoriesText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  emptyStoriesSubtext: {
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  storyCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  storyContent: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  storyMood: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  storyDate: {
    fontSize: 11,
    color: colors.text.muted,
  },
  tracklist: {
    marginBottom: 24,
  },
  tracklistTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  track: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  trackNumber: {
    width: 32,
    color: colors.text.muted,
    fontSize: 14,
  },
  trackTitle: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
  },
  trackDuration: {
    color: colors.text.tertiary,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  modalCancel: {
    fontSize: 16,
    color: colors.text.tertiary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  vinylLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  storyHint: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  storyHintText: {
    fontSize: 12,
    color: colors.text.tertiary,
    lineHeight: 18,
  },
});
