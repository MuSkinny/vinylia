import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { vinylService } from '@/services/vinyl-service';
import { VinylGrid, EmptyState } from '@/components';
import { colors, typography, spacing } from '@/theme';
import type { Vinyl } from '@/components/VinylGrid';
import type { MoodType } from '@/theme';

type FilterType = 'all' | 'recent' | 'moods' | 'years';

export default function LibraryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const { data: library = [], isLoading, refetch } = useQuery({
    queryKey: ['library', user?.id],
    queryFn: () => vinylService.getUserLibrary(user!.id),
    enabled: !!user,
  });

  // Transform library data to match Vinyl interface
  const vinyls: Vinyl[] = library.map((item: any) => ({
    id: item.id,
    coverUrl: item.vinyl?.cover_art_thumb_url || item.vinyl?.cover_art_url || '',
    artist: item.vinyl?.artist || 'Unknown Artist',
    album: item.vinyl?.album || 'Unknown Album',
    mood: item.mood as MoodType | undefined,
  }));

  const handleVinylPress = (id: string) => {
    router.push({
      pathname: '/my-vinyl-detail',
      params: { userVinylId: id },
    });
  };

  const handleAddVinyl = () => {
    router.push('/search');
  };

  const filters = [
    { id: 'all' as const, label: 'All' },
    { id: 'recent' as const, label: 'Recently Added' },
    { id: 'moods' as const, label: 'By Mood' },
    { id: 'years' as const, label: 'By Year' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Vinylia</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/search')}
            accessible={true}
            accessibilityLabel="Search library"
          >
            <Search size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      {vinyls.length > 0 && (
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterPill,
                  activeFilter === filter.id && styles.filterPillActive,
                ]}
                onPress={() => setActiveFilter(filter.id)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={filter.label}
                accessibilityState={{ selected: activeFilter === filter.id }}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter.id && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Count */}
      {vinyls.length > 0 && (
        <View style={styles.countContainer}>
          <Text style={styles.countText}>{vinyls.length} records</Text>
        </View>
      )}

      {/* Content */}
      {vinyls.length === 0 ? (
        <EmptyState
          icon="🎵"
          heading="Your collection is waiting"
          body="Every record tells a story. Add your first vinyl to begin."
          actionLabel="Add Your First Record"
          onAction={handleAddVinyl}
        />
      ) : (
        <VinylGrid
          vinyls={vinyls}
          onVinylPress={handleVinylPress}
          refreshing={isLoading}
          onRefresh={() => refetch()}
        />
      )}

      {/* Floating Add Button */}
      {vinyls.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddVinyl}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Add vinyl to library"
        >
          <Plus size={24} color={colors.text.inverse} />
        </TouchableOpacity>
      )}
    </View>
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
    paddingTop: 48,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    padding: spacing.sm,
  },
  filtersContainer: {
    paddingBottom: spacing.md,
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterPill: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.divider.light,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: colors.interactive.primary,
    borderWidth: 0,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.text.inverse,
  },
  countContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  countText: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.interactive.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
});
