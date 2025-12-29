import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { vinylService } from '@/services/vinyl-service';
import { useAuth } from '@/contexts/AuthContext';
import { Button, MoodPill, StoryTextArea } from '@/components';
import { colors, typography, spacing, borderRadius } from '@/theme';
import type { MoodType } from '@/theme';
import { useToast } from '@/hooks';

export default function AddVinylScreen() {
  const { releaseId, coverUrl, artist, album, year, label } = useLocalSearchParams<{
    releaseId: string;
    coverUrl: string;
    artist: string;
    album: string;
    year?: string;
    label?: string;
  }>();

  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [story, setStory] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const moods: MoodType[] = ['warm', 'nostalgic', 'night', 'calm', 'energy'];

  const handleAddToLibrary = async () => {
    if (!user) return;

    setIsAdding(true);
    try {
      // Fetch full vinyl details
      const vinylDetails = await vinylService.getReleaseDetails(releaseId);

      // Add to collection with story and mood
      await vinylService.addToCollection(user.id, vinylDetails, {
        story: story || undefined,
        mood: selectedMood || undefined,
      });

      // Refresh library
      queryClient.invalidateQueries({ queryKey: ['library', user.id] });

      // Show success toast
      showToast('Added to your library', 'success');

      // Navigate to library
      router.replace('/(tabs)');
    } catch (error: any) {
      if (error.message?.includes('duplicate')) {
        showToast('Already in your library', 'error');
      } else {
        showToast('Failed to add vinyl', 'error');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleSkip = () => {
    handleAddToLibrary();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Cover Art */}
          <View style={styles.coverContainer}>
            <Image
              source={{ uri: coverUrl }}
              style={styles.cover}
              resizeMode="cover"
            />
          </View>

          {/* Album Info */}
          <Text style={styles.artist}>{artist}</Text>
          <Text style={styles.album}>{album}</Text>
          <Text style={styles.metadata}>
            {year}
            {label && ` · ${label}`}
          </Text>

          <View style={styles.divider} />

          {/* Mood Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What mood does this record have?</Text>
            <View style={styles.moodContainer}>
              {moods.map((mood) => (
                <MoodPill
                  key={mood}
                  mood={mood}
                  selected={selectedMood === mood}
                  onPress={() => setSelectedMood(selectedMood === mood ? null : mood)}
                />
              ))}
            </View>
          </View>

          {/* Story Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Why is this record part of your story?
            </Text>
            <StoryTextArea
              value={story}
              onChange={setStory}
              placeholder="This was the first album I..."
            />
          </View>

          {/* Add Button */}
          <View style={styles.buttonContainer}>
            <Button
              variant="primary"
              label={isAdding ? 'Adding to Library...' : 'Add to Library'}
              onPress={handleAddToLibrary}
              disabled={isAdding}
              fullWidth
              loading={isAdding}
            />
          </View>
        </View>
      </ScrollView>
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
  skipButton: {
    ...typography.body,
    color: colors.interactive.primary,
    fontWeight: '600',
    padding: spacing.sm,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  coverContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
  cover: {
    width: 280,
    height: 280,
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
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  metadata: {
    ...typography.bodySmall,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider.light,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
});
