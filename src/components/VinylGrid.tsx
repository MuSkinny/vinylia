import React from 'react';
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
  const renderItem: ListRenderItem<Vinyl> = ({ item }) => (
    <View style={styles.itemContainer}>
      <VinylCard
        id={item.id}
        coverUrl={item.coverUrl}
        artist={item.artist}
        album={item.album}
        mood={item.mood}
        onPress={() => onVinylPress(item.id)}
        onLongPress={onVinylLongPress ? () => onVinylLongPress(item.id) : undefined}
      />
    </View>
  );

  return (
    <FlatList
      data={vinyls}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
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
    paddingBottom: 80, // Space for bottom nav
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
