import React, { useState, useMemo } from 'react';
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

type FilterType = 'all' | 'recent' | 'artist' | 'year' | 'genre';

export default function LibraryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const { data: library = [], isLoading, refetch } = useQuery({
    queryKey: ['library', user?.id],
    queryFn: () => vinylService.getUserLibraryBasic(user!.id),
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Transform library data to match Vinyl interface with additional filter data
  const vinyls: Vinyl[] = useMemo(() =>
    library.map((item: any) => ({
      id: item.id,
      coverUrl: item.vinyl?.cover_art_thumb_url || item.vinyl?.cover_art_url || '',
      artist: item.vinyl?.artist || 'Unknown Artist',
      album: item.vinyl?.album || 'Unknown Album',
      mood: item.mood as MoodType | undefined,
      year: item.vinyl?.year,
      genres: item.vinyl?.genres || [],
      addedAt: item.added_at,
    }))
  , [library]);

  // Extract unique values for filters
  const uniqueArtists = useMemo(() =>
    Array.from(new Set(vinyls.map(v => v.artist).filter(Boolean))).sort()
  , [vinyls]);

  const uniqueYears = useMemo(() =>
    Array.from(
      new Set(vinyls.map(v => v.year).filter((y): y is number => y !== undefined && y !== null))
    ).sort((a, b) => b - a)
  , [vinyls]);

  const uniqueGenres = useMemo(() =>
    Array.from(new Set(vinyls.flatMap(v => v.genres || []).filter(Boolean))).sort()
  , [vinyls]);

  // Apply filters with memoization
  const filteredVinyls = useMemo(() => {
    let result = [...vinyls];

    switch (activeFilter) {
      case 'recent':
        // Sort by recently added (most recent first)
        result.sort((a, b) => {
          const dateA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
          const dateB = b.addedAt ? new Date(b.addedAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'artist':
        if (selectedArtist) {
          result = result.filter(v => v.artist === selectedArtist);
        }
        // Sort alphabetically by artist, then by album
        result.sort((a, b) => {
          const artistCompare = a.artist.localeCompare(b.artist);
          return artistCompare !== 0 ? artistCompare : a.album.localeCompare(b.album);
        });
        break;
      case 'year':
        if (selectedYear) {
          result = result.filter(v => v.year === selectedYear);
        }
        // Sort by year (newest first), then by artist
        result.sort((a, b) => {
          const yearCompare = (b.year || 0) - (a.year || 0);
          return yearCompare !== 0 ? yearCompare : a.artist.localeCompare(b.artist);
        });
        break;
      case 'genre':
        if (selectedGenre) {
          result = result.filter(v => v.genres?.includes(selectedGenre));
        }
        // Sort alphabetically by artist
        result.sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      case 'all':
      default:
        // Default sort by recently added
        result.sort((a, b) => {
          const dateA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
          const dateB = b.addedAt ? new Date(b.addedAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    return result;
  }, [vinyls, activeFilter, selectedArtist, selectedYear, selectedGenre]);

  const handleVinylPress = (id: string) => {
    router.push({
      pathname: '/my-vinyl-detail',
      params: { userVinylId: id },
    });
  };

  const handleAddVinyl = () => {
    router.push('/search');
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    // Reset selections when changing filter
    setSelectedArtist(null);
    setSelectedYear(null);
    setSelectedGenre(null);
  };

  const filters = [
    { id: 'all' as const, label: 'All' },
    { id: 'recent' as const, label: 'Recently Added' },
    { id: 'artist' as const, label: 'By Artist' },
    { id: 'year' as const, label: 'By Year' },
    { id: 'genre' as const, label: 'By Genre' },
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
                onPress={() => handleFilterChange(filter.id)}
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

      {/* Secondary Filters */}
      {vinyls.length > 0 && activeFilter === 'artist' && uniqueArtists.length > 0 && (
        <View style={styles.secondaryFiltersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            <TouchableOpacity
              style={[
                styles.filterPill,
                !selectedArtist && styles.filterPillActive,
              ]}
              onPress={() => setSelectedArtist(null)}
            >
              <Text
                style={[
                  styles.filterText,
                  !selectedArtist && styles.filterTextActive,
                ]}
              >
                All Artists
              </Text>
            </TouchableOpacity>
            {uniqueArtists.map((artist) => (
              <TouchableOpacity
                key={artist}
                style={[
                  styles.filterPill,
                  selectedArtist === artist && styles.filterPillActive,
                ]}
                onPress={() => setSelectedArtist(artist)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedArtist === artist && styles.filterTextActive,
                  ]}
                >
                  {artist}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {vinyls.length > 0 && activeFilter === 'year' && uniqueYears.length > 0 && (
        <View style={styles.secondaryFiltersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            <TouchableOpacity
              style={[
                styles.filterPill,
                !selectedYear && styles.filterPillActive,
              ]}
              onPress={() => setSelectedYear(null)}
            >
              <Text
                style={[
                  styles.filterText,
                  !selectedYear && styles.filterTextActive,
                ]}
              >
                All Years
              </Text>
            </TouchableOpacity>
            {uniqueYears.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.filterPill,
                  selectedYear === year && styles.filterPillActive,
                ]}
                onPress={() => setSelectedYear(year)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedYear === year && styles.filterTextActive,
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {vinyls.length > 0 && activeFilter === 'genre' && uniqueGenres.length > 0 && (
        <View style={styles.secondaryFiltersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            <TouchableOpacity
              style={[
                styles.filterPill,
                !selectedGenre && styles.filterPillActive,
              ]}
              onPress={() => setSelectedGenre(null)}
            >
              <Text
                style={[
                  styles.filterText,
                  !selectedGenre && styles.filterTextActive,
                ]}
              >
                All Genres
              </Text>
            </TouchableOpacity>
            {uniqueGenres.map((genre) => (
              <TouchableOpacity
                key={genre}
                style={[
                  styles.filterPill,
                  selectedGenre === genre && styles.filterPillActive,
                ]}
                onPress={() => setSelectedGenre(genre)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedGenre === genre && styles.filterTextActive,
                  ]}
                >
                  {genre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Count */}
      {vinyls.length > 0 && (
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {filteredVinyls.length} {filteredVinyls.length === 1 ? 'record' : 'records'}
            {filteredVinyls.length !== vinyls.length && ` (${vinyls.length} total)`}
          </Text>
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
          vinyls={filteredVinyls}
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
  secondaryFiltersContainer: {
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
    bottom: 110,
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
