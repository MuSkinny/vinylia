import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, borderRadius, spacing } from '../theme';
import type { MoodType } from '../theme';

interface VinylCardProps {
  id: string;
  coverUrl: string;
  artist: string;
  album: string;
  mood?: MoodType;
  onPress: () => void;
  onLongPress?: () => void;
}

const VinylCardComponent: React.FC<VinylCardProps> = ({
  coverUrl,
  artist,
  album,
  mood,
  onPress,
  onLongPress,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${artist}, ${album}${mood ? `, mood: ${mood}` : ''}`}
      accessibilityHint="Double tap to view details"
    >
      <View style={styles.coverContainer}>
        <Image
          source={{ uri: coverUrl }}
          style={styles.cover}
          resizeMode="cover"
        />
        {mood && (
          <View style={[styles.moodDot, { backgroundColor: colors.mood[mood] }]} />
        )}
      </View>

      <Text style={styles.artist} numberOfLines={1}>
        {artist}
      </Text>

      <Text style={styles.album} numberOfLines={2}>
        {album}
      </Text>
    </Pressable>
  );
};

// Export memoized version to prevent unnecessary re-renders
export const VinylCard = React.memo(VinylCardComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
  },
  containerPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  coverContainer: {
    position: 'relative',
    aspectRatio: 1,
    marginBottom: 8,
  },
  cover: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.elevated,
  },
  moodDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  artist: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  album: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
