import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';

interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    description?: string;
    mood?: string;
    vinyl_count?: number;
    save_count?: number;
    user?: {
      username?: string;
      display_name?: string;
    };
    items?: Array<{
      user_vinyl?: {
        vinyl?: {
          cover_art_thumb_url?: string;
          cover_art_url?: string;
        };
      };
    }>;
  };
  onPress?: () => void;
  showCreator?: boolean;
  variant?: 'default' | 'compact';
}

export function CollectionCard({
  collection,
  onPress,
  showCreator = false,
  variant = 'default',
}: CollectionCardProps) {
  // Get up to 6 vinyl covers for preview
  const previewCovers = (collection.items || [])
    .slice(0, 6)
    .map(item => item.user_vinyl?.vinyl?.cover_art_thumb_url || item.user_vinyl?.vinyl?.cover_art_url)
    .filter(Boolean);

  const vinylCount = collection.vinyl_count || collection.items?.length || 0;
  const saveCount = collection.save_count || 0;

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={onPress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Collection: ${collection.name}`}
      >
        <View style={styles.compactPreview}>
          {previewCovers.length > 0 ? (
            <Image
              source={{ uri: previewCovers[0] }}
              style={styles.compactCover}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.compactCover, styles.emptyCover]}>
              <Text style={styles.emptyIcon}>📑</Text>
            </View>
          )}
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>
            {collection.name}
          </Text>
          <Text style={styles.compactCount}>
            {vinylCount} {vinylCount === 1 ? 'vinyl' : 'vinyls'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Collection: ${collection.name}, ${vinylCount} vinyls`}
    >
      {/* Cover Grid Preview */}
      <View style={styles.coverGrid}>
        {previewCovers.length > 0 ? (
          previewCovers.map((cover, index) => (
            <Image
              key={index}
              source={{ uri: cover }}
              style={styles.gridCover}
              resizeMode="cover"
            />
          ))
        ) : (
          <View style={styles.emptyGrid}>
            <Text style={styles.emptyGridIcon}>📑</Text>
            <Text style={styles.emptyGridText}>No vinyls yet</Text>
          </View>
        )}
      </View>

      {/* Collection Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {collection.name}
        </Text>

        {collection.description && (
          <Text style={styles.description} numberOfLines={2}>
            {collection.description}
          </Text>
        )}

        {showCreator && collection.user && (
          <Text style={styles.creator}>
            by @{collection.user.username || collection.user.display_name}
          </Text>
        )}

        <View style={styles.stats}>
          <Text style={styles.statText}>
            {vinylCount} {vinylCount === 1 ? 'vinyl' : 'vinyls'}
          </Text>
          {collection.mood && (
            <>
              <Text style={styles.statDivider}>•</Text>
              <Text style={styles.moodText}>{collection.mood}</Text>
            </>
          )}
        </View>

        {saveCount > 0 && (
          <Text style={styles.saveCount}>
            Saved by {saveCount} {saveCount === 1 ? 'person' : 'others'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.divider.light,
  },
  coverGrid: {
    width: '100%',
    aspectRatio: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.background.elevated,
  },
  gridCover: {
    width: '33.33%',
    height: '50%',
    borderWidth: 0.5,
    borderColor: colors.divider.light,
  },
  emptyGrid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
  },
  emptyGridIcon: {
    fontSize: 48,
    opacity: 0.3,
    marginBottom: spacing.sm,
  },
  emptyGridText: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  info: {
    padding: spacing.lg,
  },
  name: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  creator: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  statDivider: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  moodText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  saveCount: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  // Compact variant
  compactCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider.light,
    alignItems: 'center',
  },
  compactPreview: {
    marginRight: spacing.md,
  },
  compactCover: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
  },
  emptyCover: {
    backgroundColor: colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  compactCount: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
});
