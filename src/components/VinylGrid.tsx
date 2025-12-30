import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View, ListRenderItem } from 'react-native';
import { VinylCard } from './VinylCard';
import { spacing } from '../theme';
import type { MoodType } from '../theme';

export interface Vinyl {
  id: string;
  coverUrl: string;
  artist: string;
  album: string;
  mood?: MoodType;
  year?: number;
  genres?: string[];
  addedAt?: string;
}

interface VinylGridProps {
  vinyls: Vinyl[];
  onVinylPress: (id: string) => void;
  onVinylLongPress?: (id: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const VinylGrid: React.FC<VinylGridProps> = ({
  vinyls,
  onVinylPress,
  onVinylLongPress,
  refreshing,
  onRefresh,
}) => {
  const handlePress = useCallback((id: string) => {
    onVinylPress(id);
  }, [onVinylPress]);

  const handleLongPress = useCallback((id: string) => {
    onVinylLongPress?.(id);
  }, [onVinylLongPress]);

  const renderItem: ListRenderItem<Vinyl> = useCallback(({ item }) => (
    <View style={styles.itemContainer}>
      <VinylCard
        id={item.id}
        coverUrl={item.coverUrl}
        artist={item.artist}
        album={item.album}
        mood={item.mood}
        onPress={() => handlePress(item.id)}
        onLongPress={onVinylLongPress ? () => handleLongPress(item.id) : undefined}
      />
    </View>
  ), [handlePress, handleLongPress, onVinylLongPress]);

  const keyExtractor = useCallback((item: Vinyl) => item.id, []);

  return (
    <FlatList
      data={vinyls}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120, // Space for floating nav bar
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  itemContainer: {
    flex: 1,
    maxWidth: '48%',
  },
});
