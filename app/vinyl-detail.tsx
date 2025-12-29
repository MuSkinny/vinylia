import React, { useEffect, useState } from 'react';
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
import { ArrowLeft } from 'lucide-react-native';
import { vinylService } from '@/services/vinyl-service';
import { useToast } from '@/hooks';
import { colors, typography, spacing, borderRadius, shadows } from '@/theme';
import { Button } from '@/components';
import type { VinylReleaseDetail } from '@/types/database';

export default function VinylDetailScreen() {
  const { releaseId } = useLocalSearchParams<{ releaseId: string }>();
  const [vinylData, setVinylData] = useState<VinylReleaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    loadVinylData();
  }, [releaseId]);

  const loadVinylData = async () => {
    try {
      const data = await vinylService.getReleaseDetails(releaseId!);
      setVinylData(data);
    } catch (error) {
      console.error('Failed to load vinyl:', error);
      showToast('Failed to load vinyl details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVinyl = () => {
    if (!vinylData) return;

    // Navigate to add-vinyl flow for personalization
    router.push({
      pathname: '/add-vinyl',
      params: {
        releaseId: vinylData.discogsId.toString(),
        coverUrl: vinylData.coverArtUrl || vinylData.coverArtThumbUrl || '',
        artist: vinylData.artist,
        album: vinylData.album,
        year: vinylData.year?.toString() || '',
        label: vinylData.label || '',
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.interactive.primary} />
          <Text style={styles.loadingText}>Loading vinyl details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!vinylData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>😔</Text>
          <Text style={styles.errorText}>Couldn't load vinyl details</Text>
          <Button
            variant="primary"
            label="Go Back"
            onPress={() => router.back()}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Cover Art */}
          {vinylData.coverArtUrl && (
            <Image
              source={{ uri: vinylData.coverArtUrl }}
              style={styles.coverArt}
              resizeMode="cover"
            />
          )}

          <View style={styles.info}>
            {/* Main Info */}
            <Text style={styles.artist}>{vinylData.artist}</Text>
            <Text style={styles.album}>{vinylData.album}</Text>

            {/* Metadata */}
            <View style={styles.metadata}>
              {vinylData.year && (
                <View style={styles.metaChip}>
                  <Text style={styles.metaText}>{vinylData.year}</Text>
                </View>
              )}
              {vinylData.label && (
                <View style={styles.metaChip}>
                  <Text style={styles.metaText}>{vinylData.label}</Text>
                </View>
              )}
              {vinylData.format && (
                <View style={styles.metaChip}>
                  <Text style={styles.metaText}>{vinylData.format}</Text>
                </View>
              )}
            </View>

            {/* Genres */}
            {vinylData.genres && vinylData.genres.length > 0 && (
              <View style={styles.genres}>
                {vinylData.genres.slice(0, 5).map((genre, index) => (
                  <View key={index} style={styles.genreTag}>
                    <Text style={styles.genreText}>{genre}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tracklist */}
            {vinylData.tracklist && vinylData.tracklist.length > 0 && (
              <View style={styles.tracklist}>
                <Text style={styles.sectionTitle}>Tracklist</Text>
                {vinylData.tracklist.slice(0, 12).map((track, index) => (
                  <View key={`track-${index}`} style={styles.track}>
                    <Text style={styles.trackPosition}>{track.position}</Text>
                    <Text style={styles.trackTitle} numberOfLines={1}>
                      {track.title}
                    </Text>
                    {track.duration && (
                      <Text style={styles.trackDuration}>{track.duration}</Text>
                    )}
                  </View>
                ))}
                {vinylData.tracklist.length > 12 && (
                  <Text style={styles.moreTracksText}>
                    +{vinylData.tracklist.length - 12} more tracks
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <Button
          variant="primary"
          label="Add to Library"
          onPress={handleAddVinyl}
          fullWidth
        />
      </View>
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
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
  },
  content: {
    paddingBottom: 100,
  },
  coverArt: {
    width: '100%',
    height: 400,
    backgroundColor: colors.background.elevated,
  },
  info: {
    padding: spacing.lg,
  },
  artist: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  album: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metaChip: {
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.divider.light,
  },
  metaText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  genreTag: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  genreText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  tracklist: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider.light,
  },
  trackPosition: {
    ...typography.bodySmall,
    color: colors.text.muted,
    width: 32,
  },
  trackTitle: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.text.primary,
  },
  trackDuration: {
    ...typography.caption,
    color: colors.text.muted,
  },
  moreTracksText: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.base,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider.light,
    ...shadows.soft,
  },
});
